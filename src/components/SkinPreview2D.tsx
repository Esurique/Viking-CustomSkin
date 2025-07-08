import React, { useEffect, useRef } from "react";
import { useSkinStore } from "../store/skinStore";

// Les mêmes parties et partOptions que dans SkinEditor
const PARTS = [
  { key: "body", label: "Corps" },
  { key: "hairs", label: "Cheveux" },
  { key: "eyes", label: "Yeux" },
  { key: "nose", label: "Nez" },
  { key: "mouth", label: "Bouche" },
  { key: "clothes", label: "Vêtements" },
  { key: "accessories", label: "Accessoires" },
];

// Mapping dynamique des assets comme dans SkinEditor
const corpsAssets = import.meta.glob('../assets/corps/*.png', { eager: true, import: 'default', query: '?url' });
const cheveuxAssets = import.meta.glob('../assets/cheveux/*.png', { eager: true, import: 'default', query: '?url' });
const yeuxPaupiere = import.meta.glob('../assets/yeux/*/paupiere.png', { eager: true, import: 'default', query: '?url' });
const yeuxBlanc = import.meta.glob('../assets/yeux/*/blanc.png', { eager: true, import: 'default', query: '?url' });
const yeuxPupille = import.meta.glob('../assets/yeux/*/pupille.png', { eager: true, import: 'default', query: '?url' });
const nezAssets = import.meta.glob('../assets/nez/*.png', { eager: true, import: 'default', query: '?url' });
const boucheAssets = import.meta.glob('../assets/bouche/*.png', { eager: true, import: 'default', query: '?url' });
const vetementAssets = import.meta.glob('../assets/vetement/*.png', { eager: true, import: 'default', query: '?url' });
const accessoireAssets = import.meta.glob('../assets/accessoire/*.png', { eager: true, import: 'default', query: '?url' });

function assetsToOptions(obj: Record<string, unknown>, label: string) {
  return Object.entries(obj).map(([_, url], idx) => ({
    id: `${label}${idx+1}`,
    label: `${label.charAt(0).toUpperCase() + label.slice(1)} ${idx+1}`,
    img: url as string
  }));
}

const yeuxVariants = Array.from(new Set([
  ...Object.keys(yeuxPaupiere),
  ...Object.keys(yeuxBlanc),
  ...Object.keys(yeuxPupille)
].map(path => path.split('/').slice(-2, -1)[0])));

const yeuxAssets: Record<string, { paupiere: string; blanc: string; pupille: string }> = {};
yeuxVariants.forEach(variant => {
  const paupierePath = Object.keys(yeuxPaupiere).find(p => p.includes(`/${variant}/paupiere.png`));
  const blancPath = Object.keys(yeuxBlanc).find(p => p.includes(`/${variant}/blanc.png`));
  const pupillePath = Object.keys(yeuxPupille).find(p => p.includes(`/${variant}/pupille.png`));
  yeuxAssets[variant] = {
    paupiere: paupierePath ? (yeuxPaupiere[paupierePath] as string) : '',
    blanc: blancPath ? (yeuxBlanc[blancPath] as string) : '',
    pupille: pupillePath ? (yeuxPupille[pupillePath] as string) : '',
  };
});

const partOptions: Record<string, { id: string; label: string; img: string }[]> = {
  body: assetsToOptions(corpsAssets, 'corps'),
  hairs: assetsToOptions(cheveuxAssets, 'cheveux'),
  eyes: assetsToOptions(yeuxAssets, 'yeux'),
  nose: assetsToOptions(nezAssets, 'nez'),
  mouth: assetsToOptions(boucheAssets, 'bouche'),
  clothes: assetsToOptions(vetementAssets, 'vetement'),
  accessories: assetsToOptions(accessoireAssets, 'accessoire'),
};

const imageCache: Record<string, HTMLImageElement> = {};
let tempCanvas: HTMLCanvasElement = document.createElement('canvas');
tempCanvas.width = 256;
tempCanvas.height = 256;

// Fonction utilitaire pour choisir le mode de fusion avancé supporté
function getSupportedBlendMode(ctx: CanvasRenderingContext2D, preferred: GlobalCompositeOperation, fallback: GlobalCompositeOperation): GlobalCompositeOperation {
  ctx.save();
  ctx.globalCompositeOperation = preferred;
  const isSupported = ctx.globalCompositeOperation === preferred;
  ctx.restore();
  return isSupported ? preferred : fallback;
}

const SkinPreview2D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { layers, colors, setLayer } = useSkinStore();

  // Ajout : dispatcher l'événement dès le montage pour le 3D
  useEffect(() => {
    window.dispatchEvent(new Event('skin2d-ready'));
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 256, 256);
    ctx.globalCompositeOperation = "source-over";

    // Préparer toutes les images à charger (corps + accessoires)
    const imagesToLoad: Promise<void>[] = [];
    const imageMap: Record<string, HTMLImageElement> = {};
    // Corps
    const bodyIdx = PARTS.findIndex(p => p.key === 'body');
    const bodyId = layers[bodyIdx];
    const bodyOpts = partOptions['body'] || [];
    const body = bodyOpts.find(opt => opt.id === bodyId) || bodyOpts[0];
    if (body && body.img) {
      imagesToLoad.push(new Promise(resolve => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = body.img;
        img.onload = () => { imageMap['body'] = img; resolve(); };
        img.onerror = () => resolve();
      }));
    }
    // Autres assets
    PARTS.forEach((part, idx) => {
      if (part.key === 'body') return;
      const selectedId = layers[idx];
      const opts = partOptions[part.key] || [];
      const selected = opts.find(opt => opt.id === selectedId) || opts[0];
      if (selected && selected.img) {
        imagesToLoad.push(new Promise(resolve => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.src = selected.img;
          img.onload = () => { imageMap[part.key] = img; resolve(); };
          img.onerror = () => resolve();
        }));
      }
    });
    // Quand toutes les images sont prêtes, on dessine dans l'ordre
    Promise.all(imagesToLoad).then(() => {
      // Corps
      if (imageMap['body'] && imageMap['body'].complete && imageMap['body'].naturalWidth > 0) {
        ctx.drawImage(imageMap['body'], 0, 0, 256, 256);
      }
      // Autres assets
      PARTS.forEach((part) => {
        if (part.key === 'body') return;
        const img = imageMap[part.key];
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, 0, 0, 256, 256);
        }
      });
      window.dispatchEvent(new Event('skin2d-ready'));
    });
  }, [layers, colors, setLayer]);

  return (
    <div className="bg-gray-800/80 rounded-lg p-4 mb-4 shadow-lg flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2 text-blue-300">Aperçu 2D</h2>
      <div className="border-4 border-yellow-400 rounded-lg bg-gray-900 p-2 shadow-inner animate-fade-in relative overflow-hidden">
        {/* Dégradé noir en bas */}
        <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-12" style={{background: 'linear-gradient(to top, #000 80%, transparent 100%)'}} />
        <canvas
          id="skin-canvas-2d"
          ref={canvasRef}
          width={256}
          height={256}
          className="block mx-auto rounded transition-all duration-300"
          style={{ imageRendering: "pixelated", width: 256, height: 256 }}
        />
      </div>
    </div>
  );
};

export default SkinPreview2D; 
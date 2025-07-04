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

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Taille du skin Minecraft HD
    ctx.clearRect(0, 0, 256, 256);
    ctx.globalCompositeOperation = "source-over" as GlobalCompositeOperation;

    // Blend mode avancé pour la colorisation
    const blendMode = getSupportedBlendMode(ctx, "overlay", "multiply") as GlobalCompositeOperation;

    // 1. Dessiner steve.png comme base (en HD si dispo, sinon upscalé)
    const steveUrl = new URL('../assets/steve.png', import.meta.url).href;
    const baseSkin = imageCache['steve'] || new window.Image();
    if (!imageCache['steve']) {
      baseSkin.src = steveUrl;
      imageCache['steve'] = baseSkin;
    }
    baseSkin.onload = () => {
      ctx.drawImage(baseSkin, 0, 0, 256, 256);
      // Appliquer la couleur de peau sur tout le skin avec une opacité de 0.7
      if (colors.skin) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
        ctx.fillStyle = colors.skin;
        ctx.fillRect(0, 0, 256, 256);
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = "source-over" as GlobalCompositeOperation;
        ctx.restore();
      }
      // Les assets sont ajoutés APRÈS la peau, donc toujours au-dessus
      let toLoad = 0;
      let loaded = 0;
      const onAssetLoaded = () => {
        loaded++;
        if (loaded === toLoad) {
          window.dispatchEvent(new Event('skin2d-ready'));
        }
      };
      PARTS.forEach((part, idx) => {
        const selectedId = layers[idx];
        const opts = partOptions[part.key] || [];
        console.log(`[2D] PART: ${part.key}, idx: ${idx}, selectedId: ${selectedId}, opts:`, opts.map(o => o.id));
        let selected = opts.find(opt => opt.id === selectedId) || opts[0];
        // Correction auto : si l'ID n'existe pas, corriger le layer dans le state
        if (opts.length > 0 && !opts.find(opt => opt.id === selectedId)) {
          console.warn(`[2D] Correction: ID '${selectedId}' inexistant pour '${part.key}', fallback sur '${opts[0].id}'`);
          setLayer(opts[0].id, idx);
          selected = opts[0];
        }
        if (!selected || !selected.img) {
          console.error(`[2D] Aucun asset sélectionné pour '${part.key}' (selectedId: ${selectedId})`);
          return;
        }
        console.log(`[2D] Asset utilisé pour '${part.key}':`, selected.id, selected.img);
        // Typage pour _variant
        const selectedWithVariant = selected as typeof selected & { _variant?: string };
        if (part.key === 'body') {
          // Afficher l'asset du corps et appliquer la couleur de peau dessus
          toLoad++;
          const img = imageCache[selected.img] || new window.Image();
          if (!imageCache[selected.img]) {
            img.crossOrigin = "anonymous";
            img.src = selected.img;
            imageCache[selected.img] = img;
          }
          const drawBody = () => {
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              // 1. Dessiner l'asset du corps
              tempCtx.clearRect(0, 0, 256, 256);
              tempCtx.drawImage(img, 0, 0, 256, 256);

              // 2. Sauvegarder l'alpha d'origine dans un autre canvas
              const maskCanvas = document.createElement('canvas');
              maskCanvas.width = 256;
              maskCanvas.height = 256;
              const maskCtx = maskCanvas.getContext('2d');
              maskCtx && maskCtx.drawImage(img, 0, 0, 256, 256);

              // 3. Teinter avec blendMode avancé
              if (colors.skin) {
                tempCtx.save();
                tempCtx.globalAlpha = 0.60;
                tempCtx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
                tempCtx.fillStyle = colors.skin;
                tempCtx.fillRect(0, 0, 256, 256);
                tempCtx.globalAlpha = 1.0;
                tempCtx.globalCompositeOperation = 'source-over' as GlobalCompositeOperation;
                tempCtx.restore();
              }

              // 4. Appliquer le masque alpha d'origine
              tempCtx.save();
              tempCtx.globalCompositeOperation = 'destination-in' as GlobalCompositeOperation;
              tempCtx.drawImage(maskCanvas, 0, 0, 256, 256);
              tempCtx.globalCompositeOperation = 'source-over' as GlobalCompositeOperation;
              tempCtx.restore();

              // 5. Dessiner sur le canvas principal
              ctx.drawImage(tempCanvas, 0, 0, 256, 256);
            }
            onAssetLoaded();
          };
          img.onload = drawBody;
          if (img.complete) drawBody();
          img.onerror = onAssetLoaded;
          return;
        }
        if (part.key === 'eyes') {
          const variant = selectedWithVariant._variant || selectedWithVariant.id.replace('yeux', 'yeux');
          const assets = yeuxAssets[variant] || yeuxAssets[Object.keys(yeuxAssets)[0]];
          if (!assets) return;
          let toLoadEyes = 3, loadedEyes = 0;
          const onEyeLayerLoaded = () => {
            loadedEyes++;
            if (loadedEyes === toLoadEyes) onAssetLoaded();
          };
          // Pour chaque calque (paupiere, blanc, pupille)
          ['paupiere','blanc','pupille'].forEach(key => {
            const k = key as 'paupiere' | 'blanc' | 'pupille';
            const img = imageCache[assets[k]] || new window.Image();
            if (!imageCache[assets[k]]) {
              img.crossOrigin = "anonymous";
              img.src = assets[k];
              imageCache[assets[k]] = img;
            }
            const drawEyeLayer = () => {
              const tempCtx = tempCanvas.getContext('2d');
              if (tempCtx) {
                tempCtx.clearRect(0, 0, 256, 256);
                tempCtx.drawImage(img, 0, 0, 256, 256);
                if (colors[`eyes_${key}`]) {
                  tempCtx.save();
                  tempCtx.globalAlpha = 0.5;
                  tempCtx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
                  tempCtx.fillStyle = colors[`eyes_${key}`];
                  tempCtx.fillRect(0, 0, 256, 256);
                  tempCtx.globalAlpha = 1.0;
                  // Appliquer le masque alpha de l'asset
                  tempCtx.globalCompositeOperation = 'destination-in' as GlobalCompositeOperation;
                  tempCtx.drawImage(img, 0, 0, 256, 256);
                  tempCtx.globalCompositeOperation = 'source-over' as GlobalCompositeOperation;
                  tempCtx.restore();
                }
                ctx.drawImage(tempCanvas, 0, 0, 256, 256);
              }
              onEyeLayerLoaded();
            };
            img.onload = drawEyeLayer;
            if (img.complete) drawEyeLayer();
            img.onerror = onEyeLayerLoaded;
          });
          toLoad++; // pour la logique globale
          return; // on ne fait pas le reste pour eyes
        }
        toLoad++;
        const img = imageCache[selected.img] || new window.Image();
        if (!imageCache[selected.img]) {
          img.crossOrigin = "anonymous";
          img.src = selected.img;
          imageCache[selected.img] = img;
        }
        const drawAsset = () => {
          // Canvas temporaire pour colorer uniquement l'asset
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.clearRect(0, 0, 256, 256);
            tempCtx.drawImage(img, 0, 0, 256, 256);
            if (colors[part.key]) {
              tempCtx.save();
              tempCtx.globalAlpha = part.key === 'hairs' ? 0.6 : 0.5;
              tempCtx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
              tempCtx.fillStyle = colors[part.key];
              tempCtx.fillRect(0, 0, 256, 256);
              tempCtx.globalAlpha = 1.0;
              // Appliquer le masque alpha de l'asset
              tempCtx.globalCompositeOperation = 'destination-in' as GlobalCompositeOperation;
              tempCtx.drawImage(img, 0, 0, 256, 256);
              tempCtx.globalCompositeOperation = 'source-over' as GlobalCompositeOperation;
              tempCtx.restore();
            }
            // Dessine le calque coloré sur le canvas principal
            ctx.drawImage(tempCanvas, 0, 0, 256, 256);
          }
          onAssetLoaded();
        };
        img.onload = drawAsset;
        if (img.complete) drawAsset();
        img.onerror = onAssetLoaded;
      });
      if (toLoad === 0) {
        // Aucun asset à charger, skin prêt
        window.dispatchEvent(new Event('skin2d-ready'));
      }
      // Sécurité : dispatcher toujours l'événement même si aucun asset n'est chargé
      if (toLoad === 0) {
        window.dispatchEvent(new Event('skin2d-ready'));
      }
    };
    if (baseSkin.complete) baseSkin.onload && baseSkin.onload(null as any);
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
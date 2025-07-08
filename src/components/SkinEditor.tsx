import React, { useState } from "react";
import SkinPreview2D from "./SkinPreview2D";
import SkinPreview3D from "./SkinPreview3D";
import { useSkinStore } from "../store/skinStore";

// Nouvelle liste de catégories et mapping pour variantes et couleurs
const PARTS = [
  { key: "body", label: "Corps" },
  { key: "hairs", label: "Cheveux" },
  { key: "eyes", label: "Yeux" },
  { key: "nose", label: "Nez" },
  { key: "mouth", label: "Bouche" },
  { key: "clothes", label: "Vêtements" },
  { key: "accessories", label: "Accessoires" },
];

// Import statique des assets par dossier (Vite n'accepte pas de glob dynamique)
const corpsAssets = import.meta.glob('../assets/corps/*.png', { eager: true, import: 'default', query: '?url' });
const cheveuxAssets = import.meta.glob('../assets/cheveux/*.png', { eager: true, import: 'default', query: '?url' });
const yeuxFolders = import.meta.glob('../assets/yeux/*/', { eager: true });
const yeuxVariants = Object.keys(yeuxFolders).map(folder => folder.split('/').slice(-2, -1)[0]);
const nezAssets = import.meta.glob('../assets/nez/*.png', { eager: true, import: 'default', query: '?url' });
const boucheAssets = import.meta.glob('../assets/bouche/*.png', { eager: true, import: 'default', query: '?url' });
const vetementAssets = import.meta.glob('../assets/vetement/*.png', { eager: true, import: 'default', query: '?url' });
const accessoireAssets = import.meta.glob('../assets/accessoire/*.png', { eager: true, import: 'default', query: '?url' });

console.log('corpsAssets', corpsAssets);
console.log('cheveuxAssets', cheveuxAssets);
console.log('yeuxFolders', yeuxFolders);
console.log('yeuxVariants', yeuxVariants);
console.log('nezAssets', nezAssets);
console.log('boucheAssets', boucheAssets);
console.log('vetementAssets', vetementAssets);
console.log('accessoireAssets', accessoireAssets);

// Import dynamique des variantes d'yeux (dossiers yeux1, yeux2, ...)
const yeuxPaupiere = import.meta.glob('../assets/yeux/*/paupiere.png', { eager: true, import: 'default', query: '?url' });
const yeuxBlanc = import.meta.glob('../assets/yeux/*/blanc.png', { eager: true, import: 'default', query: '?url' });
const yeuxPupille = import.meta.glob('../assets/yeux/*/pupille.png', { eager: true, import: 'default', query: '?url' });

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

function assetsToOptions(obj: Record<string, unknown>, label: string) {
  return Object.entries(obj).map(([_, url], idx) => ({
    id: `${label}${idx+1}`,
    label: `${label.charAt(0).toUpperCase() + label.slice(1)} ${idx+1}`,
    img: url as string
  }));
}

type PartOptionsType = {
  [key: string]: { id: string; label: string; img: string }[];
};

const partOptions: PartOptionsType = {
  body: assetsToOptions(corpsAssets, 'corps'),
  hairs: assetsToOptions(cheveuxAssets, 'cheveux'),
  eyes: yeuxVariants.map((variant, idx) => ({
    id: `yeux${idx+1}`,
    label: `Yeux ${idx+1}`,
    img: yeuxAssets[variant].paupiere, // Pour l'aperçu du carrousel, on montre la paupière
    _variant: variant,
  })),
  nose: assetsToOptions(nezAssets, 'nez'),
  mouth: assetsToOptions(boucheAssets, 'bouche'),
  clothes: assetsToOptions(vetementAssets, 'vetement'),
  accessories: assetsToOptions(accessoireAssets, 'accessoire'),
};

// Regroupement des parties en catégories principales
const CATEGORIES = [
  {
    key: "visage",
    label: "Visage",
    parts: ["hairs", "eyes", "nose", "mouth"],
  },
  {
    key: "corps",
    label: "Corps",
    parts: ["body", "clothes", "accessories"],
  },
];

const WoWVariantSelector = () => {
  const { layers, setLayer, colors, setColor } = useSkinStore();
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [tempColor, setTempColor] = useState<string>("");
  const [fadeKey, setFadeKey] = useState(0); // pour l'animation de fondu
  const [openCategory, setOpenCategory] = useState<string | null>(CATEGORIES[0].key);

  // Animation utilitaire
  const getPanelClass = (isOpen: boolean) =>
    `transition-all duration-400 overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`;

  return (
    <div className="flex fixed left-0 top-0 bottom-0 z-20">
      {/* Sidebar contenu */}
      <div className="flex flex-col gap-4 w-full sm:w-64 lg:w-72 min-h-screen bg-gradient-to-br from-[#23243a] to-[#1a2340] border-r-4 border-yellow-600 rounded-r-lg px-3 shadow-inner shadow-2xl items-center overflow-y-auto"
        style={{ boxShadow: '0 0 16px 0 #ffe06688' }}>
        {/* Sélecteur couleur de peau compact en haut */}
        <div className="w-full flex flex-col items-center mb-2">
          <span className="font-cinzel text-yellow-200 text-sm mb-1">Peau</span>
          <button
            className="w-8 h-8 rounded-full border-2 border-yellow-500 shadow"
            style={{ background: colors.skin || "#f2c29a" }}
            onClick={() => { setTempColor(colors.skin || "#f2c29a"); setOpenPicker("skin"); }}
            aria-label="Choisir la couleur de peau"
          />
          {openPicker === "skin" && (
            <div className="absolute z-30 mt-2 left-1/2 -translate-x-1/2 bg-gray-900 p-2 rounded-lg shadow-lg border border-gray-700 flex flex-col items-center animate-fade-in">
              <input
                type="color"
                value={tempColor || colors.skin || "#f2c29a"}
                onChange={e => {
                  setTempColor(e.target.value);
                  setColor("skin", e.target.value); // Applique la couleur en live
                }}
                className="w-12 h-12 border-none bg-transparent cursor-pointer mb-2"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  className="wow-btn px-2 py-1 text-xs"
                  onClick={() => setOpenPicker(null)}
                >Valider</button>
                <button
                  className="wow-btn bg-gray-700 text-yellow-200 border-gray-600 hover:bg-gray-600 px-2 py-1 text-xs"
                  onClick={() => setOpenPicker(null)}
                >Annuler</button>
              </div>
            </div>
          )}
        </div>
        {/* Catégories principales */}
        <div className="w-full flex flex-col gap-2">
          {CATEGORIES.map((cat) => {
            const isOpen = openCategory === cat.key;
            return (
              <div key={cat.key} className="w-full mb-2">
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#23243a] border-2 border-yellow-700 text-yellow-200 font-cinzel text-base shadow hover:bg-[#2d2e4a] transition-all duration-200 ${isOpen ? 'bg-yellow-900/30 border-yellow-400' : ''}`}
                  onClick={() => setOpenCategory(isOpen ? null : cat.key)}
                  aria-expanded={isOpen}
                >
                  <span className="tracking-wider uppercase text-yellow-300 font-bold">{cat.label}</span>
                  <svg className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} width="18" height="18" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="#f6e27a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div className={getPanelClass(isOpen)}>
                  {/* Affichage des assets de chaque sous-partie de la catégorie */}
                  {cat.parts.map((partKey) => {
                    const part = PARTS.find(p => p.key === partKey);
                    if (!part) return null;
                    const partIdx = PARTS.findIndex(p => p.key === partKey);
                    const opts = partOptions[part.key] || [];
                    const selectedIdx = opts.findIndex(opt => opt.id === layers[partIdx]);
                    let selected = opts.length > 0 ? (selectedIdx !== -1 ? opts[selectedIdx] : opts[0]) : undefined;
                    if (opts.length > 0 && selectedIdx === -1 && selected) {
                      setLayer(selected.id, partIdx);
                    }
                    const prev = () => {
                      if (!opts.length) return;
                      const idx = selectedIdx !== -1 ? selectedIdx : 0;
                      let newIdx = (idx - 1 + opts.length) % opts.length;
                      if (!opts[newIdx]) newIdx = 0;
                      setLayer(opts[newIdx].id, partIdx);
                      setFadeKey(fadeKey + 1);
                    };
                    const next = () => {
                      if (!opts.length) return;
                      const idx = selectedIdx !== -1 ? selectedIdx : 0;
                      let newIdx = (idx + 1) % opts.length;
                      if (!opts[newIdx]) newIdx = 0;
                      setLayer(opts[newIdx].id, partIdx);
                      setFadeKey(fadeKey + 1);
                    };
                    return (
                      <div key={part.key} className="w-full mb-2 px-2 pt-2 border-b border-yellow-900 last:border-b-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-cinzel text-yellow-200 w-20 text-xs sm:text-sm lg:text-base whitespace-nowrap">{part.label}</span>
                          {part.key === 'body' ? null : part.key === 'eyes' ? (
                            <div className="flex gap-1 items-center ml-auto">
                              <button
                                className="w-8 h-8 rounded-md border-2 border-yellow-500 shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-150"
                                style={{ background: colors.eyes_paupiere || '#c2a280' }}
                                onClick={() => { setTempColor(colors.eyes_paupiere || '#c2a280'); setOpenPicker('eyes_paupiere'); }}
                                aria-label="Choisir la couleur de la paupière"
                              />
                              {openPicker === 'eyes_paupiere' && (
                                <div className="absolute z-30 mt-2 left-1/2 -translate-x-1/2 bg-gray-900 p-2 rounded-lg shadow-lg border border-gray-700 flex flex-col items-center animate-fade-in">
                                  <input
                                    type="color"
                                    value={tempColor || colors.eyes_paupiere || '#c2a280'}
                                    onChange={e => setTempColor(e.target.value)}
                                    className="w-12 h-12 border-none bg-transparent cursor-pointer mb-2"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      className="wow-btn px-2 py-1 text-xs"
                                      onClick={() => { setColor('eyes_paupiere', tempColor || colors.eyes_paupiere || '#c2a280'); setOpenPicker(null); }}
                                    >Valider</button>
                                    <button
                                      className="wow-btn bg-gray-700 text-yellow-200 border-gray-600 hover:bg-gray-600 px-2 py-1 text-xs"
                                      onClick={() => setOpenPicker(null)}
                                    >Annuler</button>
                                  </div>
                                </div>
                              )}
                              <button
                                className="w-8 h-8 rounded-md border-2 border-yellow-500 shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-150"
                                style={{ background: colors.eyes_blanc || '#ffffff' }}
                                onClick={() => { setTempColor(colors.eyes_blanc || '#ffffff'); setOpenPicker('eyes_blanc'); }}
                                aria-label="Choisir la couleur du blanc de l'œil"
                              />
                              {openPicker === 'eyes_blanc' && (
                                <div className="absolute z-30 mt-2 left-1/2 -translate-x-1/2 bg-gray-900 p-2 rounded-lg shadow-lg border border-gray-700 flex flex-col items-center animate-fade-in">
                                  <input
                                    type="color"
                                    value={tempColor || colors.eyes_blanc || '#ffffff'}
                                    onChange={e => setTempColor(e.target.value)}
                                    className="w-12 h-12 border-none bg-transparent cursor-pointer mb-2"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      className="wow-btn px-2 py-1 text-xs"
                                      onClick={() => { setColor('eyes_blanc', tempColor || colors.eyes_blanc || '#ffffff'); setOpenPicker(null); }}
                                    >Valider</button>
                                    <button
                                      className="wow-btn bg-gray-700 text-yellow-200 border-gray-600 hover:bg-gray-600 px-2 py-1 text-xs"
                                      onClick={() => setOpenPicker(null)}
                                    >Annuler</button>
                                  </div>
                                </div>
                              )}
                              <button
                                className="w-8 h-8 rounded-md border-2 border-yellow-500 shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-150"
                                style={{ background: colors.eyes_pupille || '#222222' }}
                                onClick={() => { setTempColor(colors.eyes_pupille || '#222222'); setOpenPicker('eyes_pupille'); }}
                                aria-label="Choisir la couleur de la pupille"
                              />
                              {openPicker === 'eyes_pupille' && (
                                <div className="absolute z-30 mt-2 left-1/2 -translate-x-1/2 bg-gray-900 p-2 rounded-lg shadow-lg border border-gray-700 flex flex-col items-center animate-fade-in">
                                  <input
                                    type="color"
                                    value={tempColor || colors.eyes_pupille || '#222222'}
                                    onChange={e => setTempColor(e.target.value)}
                                    className="w-12 h-12 border-none bg-transparent cursor-pointer mb-2"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      className="wow-btn px-2 py-1 text-xs"
                                      onClick={() => { setColor('eyes_pupille', tempColor || colors.eyes_pupille || '#222222'); setOpenPicker(null); }}
                                    >Valider</button>
                                    <button
                                      className="wow-btn bg-gray-700 text-yellow-200 border-gray-600 hover:bg-gray-600 px-2 py-1 text-xs"
                                      onClick={() => setOpenPicker(null)}
                                    >Annuler</button>
                                  </div>
                                </div>
                              )}
                              <button
                                className="ml-1 px-2 py-1 text-xs rounded bg-gray-700 text-yellow-200 border border-yellow-500 hover:bg-yellow-700 hover:text-gray-900 transition"
                                onClick={() => { setColor('eyes_paupiere', ''); setColor('eyes_blanc', ''); setColor('eyes_pupille', ''); }}
                                aria-label="Supprimer la couleur"
                                title="Supprimer la couleur"
                              >✕</button>
                            </div>
                          ) : (
                            <div className="flex gap-1 items-center ml-auto">
                              <button
                                className="w-8 h-8 rounded-md border-2 border-yellow-500 shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-150"
                                style={{ background: (part.key === 'nose' || part.key === 'mouth') ? (colors[part.key] || '#dba079') : (colors[part.key] || '#888') }}
                                onClick={() => { if(selected) { setTempColor(colors[part.key] || (part.key === 'nose' || part.key === 'mouth' ? '#dba079' : '#ffffff')); setOpenPicker(part.key); } }}
                                aria-label={`Choisir la couleur pour ${part.label}`}
                              />
                              {openPicker === part.key && selected && (
                                <div className="absolute z-30 mt-2 left-1/2 -translate-x-1/2 bg-gray-900 p-2 rounded-lg shadow-lg border border-gray-700 flex flex-col items-center animate-fade-in">
                                  <input
                                    type="color"
                                    value={tempColor || colors[part.key] || (part.key === 'nose' || part.key === 'mouth' ? '#dba079' : '#ffffff')}
                                    onChange={e => setTempColor(e.target.value)}
                                    className="w-12 h-12 border-none bg-transparent cursor-pointer mb-2"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      className="wow-btn px-2 py-1 text-xs"
                                      onClick={() => { setColor(part.key, tempColor || colors[part.key] || (part.key === 'nose' || part.key === 'mouth' ? '#dba079' : '#ffffff')); setOpenPicker(null); }}
                                    >Valider</button>
                                    <button
                                      className="wow-btn bg-gray-700 text-yellow-200 border-gray-600 hover:bg-gray-600 px-2 py-1 text-xs"
                                      onClick={() => setOpenPicker(null)}
                                    >Annuler</button>
                                  </div>
                                </div>
                              )}
                              <button
                                className="ml-1 px-2 py-1 text-xs rounded bg-gray-700 text-yellow-200 border border-yellow-500 hover:bg-yellow-700 hover:text-gray-900 transition"
                                onClick={() => setColor(part.key, '')}
                                aria-label="Supprimer la couleur"
                                title="Supprimer la couleur"
                              >✕</button>
                            </div>
                          )}
                        </div>
                        {/* Carrousel stylé compact SOUS la ligne des pickers */}
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={prev}
                            className="w-7 h-7 flex items-center justify-center rounded-full border-2 border-yellow-500 bg-gradient-to-br from-yellow-700/40 to-yellow-900/60 text-yellow-200 shadow hover:scale-110 hover:border-yellow-300 transition-all duration-150"
                            aria-label="Précédent"
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#f6e27a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                          {selected && (
                            <div className="flex flex-col items-center">
                              <div
                                key={fadeKey + part.key}
                                className="w-10 h-10 rounded-xl border-2 border-yellow-400 shadow bg-[#23243a]/80 flex items-center justify-center mb-1 transition-all duration-300 animate-fade-in"
                                style={{ boxShadow: "0 0 12px 2px #bfa04655" }}
                              >
                                {selected.img && <img src={selected.img} alt={selected.label} className="object-contain w-8 h-8 drop-shadow-lg" />}
                              </div>
                              <span className="font-cinzel text-yellow-200 drop-shadow tracking-wide text-[10px] sm:text-xs" style={{ textShadow: "0 0 4px #bfa046, 0 1px 1px #000" }}>{selected.label}</span>
                            </div>
                          )}
                          <button
                            onClick={next}
                            className="w-7 h-7 flex items-center justify-center rounded-full border-2 border-yellow-500 bg-gradient-to-br from-yellow-700/40 to-yellow-900/60 text-yellow-200 shadow hover:scale-110 hover:border-yellow-300 transition-all duration-150"
                            aria-label="Suivant"
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="#f6e27a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {/* Bouton Télécharger en bas de la sidebar */}
        <div className="flex mt-6 w-full justify-center">
          <button
            className="wow-btn bg-green-500 hover:bg-green-600 text-white border-green-700 w-32 sm:w-40 text-sm font-bold py-2 px-4 rounded-xl shadow-lg transition-all duration-150 flex items-center justify-center text-center"
            onClick={() => {
              const canvas = document.getElementById('skin-canvas-2d') as HTMLCanvasElement;
              if (canvas) {
                const link = document.createElement('a');
                link.download = 'skin.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
              }
            }}
          >Télécharger</button>
        </div>
        {/* Logo sous le bouton Télécharger */}
        <div className="flex w-full justify-center mt-4">
          <a
            href="https://viking-rp.fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="block mx-auto"
            style={{width: 'fit-content'}}
          >
            <img
              src="https://image.noelshack.com/fichiers/2025/28/2/1751965977-blanc-2-0.png"
              alt="Logo VikingRP"
              style={{height: 144, width: 'auto', maxWidth: '100%'}}
              className="mx-auto drop-shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:scale-105 logo-shine"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

const SkinEditor: React.FC = () => {
  // On n'a plus besoin de activeMenu ni de logique de panneau central

  return (
    <div className="relative min-h-screen flex items-stretch bg-gradient-to-br from-[#181a20] via-[#23243a] to-[#1a1a2e] overflow-hidden">
      {/* Sidebar variantes à gauche, collée au bord, très grande */}
      <WoWVariantSelector />
      {/* Panneau central : uniquement l'aperçu 3D, avec image de fond */}
      <div className="flex-1 flex items-center justify-center relative z-10 ml-80">
        {/* Image de fond fantasy via URL externe en background CSS */}
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: "url('https://fr-minecraft.net/telecharger.php?id=9774')", // Remplace par ton URL hébergée
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        />
        {/* Rendu 3D au-dessus */}
        <div className="absolute inset-0 w-full h-full z-10">
          <SkinPreview3D />
        </div>
        {/* Miniature 2D en overlay en haut à droite, décalée de la sidebar */}
        <div className="fixed" style={{ right: 100, top: 100, zIndex: 30 }}>
          <div className="mmorp-card p-2 w-36 h-36 flex items-center justify-center border-2 border-yellow-400 bg-[#23243a]/90 shadow-2xl rounded-xl">
            <SkinPreview2D />
          </div>
        </div>
      </div>
      <style>
        {`
          .logo-shine {
            position: relative;
            overflow: hidden;
          }
          .logo-shine::after {
            content: '';
            position: absolute;
            top: 0; left: -75%;
            width: 50%; height: 100%;
            background: linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
            transform: skewX(-20deg);
            transition: left 0.5s;
          }
          .logo-shine:hover::after {
            left: 120%;
            transition: left 0.7s cubic-bezier(.4,2,.6,.7);
          }
        `}
      </style>
    </div>
  );
};

export default SkinEditor; 
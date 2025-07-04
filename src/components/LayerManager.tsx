import React, { useState } from "react";
import { useSkinStore } from "../store/skinStore";

const categories = [
  // { key: "base", label: "Modèle" },
  { key: "faces", label: "Visage" },
  { key: "hairs", label: "Cheveux" },
  { key: "clothes", label: "Vêtements" },
  { key: "accessories", label: "Accessoires" },
];

// Placeholders pour les options de chaque catégorie
const options: Record<string, { id: string; label: string; img: string }[]> = {
  // base: [
  //   { id: "male", label: "Homme", img: "/assets/base/male.png" },
  //   { id: "female", label: "Femme", img: "/assets/base/female.png" },
  // ],
  faces: [
    { id: "face1", label: "Visage 1", img: "/assets/faces/face1.png" },
    { id: "face2", label: "Visage 2", img: "/assets/faces/face2.png" },
  ],
  hairs: [
    { id: "hair1", label: "Cheveux 1", img: "/assets/hairs/hair1.png" },
    { id: "hair2", label: "Cheveux 2", img: "/assets/hairs/hair2.png" },
  ],
  clothes: [
    { id: "clothes1", label: "Vêtement 1", img: "/assets/clothes/clothes1.png" },
    { id: "clothes2", label: "Vêtement 2", img: "/assets/clothes/clothes2.png" },
  ],
  accessories: [
    { id: "acc1", label: "Accessoire 1", img: "/assets/accessories/acc1.png" },
    { id: "acc2", label: "Accessoire 2", img: "/assets/accessories/acc2.png" },
  ],
};

const LayerManager: React.FC = () => {
  const [activeCat, setActiveCat] = useState(categories[0].key);
  const { baseModel, setBaseModel, layers, setLayer } = useSkinStore();

  // Gestion sélection selon catégorie
  const handleSelect = (cat: string, id: string) => {
    const idx = categories.findIndex((c) => c.key === cat);
    setLayer(id, idx);
  };

  // Rendu des options de la catégorie active
  const renderOptions = () => (
    <div className="flex gap-4 flex-wrap justify-center mt-4">
      {(options[activeCat] || []).map((opt) => {
        const selected = layers[categories.findIndex((c) => c.key === activeCat)] === opt.id;
        return (
          <button
            key={opt.id}
            className={`relative group rounded-lg border-2 p-2 transition-all duration-200 shadow-md bg-gray-900/80 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selected ? "border-blue-500 ring-2 ring-blue-400" : "border-gray-700"
            }`}
            onClick={() => handleSelect(activeCat, opt.id)}
          >
            <img
              src={opt.img}
              alt={opt.label}
              className="w-16 h-16 object-contain mb-1 rounded"
              draggable={false}
            />
            <span className="block text-xs text-center font-medium">{opt.label}</span>
            {selected && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="bg-gray-800/80 rounded-lg p-4 mb-4 shadow-lg">
      {renderOptions()}
    </div>
  );
};

export default LayerManager; 
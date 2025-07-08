import React, { useState } from "react";
import { useSkinStore } from "../store/skinStore";

// Parties personnalisables (à adapter selon assets)
const parts = [
  { key: "hairs", label: "Cheveux" },
  { key: "eyes_paupiere", label: "Paupière" },
  { key: "eyes_blanc", label: "Blanc de l'œil" },
  { key: "eyes_pupille", label: "Pupille" },
  { key: "clothes", label: "Vêtements" },
  { key: "accessories", label: "Accessoire" },
];

// Palette de couleurs prédéfinies (exemple)
const presetColors = [
  "#22223b", "#4a4e69", "#9a8c98", "#c9ada7", "#f2e9e4",
  "#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557",
];

const ColorCustomizer: React.FC = () => {
  const { colors, setColor } = useSkinStore();
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [tempColor, setTempColor] = useState<string>("");

  // Color picker simple (input type color) pour démo, à remplacer par react-colorful ou color.js plus tard
  const renderColorPicker = (part: string) => (
    <div className="absolute z-20 mt-2 left-1/2 -translate-x-1/2 bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700 flex flex-col items-center animate-fade-in">
      <input
        type="color"
        value={tempColor || colors[part] || "#ffffff"}
        onChange={e => setTempColor(e.target.value)}
        className="w-16 h-16 border-none bg-transparent cursor-pointer mb-2"
        autoFocus
      />
      <div className="flex gap-1 mb-2 flex-wrap justify-center">
        {presetColors.map((c) => (
          <button
            key={c}
            className="w-6 h-6 rounded-full border-2 border-gray-600 hover:border-blue-400 transition-all"
            style={{ background: c }}
            onClick={() => { setTempColor(c); }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          className="mmorp-btn"
          onClick={() => { setColor(part, tempColor || colors[part] || "#ffffff"); setOpenPicker(null); }}
        >Valider</button>
        <button
          className="mmorp-btn bg-gray-700 text-yellow-200 border-gray-600 hover:bg-gray-600"
          onClick={() => setOpenPicker(null)}
        >Annuler</button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800/80 rounded-lg p-4 mb-4 shadow-lg">
      <h2 className="text-lg font-semibold mb-2 text-blue-300">Personnalisation des couleurs</h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {parts.map((part) => (
          <div key={part.key} className="flex flex-col items-center relative">
            <button
              className={`w-12 h-12 rounded-full border-4 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                openPicker === part.key ? "border-blue-400" : "border-gray-600 hover:border-blue-300"
              }`}
              style={{ background: colors[part.key] || "#888" }}
              onClick={() => {
                setTempColor(colors[part.key] || "#ffffff");
                setOpenPicker(part.key);
              }}
              aria-label={`Choisir la couleur pour ${part.label}`}
            />
            <span className="text-xs mt-1 text-gray-200 font-medium">{part.label}</span>
            {openPicker === part.key && renderColorPicker(part.key)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorCustomizer; 
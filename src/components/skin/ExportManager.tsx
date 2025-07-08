import React, { useRef, useState } from "react";
import { useSkinStore } from "../store/skinStore";

const ExportManager: React.FC = () => {
  const { baseModel, layers, colors } = useSkinStore();
  const [feedback, setFeedback] = useState<string>("");
  const timeoutRef = useRef<number | null>(null);

  // Export PNG depuis le canvas 2D
  const handleExportPNG = () => {
    const canvas = document.querySelector(
      "canvas[width='256'][height='256']"
    ) as HTMLCanvasElement | null;
    if (!canvas) {
      setFeedback("Aperçu 2D introuvable !");
      return;
    }
    const link = document.createElement("a");
    link.download = "minecraft_skin.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setFeedback("Skin exporté en PNG !");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setFeedback(""), 2000);
  };

  // Export JSON (état du skin)
  const handleExportJSON = () => {
    const data = {
      baseModel,
      layers,
      colors,
      date: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.download = "minecraft_skin.json";
    link.href = URL.createObjectURL(blob);
    link.click();
    setFeedback("Configuration exportée en JSON !");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setFeedback(""), 2000);
  };

  return (
    <div className="bg-gray-800/80 rounded-lg p-4 mb-4 shadow-lg flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2 text-blue-300">Export</h2>
      <div className="flex gap-4 mb-2">
        <button
          className="mmorp-btn"
          onClick={handleExportPNG}
        >
          Exporter en PNG
        </button>
        <button
          className="mmorp-btn bg-green-500 text-gray-900 border-green-600 hover:bg-green-400"
          onClick={handleExportJSON}
        >
          Exporter en JSON
        </button>
      </div>
      {feedback && (
        <div className="mt-2 px-3 py-1 rounded bg-gray-900 text-blue-200 text-sm shadow animate-fade-in">
          {feedback}
        </div>
      )}
    </div>
  );
};

export default ExportManager; 
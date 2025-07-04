import React, { useEffect, useRef } from "react";
// import { useSkinStore } from "../store/skinStore";

const SkinPreview3D: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const lastSkinUrl = useRef<string>("");

  // Création unique du viewer
  useEffect(() => {
    let viewer: any = null;
    import("skinview3d").then((skinview3d) => {
      if (!ref.current) return;
      if (!viewerRef.current) {
        viewer = new skinview3d.SkinViewer({
          width: 576,
          height: 840,
          skin: "/assets/steve.png",
        });
        ref.current.appendChild(viewer.canvas);
        viewerRef.current = viewer;
        viewer.controls.enableZoom = true;
        viewer.controls.enableRotate = true;
        viewer.playerObject.rotation.y = -Math.PI / 9;
      }
    });
    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
    };
  }, []);

  // Met à jour la skin dynamiquement uniquement quand le 2D est prêt
  useEffect(() => {
    const updateSkin = () => {
      const canvas2D = document.getElementById("skin-canvas-2d") as HTMLCanvasElement | null;
      console.log('[3D] skin2d-ready event reçu');
      if (viewerRef.current && canvas2D) {
        console.log('[3D] Canvas2D trouvé', { width: canvas2D.width, height: canvas2D.height });
        const url = canvas2D.toDataURL();
        if (lastSkinUrl.current === url) return;
        lastSkinUrl.current = url;
        const img = new window.Image();
        img.src = url;
        img.onload = () => {
          if (viewerRef.current) {
            console.log('[3D] Image chargée, application de la texture au viewer 3D');
            viewerRef.current.loadSkin(canvas2D);
            console.log('[3D] loadSkin appelé avec canvas2D');
          }
        };
        img.onerror = (e) => {
          console.error('[3D] Erreur de chargement de la texture depuis le canvas 2D', e, url);
        };
      } else {
        if (!canvas2D) console.error('[3D] Canvas2D introuvable');
        if (!viewerRef.current) console.error('[3D] viewerRef.current est null');
      }
    };
    window.addEventListener('skin2d-ready', updateSkin);
    // Appel initial si le skin est déjà prêt
    setTimeout(updateSkin, 200);
    return () => {
      window.removeEventListener('skin2d-ready', updateSkin);
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div ref={ref} style={{ width: 576, height: 840, background: "transparent" }} />
    </div>
  );
};

export default SkinPreview3D; 
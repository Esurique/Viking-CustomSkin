import { create } from 'zustand';

interface SkinState {
  baseModel: 'male' | 'female';
  layers: string[];
  colors: Record<string, string>;
  setBaseModel: (model: 'male' | 'female') => void;
  setLayer: (layer: string, index: number) => void;
  setColor: (part: string, color: string) => void;
}

export const useSkinStore = create<SkinState>((set: (fn: (state: SkinState) => Partial<SkinState> | SkinState) => void) => ({
  baseModel: 'male',
  layers: [
    'corps1',
    'cheveux1',
    'yeux1',
    'nez1',
    'bouche1',
    'vetement1',
    'accessoire1'
  ],
  colors: {
    eyes_paupiere: '',
    eyes_blanc: '',
    eyes_pupille: '',
  },
  setBaseModel: (model: 'male' | 'female') => set(() => ({ baseModel: model })),
  setLayer: (layer: string, index: number) => set((state: SkinState) => {
    const PARTS_KEYS = ['body', 'hairs', 'eyes', 'nose', 'mouth', 'clothes', 'accessories'];
    let layers = [...state.layers];
    if (layers.length !== PARTS_KEYS.length) {
      const defaults = ['corps1','cheveux1','yeux1','nez1','bouche1','vetement1','accessoire1'];
      layers = defaults.slice();
    }
    layers[index] = layer;
    return { layers };
  }),
  setColor: (part: string, color: string) => set((state: SkinState) => ({
    colors: { ...state.colors, [part]: color },
  })),
})); 
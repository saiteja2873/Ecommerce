import { create } from "zustand";

type LoaderState = {
  loading: boolean;
  setLoading: (value: boolean, delay : number) => void;
};

export const useLoaderStore = create<LoaderState>((set) => ({
  loading: false,
  setLoading: (value, delay) => {
    if (!value && delay) {
      // Delay turning off loader
      setTimeout(() => set({ loading: false }), delay);
    } else {
      set({ loading: value });
    }
  },
}));
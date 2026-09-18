import { create } from 'zustand';

export type SceneId =
  'hero' | 'about' | 'experience' | 'projects' | 'video' | 'certificates' | 'contact';

interface InvestigationState {
  currentScene: SceneId;
  investigationProgress: number; // 0–1, driven by scroll
  openedProjectId: string | null;
  selectedVideoId: string | null;
  discoveredEvidence: Set<string>;

  setCurrentScene: (scene: SceneId) => void;
  setInvestigationProgress: (progress: number) => void;
  openProject: (id: string | null) => void;
  selectVideo: (id: string | null) => void;
  discoverEvidence: (id: string) => void;
}

export const useInvestigationStore = create<InvestigationState>((set) => ({
  currentScene: 'hero',
  investigationProgress: 0,
  openedProjectId: null,
  selectedVideoId: null,
  discoveredEvidence: new Set(),

  setCurrentScene: (scene) => set({ currentScene: scene }),
  setInvestigationProgress: (progress) => set({ investigationProgress: progress }),
  openProject: (id) => set({ openedProjectId: id }),
  selectVideo: (id) => set({ selectedVideoId: id }),
  discoverEvidence: (id) =>
    set((state) => ({ discoveredEvidence: new Set(state.discoveredEvidence).add(id) })),
}));

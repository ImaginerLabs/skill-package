// ============================================================
// stores/bundle-store.ts — 套件状态管理
// ============================================================

import { create } from "zustand";
import type {
  ApplyBundleResult,
  SkillBundleCreate,
  SkillBundleUpdate,
  SkillBundleWithStatus,
} from "../../shared/types";
import {
  applySkillBundle as apiApplyBundle,
  createSkillBundle as apiCreateBundle,
  deleteSkillBundle as apiDeleteBundle,
  fetchSkillBundles as apiFetchBundles,
  updateSkillBundle as apiUpdateBundle,
} from "../lib/api";

export interface BundleStore {
  bundles: SkillBundleWithStatus[];
  bundlesLoading: boolean;
  bundlesError: string | null;
  /** 当前激活的套件 ID */
  activeBundleId: string | null;
  // actions
  fetchBundles: () => Promise<void>;
  createBundle: (data: SkillBundleCreate) => Promise<void>;
  updateBundle: (id: string, data: SkillBundleUpdate) => Promise<void>;
  deleteBundle: (id: string) => Promise<void>;
  applyBundle: (id: string) => Promise<ApplyBundleResult>;
}

export const useBundleStore = create<BundleStore>((set) => ({
  bundles: [],
  bundlesLoading: false,
  bundlesError: null,
  activeBundleId: null,

  fetchBundles: async () => {
    set({ bundlesLoading: true, bundlesError: null });
    try {
      const bundles = await apiFetchBundles();
      set({ bundles });
    } catch (err) {
      set({
        bundlesError: err instanceof Error ? err.message : "加载套件失败",
      });
    } finally {
      set({ bundlesLoading: false });
    }
  },

  createBundle: async (data) => {
    const newBundle = await apiCreateBundle(data);
    set((state) => ({ bundles: [...state.bundles, newBundle] }));
  },

  updateBundle: async (id, data) => {
    const updated = await apiUpdateBundle(id, data);
    set((state) => ({
      bundles: state.bundles.map((b) => (b.id === id ? updated : b)),
    }));
  },

  deleteBundle: async (id) => {
    await apiDeleteBundle(id);
    set((state) => ({
      bundles: state.bundles.filter((b) => b.id !== id),
    }));
  },

  applyBundle: async (id) => {
    const result = await apiApplyBundle(id);
    set({ activeBundleId: id });
    return result;
  },
}));

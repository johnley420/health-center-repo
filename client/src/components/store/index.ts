import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { categoryFieldTypes } from "../../types";

interface CategoryState {
  categoryField: categoryFieldTypes;
  setCategoryField: (newCategoryField: categoryFieldTypes) => void;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    persist(
      (set) => ({
        categoryField: {
          category: "",
          data: [],
          fields: [],
        },

        setCategoryField: (newCategoryField: categoryFieldTypes) =>
          set({ categoryField: newCategoryField }),
      }),
      {
        name: "category-store",
        partialize: (state) => ({ categoryField: state.categoryField }),
      }
    )
  )
);

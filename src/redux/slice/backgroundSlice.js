import { createSlice } from "@reduxjs/toolkit";

/* ==== Safe localStorage helpers ==== */
const ls = {
  get(key, fallback = null) {
    try {
      if (typeof window === "undefined") return fallback;
      const v = window.localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(key, value);
    } catch {}
  },
  remove(key) {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(key);
    } catch {}
  },
};

/* ==== Hydrate from LS ==== */
const initialBackground = ls.get("background", "") || "";
const initialMakeMirrorBg = ls.get("makeMirrorBg", "false") === "true";

const initialState = {
  background: initialBackground, // строка: url('...') или ""
  makeMirrorBg: initialMakeMirrorBg, // boolean
};

export const backgroundSlice = createSlice({
  name: "background",
  initialState,
  reducers: {
    setBackground: (state, action) => {
      state.background = action.payload;
      ls.set("background", state.background);
    },
    setMakeMirrorBg: (state, action) => {
      state.makeMirrorBg = Boolean(action.payload);
      if (state.makeMirrorBg) {
        // true -> сохраняем
        ls.set("makeMirrorBg", "true");
      } else {
        // false -> удаляем ключ
        ls.remove("makeMirrorBg");
      }
    },
    // опционально: явный сброс всего
    resetBackgroundState: (state) => {
      state.background = "";
      state.makeMirrorBg = false;
      ls.remove("background");
      ls.remove("makeMirrorBg");
    },
  },
});

export const { setBackground, setMakeMirrorBg, resetBackgroundState } =
  backgroundSlice.actions;

export default backgroundSlice.reducer;

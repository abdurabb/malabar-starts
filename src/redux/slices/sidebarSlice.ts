import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: { open: false },
  reducers: {
    openSidebar(state) {
      state.open = true;
    },
    closeSidebar(state) {
      state.open = false;
    },
    toggleSidebar(state) {
      state.open = !state.open;
    },
  },
});

export const { openSidebar, closeSidebar, toggleSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;

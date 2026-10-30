import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/authSlice";
import shopReducer from "@/redux/slices/shopSlice";
import sidebarReducer from "@/redux/slices/sidebarSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    shop: shopReducer,
    sidebar: sidebarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

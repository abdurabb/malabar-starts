import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthSession } from "@/types/auth";

type AuthState = {
  status: "loading" | "authenticated" | "anonymous";
  session: AuthSession | null;
};

const initialState: AuthState = {
  status: "loading",
  session: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateSession(state, action: PayloadAction<AuthSession | null>) {
      state.session = action.payload;
      state.status = action.payload ? "authenticated" : "anonymous";
    },
    setSession(state, action: PayloadAction<AuthSession>) {
      state.session = action.payload;
      state.status = "authenticated";
    },
    clearSession(state) {
      state.session = null;
      state.status = "anonymous";
    },
  },
});

export const { hydrateSession, setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;

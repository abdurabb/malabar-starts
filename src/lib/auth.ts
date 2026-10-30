import { api } from "@/lib/api";
import { ApiError } from "@/lib/apiError";
import {
  clearPendingEmail,
  clearToken,
  readToken,
  writePendingEmail,
  writeToken,
} from "@/lib/authSession";
import type { AuthSession, AuthUser, LoginInput, SignupInput } from "@/types/auth";

const root = "/api/v1/auth";

type MessageResponse = {
  success: true;
  message: string;
};

type UserResponse = MessageResponse & {
  user: AuthUser;
};

type SessionResponse = MessageResponse & {
  token: string;
  user: AuthUser;
};

type MeResponse = {
  success: true;
  user: AuthUser;
};

function storeSession(token: string, user: AuthUser): AuthSession {
  writeToken(token);
  clearPendingEmail();
  return { token, user };
}

export async function register(input: SignupInput) {
  const email = input.email.trim().toLowerCase();
  const result = await api<UserResponse>(`${root}/register`, {
    method: "POST",
    body: JSON.stringify({
      name: input.name.trim(),
      email,
      mobile: input.mobile.trim(),
      password: input.password,
    }),
  });
  writePendingEmail(result.user.email || email);
  return result;
}

export async function verifyOtp(email: string, otp: string) {
  const result = await api<SessionResponse>(`${root}/verify-otp`, {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    }),
  });
  return storeSession(result.token, result.user);
}

export async function resendOtp(email: string) {
  const normalized = email.trim().toLowerCase();
  const result = await api<MessageResponse>(`${root}/resend-otp`, {
    method: "POST",
    body: JSON.stringify({ email: normalized }),
  });
  writePendingEmail(normalized);
  return result;
}

export async function login(input: LoginInput) {
  const email = input.email.trim().toLowerCase();
  const result = await api<SessionResponse>(`${root}/login`, {
    method: "POST",
    body: JSON.stringify({
      email,
      password: input.password,
    }),
  });
  return storeSession(result.token, result.user);
}

export async function forgotPassword(email: string) {
  return api<MessageResponse>(`${root}/forgot-password`, {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  return api<MessageResponse>(`${root}/change-password`, {
    method: "POST",
    body: JSON.stringify({
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    }),
  });
}

export async function restoreSession(): Promise<AuthSession | null> {
  const token = readToken();
  if (!token) return null;
  try {
    const result = await api<MeResponse>(`${root}/me`);
    const current = readToken();
    if (!current) return null;
    return { token: current, user: result.user };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 404)) {
      clearToken();
      return null;
    }
    throw error;
  }
}

export function logout() {
  clearToken();
}

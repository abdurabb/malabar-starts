import { cookies } from "next/headers";
import { TOKEN_KEY } from "@/lib/authSession";
import { api } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

type MeResponse = {
  success: true;
  user: AuthUser;
};

export async function readCurrentUser(): Promise<AuthUser | null> {
  const value = (await cookies()).get(TOKEN_KEY)?.value;
  if (!value) return null;
  try {
    const result = await api<MeResponse>("/api/v1/auth/me");
    return result.user;
  } catch {
    return null;
  }
}

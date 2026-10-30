export type Role = "admin" | "user";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  isEmailVerified: boolean;
  isBlocked: boolean;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  name: string;
  email: string;
  mobile: string;
  password: string;
};

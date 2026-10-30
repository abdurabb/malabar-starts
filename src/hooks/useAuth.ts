import { useAppSelector } from "@/redux/hooks";

export function useAuth() {
  return useAppSelector((state) => state.auth);
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { getCart } from "@/lib/carts";
import { listWishlistEntries } from "@/lib/wishlists";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearShop, setCartCount, setWishlist } from "@/redux/slices/shopSlice";

export function ShopProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { status, session } = useAppSelector((state) => state.auth);
  const wishlistRevision = useAppSelector((state) => state.shop.wishlistRevision);
  const cartRevision = useAppSelector((state) => state.shop.cartRevision);
  const userId = session?.user.role === "user" ? session.user.id : null;
  const owner = useRef<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && userId) {
      if (owner.current !== userId) {
        owner.current = userId;
        dispatch(clearShop());
      }
      return;
    }
    if (status === "anonymous" || (status === "authenticated" && !userId)) {
      owner.current = null;
      dispatch(clearShop());
    }
  }, [status, userId, dispatch]);

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;
    let active = true;
    listWishlistEntries()
      .then((entries) => {
        if (active) dispatch(setWishlist({ entries, revision: wishlistRevision }));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [status, userId, wishlistRevision, dispatch]);

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;
    let active = true;
    getCart({ page: 1, limit: 1 })
      .then((result) => {
        if (active) dispatch(setCartCount({ count: result.cart.itemCount, revision: cartRevision }));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [status, userId, cartRevision, dispatch]);

  return children;
}

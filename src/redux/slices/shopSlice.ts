import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WishlistEntry } from "@/types/wishlist";

type ShopState = {
  cartCount: number;
  cartRevision: number;
  wishlist: WishlistEntry[];
  wishlistRevision: number;
};

const initialState: ShopState = {
  cartCount: 0,
  cartRevision: 0,
  wishlist: [],
  wishlistRevision: 0,
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    clearShop(state) {
      state.cartCount = 0;
      state.cartRevision = 0;
      state.wishlist = [];
      state.wishlistRevision = 0;
    },
    setCartCount(state, action: PayloadAction<{ count: number; revision: number }>) {
      if (state.cartRevision !== action.payload.revision) return;
      state.cartCount = action.payload.count;
    },
    noteCart(state, action: PayloadAction<number>) {
      state.cartRevision += 1;
      state.cartCount = action.payload;
    },
    setWishlist(state, action: PayloadAction<{ entries: WishlistEntry[]; revision: number }>) {
      if (state.wishlistRevision !== action.payload.revision) return;
      state.wishlist = action.payload.entries;
    },
    addWishlist(state, action: PayloadAction<WishlistEntry>) {
      state.wishlistRevision += 1;
      if (state.wishlist.some((item) => item.productId === action.payload.productId)) return;
      state.wishlist.push(action.payload);
    },
    removeWishlist(state, action: PayloadAction<string>) {
      state.wishlistRevision += 1;
      state.wishlist = state.wishlist.filter((item) => item.productId !== action.payload);
    },
  },
});

export const { clearShop, setCartCount, noteCart, setWishlist, addWishlist, removeWishlist } = shopSlice.actions;
export default shopSlice.reducer;

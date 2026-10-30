import type { Metadata } from "next";
import { WishlistView } from "@/components/shop/wishlist-view";

export const instant = false;

export const metadata: Metadata = {
  title: "Wishlist",
};

export default function WishlistPage() {
  return <WishlistView />;
}

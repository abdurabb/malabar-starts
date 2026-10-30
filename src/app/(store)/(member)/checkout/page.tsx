import type { Metadata } from "next";
import { CheckoutView } from "@/components/shop/checkout-view";

export const instant = false;

export const metadata: Metadata = {
  title: "Place order",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}

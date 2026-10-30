import type { Metadata } from "next";
import { OrdersAdmin } from "@/components/admin/orders-admin";
import { AdminNote } from "@/components/admin/admin-views";

export const instant = false;

export const metadata: Metadata = {
  title: "Orders",
};

export default function AdminOrdersPage() {
  return (
    <>
      <AdminNote>Orders placed from a customer cart. Open an order to move it forward, or cancel it before it ships.</AdminNote>
      <OrdersAdmin />
    </>
  );
}

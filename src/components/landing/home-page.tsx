"use client";

import { useEffect, useState } from "react";
import { About } from "@/components/landing/about";
import { Brands } from "@/components/landing/brands";
import { Categories } from "@/components/landing/categories";
import { Counter } from "@/components/landing/counter";
import { Hero } from "@/components/landing/hero";
import { Inquiry } from "@/components/landing/inquiry";
import { RecentOrders } from "@/components/landing/recent-orders";
import { RecentProducts } from "@/components/landing/recent-products";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Ticker } from "@/components/landing/ticker";
import { WhyUs } from "@/components/landing/why-us";
import { useAuth } from "@/hooks/useAuth";
import { errorText } from "@/lib/apiError";
import { getHome, type HomeData } from "@/lib/home";

const emptyHome: HomeData = {
  success: true,
  categories: [],
  brands: [],
  products: [],
  orders: [],
};

export function HomePage() {
  const { status, session } = useAuth();
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    let active = true;
    getHome()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError("");
      })
      .catch((caught) => {
        if (!active) return;
        setData(emptyHome);
        setError(errorText(caught, "The home counter could not be loaded."));
      });
    return () => {
      active = false;
    };
  }, [status]);

  const home = data ?? emptyHome;
  const ready = data !== null;
  const showOrders = mounted && status === "authenticated" && session?.user.role === "user";

  return (
    <div id="top" className="flex flex-1 flex-col">
      <SiteHeader home={data} />
      <main className="flex-1">
        <Hero />
        <Ticker />
        {error ? (
          <div className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8">
            <p className="rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p>
          </div>
        ) : null}
        <Categories categories={home.categories} ready={ready} />
        <Brands brands={home.brands} ready={ready} />
        <RecentProducts products={home.products} ready={ready} />
        {showOrders ? <RecentOrders orders={home.orders} ready={ready} /> : null}
        <Counter />
        <WhyUs />
        <About />
        <Inquiry />
      </main>
      <SiteFooter />
    </div>
  );
}

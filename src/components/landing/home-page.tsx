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
import { readCurrentUser } from "@/lib/currentUser";
import { getHome, type HomeData } from "@/lib/home";
import { loadPage } from "@/lib/load";

const emptyHome: HomeData = {
  success: true,
  categories: [],
  brands: [],
  products: [],
  orders: [],
};

export async function HomePage() {
  const [loaded, user] = await Promise.all([
    loadPage(getHome, emptyHome, "The home counter could not be loaded."),
    readCurrentUser(),
  ]);
  const home = loaded.data;
  const showOrders = user?.role === "user";

  return (
    <div id="top" className="flex flex-1 flex-col">
      <SiteHeader home={home} />
      <main className="flex-1">
        <Hero />
        <Ticker />
        {loaded.error ? (
          <div className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8">
            <p className="rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{loaded.error}</p>
          </div>
        ) : null}
        <Categories categories={home.categories} ready />
        <Brands brands={home.brands} ready />
        <RecentProducts products={home.products} ready />
        {showOrders ? <RecentOrders orders={home.orders} ready /> : null}
        <Counter />
        <WhyUs />
        <About />
        <Inquiry />
      </main>
      <SiteFooter />
    </div>
  );
}

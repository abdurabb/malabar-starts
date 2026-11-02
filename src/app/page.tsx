import type { Metadata } from "next";
import { Suspense } from "react";
import { HomePage } from "@/components/landing/home-page";
import { Hero } from "@/components/landing/hero";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Ticker } from "@/components/landing/ticker";
import { JsonLd } from "@/components/seo/json-ld";
import { siteDescription, siteName, siteOrigin } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const origin = siteOrigin();

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: siteName,
      url: origin,
      description: siteDescription,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Sharjah",
        addressCountry: "AE",
      },
    },
    {
      "@type": "WebSite",
      name: siteName,
      url: origin,
      potentialAction: {
        "@type": "SearchAction",
        target: `${origin}/products?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={homeJsonLd} />
      <Suspense
        fallback={
          <div id="top" className="flex flex-1 flex-col">
            <SiteHeader />
            <main className="flex-1">
              <Hero />
              <Ticker />
              <p className="px-5 py-10 text-sm text-ink/60 sm:px-8">Opening the counter…</p>
            </main>
            <SiteFooter />
          </div>
        }
      >
        <HomePage />
      </Suspense>
    </>
  );
}

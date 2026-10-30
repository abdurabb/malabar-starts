import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f7f1e8",
};

export const metadata: Metadata = {
  title: {
    default: "Malabar Starts Food Stuff",
    template: "%s · Malabar Starts Food Stuff",
  },
  description:
    "Fresh chicken, frozen poultry, beef, mutton, and food stuff supplied from Sharjah, United Arab Emirates.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col bg-ivory font-sans text-ink">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

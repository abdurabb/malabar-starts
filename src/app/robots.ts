import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/cart",
        "/checkout",
        "/orders",
        "/payments",
        "/wishlist",
        "/profile",
        "/addresses",
        "/login",
        "/signup",
        "/verify-otp",
        "/forgot-password",
        "/complete-profile",
      ],
    },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}

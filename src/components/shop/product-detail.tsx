import Link from "next/link";
import { ProductActions } from "@/components/shop/product-actions";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductReviews } from "@/components/shop/product-reviews";
import { JsonLd } from "@/components/seo/json-ld";
import { ApiError, errorText } from "@/lib/apiError";
import { routes } from "@/lib/navigation";
import { formatPrice, getProduct } from "@/lib/products";
import { listReviews } from "@/lib/reviews";
import { absoluteAsset, metaDescription, siteName, siteOrigin } from "@/lib/site";

const reviewLimit = 6;

export async function ProductDetail({ id }: { id: string }) {
  let product = null;
  let error = "";
  try {
    product = await getProduct(id);
  } catch (caught) {
    error = caught instanceof ApiError && caught.status === 404 ? "Product not found" : errorText(caught, "This product could not be opened.");
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="page-title">{error || "This product is not on the counter."}</h1>
        <Link href={routes.products} className="mt-6 inline-flex text-wine">
          Back to products
        </Link>
      </div>
    );
  }

  const reviews = await listReviews({ product: product.id, page: 1, limit: reviewLimit, isPublish: true }).catch(() => null);
  const origin = siteOrigin();
  const url = `${origin}/products/${product.id}`;
  const images = product.images.map((src) => absoluteAsset(src)).filter((src): src is string => Boolean(src));
  const reviewCount = reviews?.pagination.total ?? 0;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Products", path: routes.products },
    ...(product.category ? [{ name: product.category.name, path: `${routes.products}?category=${product.category.id}` }] : []),
    { name: product.name, path: `/products/${product.id}` },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Product",
              name: product.name,
              url,
              description: metaDescription(product.description, `${product.name} from ${siteName} in Sharjah.`),
              ...(images.length ? { image: images } : {}),
              ...(product.sku ? { sku: product.sku } : {}),
              ...(product.brand ? { brand: { "@type": "Brand", name: product.brand.name } } : {}),
              ...(product.category ? { category: product.category.name } : {}),
              offers: {
                "@type": "Offer",
                url,
                priceCurrency: "AED",
                price: product.price.toFixed(2),
                availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                itemCondition: "https://schema.org/NewCondition",
              },
              ...(product.rating > 0 && reviewCount > 0
                ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount } }
                : {}),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: crumbs.map((crumb, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: crumb.name,
                item: `${origin}${crumb.path}`,
              })),
            },
          ],
        }}
      />
      <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-6xl px-5 pt-8 sm:px-8">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink/55">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {last ? (
                  <span className="text-ink">{crumb.name}</span>
                ) : (
                  <Link href={crumb.path} className="hover:text-wine">
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-8 sm:px-8 md:py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery images={product.images} name={product.name} />
        <div className="rounded-[2rem] border border-ink/10 bg-paper p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-wine">{product.category?.name ?? "Uncategorized"}</p>
          <h1 className="page-title mt-2">{product.name}</h1>
          {product.description ? <p className="page-body text-ink/75">{product.description}</p> : null}
          <p className="mt-3 text-sm text-ink/55">{product.brand?.name ?? "No brand"}</p>
          <p className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-2xl sm:text-3xl">{formatPrice(product.price)}</span>
            {product.mrp != null && product.mrp > product.price ? (
              <span className="text-ink/45 line-through">{formatPrice(product.mrp)}</span>
            ) : null}
          </p>
          <dl className="mt-6 grid gap-3 text-sm">
            <div>
              <dt className="text-ink/50">Unit</dt>
              <dd>{product.unit ?? "On request"}</dd>
            </div>
            <div>
              <dt className="text-ink/50">Stock</dt>
              <dd>{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</dd>
            </div>
            {product.sku ? (
              <div>
                <dt className="text-ink/50">SKU</dt>
                <dd>{product.sku}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-8">
            <ProductActions product={product} />
          </div>
          <Link href={routes.products} className="mt-6 inline-flex text-sm text-wine">
            All products
          </Link>
        </div>
      </div>
      <ProductReviews
        productId={product.id}
        initialReviews={reviews?.reviews ?? []}
        initialPagination={reviews?.pagination ?? null}
        initialError={reviews ? "" : "Reviews could not be loaded."}
      />
    </>
  );
}

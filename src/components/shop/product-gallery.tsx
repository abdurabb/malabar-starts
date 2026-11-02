"use client";

import { useState } from "react";
import { ProductMedia } from "@/components/shop/product-card";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [image, setImage] = useState(0);
  const current = images[image] ?? images[0];

  return (
    <div>
      <ProductMedia src={current} alt={name} className="aspect-[4/3] w-full rounded-[2rem] object-cover" />
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2">
          {images.map((src, index) => (
            <button key={src} type="button" onClick={() => setImage(index)} className="w-20">
              <ProductMedia
                src={src}
                alt=""
                className={`aspect-square w-full rounded-xl object-cover ${index === image ? "ring-2 ring-wine" : ""}`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

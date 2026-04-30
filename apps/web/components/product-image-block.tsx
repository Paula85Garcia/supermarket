"use client";

import { useState } from "react";

interface ProductImageBlockProps {
  src: string;
  alt: string;
  className?: string;
}

export function ProductImageBlock({ src, alt, className }: ProductImageBlockProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative mb-4 h-40 w-full overflow-hidden rounded-xl border border-merka-border bg-zinc-900 ${className ?? ""}`}>
      {!loaded ? (
        <div
          className="absolute inset-0 animate-shimmer bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-800 bg-[length:200%_100%]"
          aria-hidden
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`relative z-[1] h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

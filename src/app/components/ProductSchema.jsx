import React from "react";

/**
 * ProductSchema component to inject JSON-LD for SEO rich snippets.
 */
export function ProductSchema({ product }) {
  if (!product) return null;

  const data = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.map(img => img.url) || [product.image],
    "description": product.description,
    "sku": product._id?.substring(0, 8),
    "mpn": product._id,
    "brand": {
      "@type": "Brand",
      "name": "Delivix"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": "2025-12-31",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.ratings || 5,
      "reviewCount": product.numOfReviews || 1
    }
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(data)}
    </script>
  );
}

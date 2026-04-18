import { useEffect } from "react";

/**
 * Enhanced SEO Hook
 * @param {string} title - The page title
 * @param {string} description - The meta description
 * @param {object} options - Optional OG/Twitter settings { image, type, keywords, canonical }
 */
export function useSEO(title, description, options = {}) {
  useEffect(() => {
    const baseTitle = "Delivix";
    const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
    const defaultDesc = "Shop the latest emerging tech products, components, and gadgets safely from Delivix.";
    const fullDesc = description || defaultDesc;

    // 1. Core Titles & Meta
    document.title = fullTitle;
    
    const updateOrCreateMeta = (name, content, attr = "name") => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (el) {
        el.setAttribute("content", content);
      } else {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        el.setAttribute("content", content);
        document.head.appendChild(el);
      }
    };

    updateOrCreateMeta("description", fullDesc);
    updateOrCreateMeta("keywords", options.keywords || "ecommerce, tech gadgets, electronics, delivix");

    // 2. Open Graph (OG) Tags
    updateOrCreateMeta("og:title", fullTitle, "property");
    updateOrCreateMeta("og:description", fullDesc, "property");
    updateOrCreateMeta("og:type", options.type || "website", "property");
    updateOrCreateMeta("og:image", options.image || "/logo.png", "property");
    updateOrCreateMeta("og:url", window.location.href, "property");
    updateOrCreateMeta("og:site_name", baseTitle, "property");

    // 3. Twitter Card Tags
    updateOrCreateMeta("twitter:card", "summary_large_image");
    updateOrCreateMeta("twitter:title", fullTitle);
    updateOrCreateMeta("twitter:description", fullDesc);
    updateOrCreateMeta("twitter:image", options.image || "/logo.png");

    // 4. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", options.canonical || window.location.href);

  }, [title, description, options]);
}

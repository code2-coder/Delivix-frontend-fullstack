import { useEffect } from "react";

export function useSEO(title, description) {
  useEffect(() => {
    // 1. Update Document Title
    const baseTitle = "Delivix";
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;

    // 2. Update Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        description || "Shop the latest emerging tech products, components, and gadgets safely from Delivix."
      );
    } else if (description) {
      // If it doesn't exist, create it
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [title, description]);
}

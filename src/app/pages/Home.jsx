import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { BannerCarousel } from "../components/BannerCarousel";
import { ProductCard } from "../components/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/axios";
import { useSEO } from "../hooks/useSEO";
import { useCategory } from "../context/CategoryContext";

export function Home() {
  useSEO("Home", "Browse Delivix's expansive offering of highly-rated tech products, hardware essentials, and premium gadgets.");
  
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  
  const [products, setProducts] = useState([]);
  const { categories: contextCategories } = useCategory();
  const [categories, setCategories] = useState([{ name: "All", _id: "all", parentCategory: null }]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const categoryScrollRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      categoryScrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  // Sync state if header navigation explicitly sets URL params
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else if (!searchParams.get("search")) {
      setSelectedCategory("All");
    }
  }, [searchParams]);

  // Sync categories
  useEffect(() => {
    if (contextCategories && contextCategories.length > 0) {
      setCategories([{ name: "All", _id: "all", parentCategory: null }, ...contextCategories]);
    }
  }, [contextCategories]);

  // Fetch products mapped to Search Bar
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const searchQuery = searchParams.get("search");
        let url = `/products?limit=100`;
        if (searchQuery) {
            url += `&keyword=${encodeURIComponent(searchQuery)}`;
        }
        
        const { data } = await api.get(url);
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchParams]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await api.get("/banners");
        setBanners(data.banners || []);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Apply strict category filtering locally while supporting parent->child structures
    if (selectedCategory !== "All") {
      const targetCat = contextCategories?.find(c => c.name === selectedCategory);
       
      if (targetCat) {
        // Find all subcategories belonging to this selected category
        const validCategoryNames = [
          targetCat.name, 
          ...(contextCategories?.filter(c => c.parentCategory === targetCat._id).map(c => c.name) || [])
        ];
        
        const validCategoryIds = [
          targetCat._id, 
          ...(contextCategories?.filter(c => c.parentCategory === targetCat._id).map(c => c._id) || [])
        ];

        filtered = filtered.filter(p => 
          validCategoryNames.includes(p.category) || 
          validCategoryNames.includes(p.category?.name) ||
          validCategoryIds.includes(p.category) ||
          validCategoryIds.includes(p.category?._id)
        );
      } else {
        // Fallback exact match
        filtered = filtered.filter((p) => p.category === selectedCategory || p.category?.name === selectedCategory);
      }
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, products, contextCategories]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BannerCarousel banners={banners} />

        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Shop by Category</h2>
          <div className="relative mb-8 group flex items-center">
             {/* Left Scroll Button */}
             <button 
                onClick={() => scrollCategories('left')} 
                className="absolute left-0 z-10 -ml-4 bg-white/90 backdrop-blur border border-gray-200 shadow-md rounded-full p-1.5 text-gray-600 hover:text-emerald-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
             >
                <ChevronLeft className="w-5 h-5" />
             </button>

             <div 
               ref={categoryScrollRef}
               className="flex space-x-3 overflow-x-auto pb-4 pt-2 px-2 scrollbar-none scroll-smooth w-full"
               style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
             >
                {categories.filter(c => c._id === 'all' || !c.parentCategory).map((category) => (
                   <button
                      key={category._id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`flex-shrink-0 px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-300 border ${
                          (selectedCategory === category.name || (selectedCategory !== "All" && categories.find(x => x.name === selectedCategory && x.parentCategory === category._id)))
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/30 scale-105"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900"
                      }`}
                   >
                      {category.name}
                   </button>
                ))}
             </div>

             {/* Right Scroll Button */}
             <button 
                onClick={() => scrollCategories('right')} 
                className="absolute right-0 z-10 -mr-4 bg-white/90 backdrop-blur border border-gray-200 shadow-md rounded-full p-1.5 text-gray-600 hover:text-emerald-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
             >
                <ChevronRight className="w-5 h-5" />
             </button>
          </div>

          {/* Subcategory Row (Conditional) */}
          {(() => {
              const activeCat = categories.find(c => c.name === selectedCategory);
              const parentId = activeCat?.parentCategory || (selectedCategory !== "All" ? activeCat?._id : null);
              const subs = categories.filter(sub => sub.parentCategory === parentId && parentId);
              
              if (subs.length > 0) return (
                 <div className="flex space-x-3 overflow-x-auto pb-6 px-2 scrollbar-none -mt-4">
                    {subs.map((sub) => (
                       <button
                          key={sub._id}
                          onClick={() => setSelectedCategory(sub.name)}
                          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 border shadow-sm ${
                             selectedCategory === sub.name ? "bg-emerald-700 text-white border-emerald-800 shadow-md scale-105" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          }`}
                       >
                          ↳ {sub.name}
                       </button>
                    ))}
                 </div>
              );
              return null;
          })()}

          <div className="mb-4">
            <h3 className="text-2xl font-semibold">
              {searchParams.get("search") 
                ? `Search Results for "${searchParams.get("search")}"` 
                : (selectedCategory === "All" ? "All Products" : selectedCategory)}
            </h3>
            <p className="text-gray-600">
              {filteredProducts.length} products found
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

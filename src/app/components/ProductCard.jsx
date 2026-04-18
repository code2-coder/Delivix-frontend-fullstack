import { ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";

export function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
      <Link to={`/product/${product._id || product.id}`}>
        <div className="relative h-48 bg-gray-200 cursor-pointer">
          <img
            src={(() => {
              const originalUrl = (product.images && product.images[0]?.url) || product.image;
              // If it's a cloudinary URL, inject optimization params
              if (originalUrl && originalUrl.includes("cloudinary.com")) {
                return originalUrl.replace("/upload/", "/upload/f_auto,q_auto,w_500/");
              }
              return originalUrl;
            })()}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />

          {product.stock < 10 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${product._id || product.id}`}>
          <h3 className="font-semibold text-lg mb-1 hover:text-emerald-600 cursor-pointer">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2">{product.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-emerald-700 font-black text-2xl tracking-tighter">
            ₹{product.price.toFixed(0)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label={`Add ${product.name} to cart`}
            className="h-12 w-12 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 disabled:bg-gray-200 disabled:shadow-none transition-all active:rotate-12 active:scale-90"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

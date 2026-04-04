import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import api from "../api/axios";
import {
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  Package,
  Truck,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { ProductCard } from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useSEO } from "../hooks/useSEO";

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);

        // Fetch related products
        if (data.product?.category) {
          try {
            const relatedRes = await api.get(`/products?category=${data.product.category}`);
            const related = (relatedRes.data.products || [])
              .filter(p => p._id !== data.product._id)
              .slice(0, 4);
            setRelatedProducts(related);
          } catch (err) {
            console.error("Failed to fetch related products", err);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success(`${quantity} x ${product.name} added to cart!`);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  useSEO(
     product ? product.name : "Loading Product...",
     product ? `${product.name} - ${product.description.substring(0, 150)}...` : "Premium Tech Product"
  );

  const submitReview = async () => {
    if (!user) return toast.error("Please login to submit a review");
    if (!reviewComment.trim()) return toast.error("Please write a review comment");

    try {
      setIsSubmittingReview(true);
      await api.put("/reviews", {
        rating: reviewRating,
        comment: reviewComment,
        productId: product._id
      });
      toast.success("Review submitted successfully");
      
      // Refresh strictly the product to pull the new review block
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
      setReviewComment("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Product Gallery */}
          <div className="flex flex-col space-y-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden aspect-square">
              <img
                src={(product.images && product.images[activeImage]?.url) || product.image || "https://placehold.co/800x800"}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
            
            {/* Thumbnail Strip */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={img.public_id || index}
                    onClick={() => setActiveImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      activeImage === index ? "border-emerald-600 shadow-md ring-2 ring-emerald-200" : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <img src={img.url} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-4">
              <span className="inline-block bg-emerald-100 text-emerald-800 text-sm px-3 py-1 rounded-full">
                {product.category?.name || product.category}
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center space-x-2 mb-4">
               <div className="flex text-yellow-400">
                  {/* Quick Rating Calc */}
                  {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < (product.ratings || 0) ? "fill-current" : "text-gray-300 fill-current"}`} viewBox="0 0 20 20">
                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                  ))}
               </div>
               <span className="text-sm font-semibold text-gray-600">({product.numOfReviews || 0} customer reviews)</span>
            </div>

            <div className="flex items-baseline space-x-2 mb-6">
              <span className="text-4xl font-bold text-emerald-600">
                ₹{product.price?.toFixed(2) || product.price}
              </span>
              <span className="text-gray-500 line-through text-xl">
                ₹{(product.price * 1.2).toFixed(2)}
              </span>
              <span className="text-sm text-red-600 font-semibold">
                (17% OFF)
              </span>
            </div>

            <p className="text-gray-700 text-lg mb-6">{product.description}</p>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-semibold">
                    In Stock ({product.stock} units available)
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-red-600" />
                  <span className="text-red-600 font-semibold">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="border-t pt-6">
              <div className="flex items-start space-x-3 mb-4">
                <Truck className="w-6 h-6 text-emerald-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Free Delivery</p>
                  <p className="text-sm text-gray-600">
                    On orders above ₹500. Delivered in 1-2 business days.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Package className="w-6 h-6 text-emerald-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Quality Assured</p>
                  <p className="text-sm text-gray-600">
                    Fresh products with 100% quality guarantee.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">
                {product.name} is a premium quality product carefully selected
                for freshness and taste. Perfect for your daily needs, this
                product meets the highest standards of quality.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Specifications
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-semibold">{product.category?.name || product.category}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Product ID:</span>
                  <span className="font-semibold">#{product._id || product.id}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <span className="font-semibold">
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Weight/Size:</span>
                  <span className="font-semibold">
                    {product.description?.split(",")[1] || "Standard"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct._id || relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}

        {/* CUSTOMER REVIEWS SECTION */}
        <div className="bg-white rounded-lg shadow-md p-8">
           <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Reviews List */}
              <div className="md:col-span-2 space-y-6">
                 {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map(review => (
                       <div key={review._id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                          <div className="flex items-center space-x-3 mb-2">
                             <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                                {review.user?.name ? review.user.name.charAt(0).toUpperCase() : "U"}
                             </div>
                             <div>
                                <p className="font-semibold text-gray-800">{review.user?.name || "Verified Customer"}</p>
                                <div className="flex text-yellow-400">
                                   {[...Array(5)].map((_, i) => (
                                      <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-gray-200 fill-current"}`} viewBox="0 0 20 20">
                                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                   ))}
                                </div>
                             </div>
                          </div>
                          <p className="text-gray-600 pl-13">{review.comment}</p>
                       </div>
                    ))
                 ) : (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center text-gray-500">
                       <p>Nobody has reviewed this product yet.</p>
                       <p className="text-sm mt-1 text-gray-400">Be the first to share your thoughts!</p>
                    </div>
                 )}
              </div>

              {/* Review Submission Form */}
              <div className="md:col-span-1 border border-gray-200 rounded-xl p-6 h-fit sticky top-24">
                 <h3 className="font-semibold text-lg mb-4 text-gray-800">Add a Review</h3>
                 {!user ? (
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center">
                       <p className="text-orange-800 text-sm mb-3">You must be logged into a customer account to leave a verified review.</p>
                       <button onClick={() => navigate("/login")} className="bg-orange-500 text-white w-full py-2 rounded-lg font-semibold hover:bg-orange-600">Secure Login</button>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <div>
                          <label className="block text-sm text-gray-600 mb-2">Your Rating</label>
                          <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500">
                             <option value="5">⭐⭐⭐⭐⭐ - 5 Stars</option>
                             <option value="4">⭐⭐⭐⭐ - 4 Stars</option>
                             <option value="3">⭐⭐⭐ - 3 Stars</option>
                             <option value="2">⭐⭐ - 2 Stars</option>
                             <option value="1">⭐ - 1 Star</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-sm text-gray-600 mb-2">Your Feedback</label>
                          <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows="4" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="What did you like or dislike?" />
                       </div>
                       <button onClick={submitReview} disabled={isSubmittingReview} className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-black disabled:bg-gray-400 transition-colors">
                          {isSubmittingReview ? "Submitting..." : "Submit Review"}
                       </button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

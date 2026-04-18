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
  Star,
  User,
  ThumbsUp,
  Calendar,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { ProductCard } from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useSEO } from "../hooks/useSEO";
import { ProductSchema } from "../components/ProductSchema";

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
     product ? `${product.name} - ${product.description.substring(0, 150)}...` : "Premium Tech Product",
     { 
       image: product?.images?.[0]?.url || product?.image, 
       type: "product",
       keywords: product ? `${product.name}, tech, hardware, Delivix` : "tech, hardware"
     }
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
      setReviewRating(5); // Reset to 5 stars
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Calculate rating stats
  const ratingsCount = [0, 0, 0, 0, 0];
  product?.reviews?.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingsCount[5 - r.rating]++;
    }
  });
  const totalReviews = product?.reviews?.length || 0;

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ProductSchema product={product} />

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
        <div id="reviews" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-16">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer Reviews</h2>
              <div className="flex items-center mt-2 space-x-3">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(product.ratings) ? "fill-current" : "text-gray-200 fill-current"}`} />
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-900">{product.ratings?.toFixed(1)} <span className="text-gray-400 font-normal">/ 5.0</span></span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 font-medium">{totalReviews} reviews</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Rating Breakdown */}
            <div className="lg:col-span-4 p-8 bg-gray-50/50 border-r border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Rating Distribution</h3>
              <div className="space-y-4">
                {ratingsCount.map((count, i) => {
                  const stars = 5 - i;
                  const percentage = totalReviews === 0 ? 0 : Math.round((count / totalReviews) * 100);
                  return (
                    <div key={stars} className="flex items-center space-x-4">
                      <span className="text-sm font-bold text-gray-600 w-12">{stars} Stars</span>
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-400 w-12 text-right">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-10 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                 <p className="text-sm text-gray-600 leading-relaxed italic">
                    "Delivix customers love this product for its quality and speed of delivery."
                 </p>
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-8 p-8">
              <div className="space-y-8">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review._id} className="group pb-8 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center text-emerald-700 font-extrabold shadow-sm">
                            {review.user?.name ? review.user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-gray-900">{review.user?.name || "Verified Customer"}</h4>
                              <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-1.5 py-0.5 rounded tracking-tighter">Verified</span>
                            </div>
                            <div className="flex text-yellow-400 mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-gray-100 fill-current"}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-400 text-xs">
                           <Calendar className="w-3 h-3 mr-1" />
                           <span>Recently Added</span>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed font-medium pl-16">
                        {review.comment}
                      </p>
                      <div className="mt-4 pl-16 flex items-center space-x-4">
                         <button className="flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Helpful (0)</span>
                         </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl font-bold text-gray-900">No reviews yet</p>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm">Be the pioneer who sets the standard for this product!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MODERN REVIEW SUBMISSION FORM */}
        <div className="max-w-3xl mx-auto">
           <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 p-10 border border-emerald-50">
              <h2 className="text-2xl font-black text-gray-900 mb-8 text-center uppercase tracking-tight">Share Your Experience</h2>
              
              {!user ? (
                <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                  <p className="text-gray-600 font-medium mb-6">Join the community to leave a verified review.</p>
                  <button onClick={() => navigate("/login")} className="px-10 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-200">
                    Sign In to Review
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                   <div className="flex flex-col items-center">
                      <label className="text-sm font-bold text-gray-400 uppercase mb-4">Select Rating</label>
                      <div className="flex space-x-2">
                         {[1, 2, 3, 4, 5].map((s) => (
                            <button
                               key={s}
                               onClick={() => setReviewRating(s)}
                               onMouseEnter={() => {}} // Could add hover state logic
                               className="focus:outline-none transition-transform hover:scale-125 active:scale-90"
                            >
                               <Star className={`w-10 h-10 ${s <= reviewRating ? "text-yellow-400 fill-current" : "text-gray-200"}`} />
                            </button>
                         ))}
                      </div>
                      <p className="mt-3 text-sm font-bold text-emerald-600">
                         {reviewRating === 5 && "Exceeded my expectations!"}
                         {reviewRating === 4 && "Highly recommended!"}
                         {reviewRating === 3 && "It's a solid product."}
                         {reviewRating === 2 && "Could be better."}
                         {reviewRating === 1 && "Disappointing experience."}
                      </p>
                   </div>

                   <div className="space-y-4">
                      <label className="text-sm font-bold text-gray-900 uppercase block ml-1">Your detailed thoughts</label>
                      <textarea 
                        value={reviewComment} 
                        onChange={e => setReviewComment(e.target.value)} 
                        rows="5" 
                        className="w-full bg-gray-50 border-0 rounded-2xl p-6 text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-emerald-500/10 transition-all text-lg font-medium" 
                        placeholder="What makes this product special? (or what doesn't?)" 
                      />
                   </div>

                   <button 
                     onClick={submitReview} 
                     disabled={isSubmittingReview} 
                     className="w-full h-16 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 disabled:bg-gray-200 transition-all flex items-center justify-center shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
                   >
                     {isSubmittingReview ? "Processing..." : "POST REVIEW"}
                   </button>
                </div>
              )}
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

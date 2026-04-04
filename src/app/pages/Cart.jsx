import { useNavigate } from "react-router";
import { useState } from "react";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useSEO } from "../hooks/useSEO";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

import api from "../api/axios";

export function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useSEO("Shopping Cart", `You have ${cart.length} items waiting in your cart. Check out now for fast, insured tech appliance delivery.`);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingForm, setShippingForm] = useState({
    fullName: user?.name || "",
    phoneNo: "",
    altPhoneNo: "",
    address: "",
    city: "",
    zipCode: "",
    country: "India"
  });

  const buildOrderPayload = () => {
    return {
      orderItems: cart.map(item => ({
        product: item.product._id || item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: (item.product.images && item.product.images[0]?.url) || item.product.image || "no-image"
      })),
      shippingInfo: {
        fullName: shippingForm.fullName,
        address: shippingForm.address,
        city: shippingForm.city,
        phoneNo: shippingForm.phoneNo,
        altPhoneNo: shippingForm.altPhoneNo,
        zipCode: shippingForm.zipCode,
        country: shippingForm.country
      },
      paymentMethod,
      itemsPrice: cartTotal,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: cartTotal
    };
  };

  const verifyRazorpayPayment = async (response, orderData) => {
    try {
      await api.post("/payment/verify", {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        orderData
      });
      clearCart();
      toast.success("Payment successful! Order placed.");
      navigate("/orders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment verification failed");
      console.error(error);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!shippingForm.fullName || !shippingForm.phoneNo || !shippingForm.address || !shippingForm.city || !shippingForm.zipCode) {
      toast.error("Please fill all required shipping details");
      return;
    }

    const orderPayload = buildOrderPayload();

    if (paymentMethod === "Card") {
      // 1) Initialize Razorpay Order
      try {
        const { data } = await api.post("/payment/process", {
          amount: orderPayload.totalAmount
        });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use Razorpay Key from frontend .env
          amount: data.amount,
          currency: "INR",
          name: "Delivix",
          description: "Test Transaction",
          order_id: data.orderId,
          handler: function (response) {
            verifyRazorpayPayment(response, orderPayload);
          },
          prefill: {
            name: shippingForm.fullName,
            email: user.email,
            contact: shippingForm.phoneNo
          },
          theme: {
            color: "#059669" // Emerald-600
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response){
          toast.error("Payment failed: " + response.error.description);
        });
        rzp1.open();

      } catch (error) {
        toast.error("Could not initiate payment");
        console.error(error);
      }
    } else {
      // Standard COD checkout via direct backend insertion
      try {
        await api.post("/orders/new", orderPayload);
        clearCart();
        toast.success("Order placed successfully via COD!");
        navigate("/orders");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to place order");
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some products to get started
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.product._id || item.product.id}
                  className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {item.product.description}
                    </p>
                    <p className="text-emerald-600 font-bold mt-1">
                      ₹{item.product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        updateQuantity((item.product._id || item.product.id), item.quantity - 1)
                      }
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity((item.product._id || item.product.id), item.quantity + 1)
                      }
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart((item.product._id || item.product.id))}
                      className="text-red-500 hover:text-red-700 mt-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Shipping Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm text-gray-600 mb-1">Full Name *</label>
                      <input type="text" value={shippingForm.fullName} onChange={e => setShippingForm({...shippingForm, fullName: e.target.value})} className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Target Recipient" />
                   </div>
                   <div>
                      <label className="block text-sm text-gray-600 mb-1">Mobile Number *</label>
                      <input type="text" value={shippingForm.phoneNo} onChange={e => setShippingForm({...shippingForm, phoneNo: e.target.value})} className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="10-digit primary number" />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Delivery Address *</label>
                      <textarea value={shippingForm.address} onChange={e => setShippingForm({...shippingForm, address: e.target.value})} className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="House/Flat No., Street Name, Area..." rows="2"></textarea>
                   </div>
                   <div>
                      <label className="block text-sm text-gray-600 mb-1">City *</label>
                      <input type="text" value={shippingForm.city} onChange={e => setShippingForm({...shippingForm, city: e.target.value})} className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Your City" />
                   </div>
                   <div>
                      <label className="block text-sm text-gray-600 mb-1">PIN / Zip Code *</label>
                      <input type="text" value={shippingForm.zipCode} onChange={e => setShippingForm({...shippingForm, zipCode: e.target.value})} className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Postal code" />
                   </div>
                   <div>
                      <label className="block text-sm text-gray-600 mb-1">Alternate Number (Optional)</label>
                      <input type="text" value={shippingForm.altPhoneNo} onChange={e => setShippingForm({...shippingForm, altPhoneNo: e.target.value})} className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Secondary contact" />
                   </div>
                   <div>
                      <label className="block text-sm text-gray-600 mb-1">Country</label>
                      <input type="text" value={shippingForm.country} onChange={e => setShippingForm({...shippingForm, country: e.target.value})} readOnly className="w-full border px-4 py-2 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                   </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">
                      ₹{cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-semibold text-emerald-600">Free</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-lg text-emerald-600">
                        ₹{cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-2">Payment Method</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="COD"
                          checked={paymentMethod === "COD"}
                          onChange={() => setPaymentMethod("COD")}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Cash on Delivery</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="Card"
                          checked={paymentMethod === "Card"}
                          onChange={() => setPaymentMethod("Card")}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Pay Online (Razorpay)</span>
                      </label>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-semibold"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

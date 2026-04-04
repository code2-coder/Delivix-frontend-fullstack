import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router";
import api from "../api/axios";

export function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/me/orders");
        // Backend returns "orders" with totalAmount, orderStatus, orderItems
        // We map them to the format expected by the UI
        const mappedOrders = data.orders.map(o => ({
          id: o._id,
          createdAt: o.createdAt,
          status: o.orderStatus.toLowerCase(),
          total: o.totalAmount,
          shippingInfo: o.shippingInfo,
          items: o.orderItems.map(item => ({
            product: { 
              id: item.product, 
              name: item.name, 
              image: item.image, 
              price: item.price 
            },
            quantity: item.quantity
          }))
        }));
        setOrders(mappedOrders.reverse());
      } catch (error) {
        console.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "processing":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start shopping to place your first order
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="mb-4">
                    <h4 className="font-semibold mb-1 text-gray-800">Delivery Address</h4>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-700">{order.shippingInfo?.fullName || "Not Provided"}</span> <br/>
                      {order.shippingInfo?.address}, {order.shippingInfo?.city}, {order.shippingInfo?.country} - {order.shippingInfo?.zipCode} <br/>
                      <span className="font-medium text-gray-700">Phone:</span> {order.shippingInfo?.phoneNo} {order.shippingInfo?.altPhoneNo && <span>| <span className="font-medium text-gray-700">Alt:</span> {order.shippingInfo?.altPhoneNo}</span>}
                    </p>
                  </div>
                  <div className="space-y-3 border-t pt-4">
                    {order.items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center space-x-4"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />

                        <div className="flex-1">
                          <p className="font-semibold">{item.product.name}</p>
                          <p className="text-gray-600 text-sm">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-lg text-emerald-600">
                        ₹{order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

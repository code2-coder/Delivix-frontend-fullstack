import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  Package,
  ShoppingBag,
  IndianRupee,
  Edit,
  Trash2,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import api from "../api/axios";

export function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Helper function to format INR cleanly
  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const [newCatName, setNewCatName] = useState("");
  const [newCatParent, setNewCatParent] = useState("");
  
  const handleAddCategory = async () => {
      if(!newCatName) return;
     try {
       const payload = { name: newCatName };
       if (newCatParent) payload.parentCategory = newCatParent;

       const { data } = await api.post("/admin/categories", payload);
       setCategories([...categories, data.category]);
       setNewCatName("");
       setNewCatParent("");
       toast.success("Category created!");
     } catch(error) { toast.error("Failed to add category"); }
  }

  const handleDeleteCategory = async (id) => {
     try {
       await api.delete(`/admin/categories/${id}`);
       setCategories(categories.filter(c => c._id !== id));
       toast.success("Deleted!");
     } catch(e) { toast.error("Failed to delete category"); }
  }

  // Load backend data
  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [ordersRes, productsRes, bannersRes, categoriesRes] = await Promise.all([
          api.get("/admin/orders"),
          api.get("/admin/products"),
          api.get("/banners"),
          api.get("/categories")
        ]);
        setOrders(ordersRes.data.orders.reverse() || []);
        setProducts(productsRes.data.products || []);
        setBanners(bannersRes.data.banners || []);
        setCategories(categoriesRes.data.categories || []);
      } catch (error) {
        toast.error("Failed to fetch admin data.");
        console.error(error);
      }
    };

    fetchData();
  }, [user, isAdmin, navigate]);

  // Orders
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { status: newStatus });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      ));
      toast.success("Order status updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/admin/orders/${orderId}`);
      setOrders(orders.filter(order => order._id !== orderId));
      toast.success("Order deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === "Pending" || o.orderStatus === "Processing").length;

  // Banners
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    image: "",
  });

  const handleFileChange = (e, callback) => {
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = () => {
          if (reader.readyState === 2) {
              callback(reader.result);
          }
      };
      reader.readAsDataURL(file);
  };

  const handleAddBanner = () => {
    setShowBannerForm(true);
    setEditingBanner(null);
    setBannerForm({ title: "", subtitle: "", image: "" });
  };

  const handleEditBanner = (banner) => {
    setShowBannerForm(true);
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image: banner.image || "",
    });
  };

  const handleSaveBanner = async () => {
    if (!bannerForm.title || !bannerForm.image) {
      toast.error("Title and Image are required");
      return;
    }

    try {
      if (editingBanner) {
        const { data } = await api.put(`/admin/banner/${editingBanner._id}`, bannerForm);
        setBanners(banners.map((b) => (b._id === editingBanner._id ? data.banner : b)));
        toast.success("Banner updated successfully");
      } else {
        const { data } = await api.post(`/admin/banner`, bannerForm);
        setBanners([...banners, data.banner]);
        toast.success("Banner added successfully");
      }
      setShowBannerForm(false);
      setBannerForm({ title: "", subtitle: "", image: "" });
    } catch (error) {
       toast.error("Failed to save banner");
       console.error(error)
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    try {
        await api.delete(`/admin/banner/${bannerId}`);
        setBanners(banners.filter((b) => b._id !== bannerId));
        toast.success("Banner deleted successfully");
    } catch (error) {
        toast.error("Failed to delete banner");
    }
  };

  // Products
  const [showProductForm, setShowProductForm] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    seller: "Delivix",
    images: [] // Upgraded to array
  });

  const handleProductImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    let base64Array = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          base64Array.push(reader.result);
          // Once all selected files have successfully translated to base64, commit to form state
          if (base64Array.length === files.length) {
            setProductForm({ ...productForm, images: base64Array });
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddProduct = () => {
      setShowProductForm(true);
      setEditingProduct(null);
      setProductForm({ name: "", description: "", price: 0, stock: 0, category: categories[0]?._id || "", seller: "Delivix", images: []});
  }

  const handleEditProduct = (product) => {
      setShowProductForm(true);
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category?._id || categories[0]?._id || "",
        seller: product.seller || "Delivix",
        images: product.images || []
      });
  }

  const handleSaveProduct = async () => {
      if (!productForm.name || !productForm.price || !productForm.category) {
          toast.error("Please fill all required fields");
          return;
      }
      
      try {
          const payload = {
              name: productForm.name,
              description: productForm.description,
              price: productForm.price,
              stock: productForm.stock,
              category: productForm.category,
              seller: productForm.seller,
          };
          
          // Only sync images if it is a brand new base64 buffer array from the local machine!
          if (productForm.images && productForm.images.length > 0) {
              if (typeof productForm.images[0] === 'string' && productForm.images[0].startsWith("data:image")) {
                  payload.images = productForm.images;
              }
          }

          setIsSavingProduct(true);
          if (editingProduct) {
             const { data } = await api.put(`/admin/products/${editingProduct._id}`, payload);
             setProducts(products.map(p => p._id === editingProduct._id ? data.product : p));
             toast.success("Product updated successfully");
          } else {
             const { data } = await api.post(`/admin/products`, payload);
             setProducts([...products, data.product]);
             toast.success("Product created successfully");
          }
          setShowProductForm(false);
      } catch (error) {
          toast.error("Failed to save product");
          console.error(error);
      } finally {
          setIsSavingProduct(false);
      }
  }

  const handleDeleteProduct = async (id) => {
      if (!window.confirm("Are you sure you want to permanently delete this product? This action cannot be undone.")) return;
      try {
          await api.delete(`/admin/products/${id}`);
          setProducts(products.filter(p => p._id !== id));
          toast.success("Deleted");
      } catch(e) {
          toast.error("Delete failed");
      }
  }


  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="flex space-x-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "dashboard"
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "orders"
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "products"
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("banners")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "banners"
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Banners
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "categories"
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Categories
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatINR(totalRevenue)}
                    </p>
                  </div>
                  <IndianRupee className="w-10 h-10 text-emerald-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold">{totalOrders}</p>
                  </div>
                  <Package className="w-10 h-10 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending Orders</p>
                    <p className="text-2xl font-bold">{pendingOrders}</p>
                  </div>
                  <Package className="w-10 h-10 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Products</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                  <ShoppingBag className="w-10 h-10 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-200"
                  >
                    <div>
                      <p className="font-semibold">Order #{order._id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">
                        {formatINR(order.totalAmount)}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {order.orderStatus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items & Delivery</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-emerald-50/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">#{order._id}</td>
                      <td className="px-6 py-4 min-w-[200px]">
                        <div>
                          <p className="font-semibold text-gray-800">{order.shippingInfo?.fullName || order.user?.name || "Guest User"}</p>
                          <p className="text-gray-500 text-xs">Acc: {order.user?.email || "No Email Bound"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 min-w-[300px]">
                        <div className="text-sm">
                          <p className="font-semibold">{order.shippingInfo?.address}, {order.shippingInfo?.city}</p>
                          <p className="text-gray-600">{order.shippingInfo?.zipCode}, {order.shippingInfo?.country}</p>
                          <p className="text-gray-500 text-xs mb-2">
                             Phone: {order.shippingInfo?.phoneNo} 
                             {order.shippingInfo?.altPhoneNo && <span className="text-gray-400"> | Alt: {order.shippingInfo?.altPhoneNo}</span>}
                          </p>
                          
                          <div className="bg-white p-3 rounded-lg border border-gray-200/60 max-h-32 overflow-y-auto shadow-inner mt-2">
                             <p className="text-xs font-semibold text-gray-600 mb-1 border-b pb-1">Ordered Items</p>
                             {order.orderItems?.map(item => (
                                <p key={item.product || Math.random()} className="text-xs flex justify-between py-1 border-b border-gray-50 last:border-b-0">
                                   <span className="text-gray-700 whitespace-normal line-clamp-2 pr-2">{item.quantity}x {item.name}</span>
                                   <span className="text-gray-500 flex-shrink-0">{formatINR(item.price)}</span>
                                </p>
                             ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">{formatINR(order.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            updateOrderStatus(order._id, e.target.value)
                          }
                          className="px-3 py-1 rounded-full text-sm font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDeleteOrder(order._id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-all duration-200">
                          <Trash2 className="w-5 h-5"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Product Management</h2>
              <button onClick={handleAddProduct} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center space-x-2">
                <Plus className="w-5 h-5"/><span>Add New</span>
              </button>
            </div>

            {showProductForm && (
                <div className="p-6 border-b bg-gray-50">
                   <h3 className="text-xl font-semibold mb-4">{editingProduct ? "Edit Product" : "Add Product"}</h3>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block mb-1 text-sm text-gray-700">Name</label>
                           <input type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full border px-4 py-2 rounded-lg" />
                       </div>
                       <div>
                           <label className="block mb-1 text-sm text-gray-700">Price (₹)</label>
                           <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} className="w-full border px-4 py-2 rounded-lg" />
                       </div>
                       <div>
                           <label className="block mb-1 text-sm text-gray-700">Category</label>
                           <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full border px-4 py-2 rounded-lg">
                               <option value="">Select a Category</option>
                               {categories.filter(c => !c.parentCategory).map(parent => (
                                   <optgroup key={parent._id} label={parent.name}>
                                       <option value={parent._id}>{parent.name} (Root)</option>
                                       {categories.filter(sub => sub.parentCategory === parent._id).map(sub => (
                                          <option key={sub._id} value={sub._id}>↳ {sub.name}</option>
                                       ))}
                                   </optgroup>
                               ))}
                           </select>
                       </div>
                       <div>
                           <label className="block mb-1 text-sm text-gray-700">Stock</label>
                           <input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} className="w-full border px-4 py-2 rounded-lg" />
                       </div>
                       <div className="col-span-2">
                           <label className="block mb-1 text-sm text-gray-700">Description</label>
                           <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full border px-4 py-2 rounded-lg"></textarea>
                       </div>
                       <div className="col-span-2 border-t pt-4 mt-2">
                           <label className="block mb-2 text-sm text-gray-700 font-semibold">Upload Product Images (Max 5)</label>
                           <input type="file" multiple accept="image/*" onChange={handleProductImagesChange} className="w-full border px-4 py-2 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                           
                           {/* Mini Gallery Preview */}
                           {productForm.images && productForm.images.length > 0 && (
                               <div className="mt-4 flex flex-wrap gap-4">
                                   {productForm.images.map((img, idx) => (
                                       <div key={idx} className="relative group">
                                           <img src={typeof img === 'string' ? img : img.url} alt="Preview" className="w-24 h-24 object-cover rounded-md border-2 border-gray-200 shadow-sm transition-all group-hover:border-emerald-500" />
                                           <button 
                                              type="button" 
                                              onClick={() => {
                                                 const newImages = [...productForm.images];
                                                  newImages.splice(idx, 1);
                                                  setProductForm({...productForm, images: newImages});
                                              }} 
                                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 hover:scale-110 transition-all z-10"
                                           >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                           </button>
                                       </div>
                                   ))}
                               </div>
                           )}
                       </div>
                   </div>
                   <div className="mt-6 flex space-x-4 border-t pt-4">
                        <button onClick={handleSaveProduct} disabled={isSavingProduct} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-emerald-400 flex items-center justify-center">
                           {isSavingProduct ? "Saving..." : "Save Product"}
                        </button>
                        <button onClick={() => setShowProductForm(false)} disabled={isSavingProduct} className="bg-gray-200 text-gray-800 font-medium px-6 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                   </div>
                </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-emerald-50/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.images?.[0]?.url || "https://placehold.co/100x100?text=No+Image"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm w-48 truncate text-gray-600">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{product.category?.name || "Uncategorized"}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">{formatINR(product.price)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset ${
                          product.stock > 15 ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : 
                          product.stock > 0 ? "bg-amber-50 text-amber-700 ring-amber-600/20" : 
                          "bg-rose-50 text-rose-700 ring-rose-600/20"
                        }`}>
                          {product.stock === 0 ? "Out of Stock" : `${product.stock} Units`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <button onClick={() => handleEditProduct(product)} className="text-blue-600 hover:text-blue-700 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-all duration-200">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteProduct(product._id)} className="text-red-600 hover:text-red-700 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-all duration-200">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "banners" && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Banner Management</h2>
              <button
                onClick={handleAddBanner}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Banner</span>
              </button>
            </div>

            {showBannerForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editingBanner ? "Edit Banner" : "Add New Banner"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input type="text" value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image File</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, (res) => setBannerForm({...bannerForm, image: res}))} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={handleSaveBanner} className="bg-emerald-600 text-white px-6 py-2 rounded-lg">Save Banner</button>
                    <button onClick={() => setShowBannerForm(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner) => (
                <div key={banner._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="text-center text-white px-4">
                        <h3 className="text-2xl font-bold">{banner.title}</h3>
                        <p className="text-lg">{banner.subtitle}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex justify-end space-x-2">
                    <button onClick={() => handleDeleteBanner(banner._id)} className="text-red-600 hover:text-red-700 flex items-center space-x-1">
                      <Trash2 className="w-5 h-5" /> <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {banners.length === 0 && !showBannerForm && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No banners yet</h3>
              </div>
            )}
          </div>
        )}

        {activeTab === "categories" && (
           <div className="space-y-6">
              {/* Root Categories Manager */}
              <div className="bg-white rounded-lg shadow-md p-6">
                 <h2 className="text-xl font-semibold mb-4 text-emerald-800 border-b pb-2">Primary Categories</h2>
                 <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New Root Category" className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    <button onClick={() => { setNewCatParent(""); handleAddCategory(); }} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center space-x-2 whitespace-nowrap">
                       <Plus className="w-5 h-5"/><span>Add Root</span>
                    </button>
                 </div>
                 
                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories.filter(c => !c.parentCategory).map(c => (
                        <li key={c._id} className="flex justify-between items-center border border-emerald-100 rounded-xl p-4 bg-emerald-50/30 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300">
                           <span className="font-bold text-gray-800 text-lg">{c.name}</span>
                           <button onClick={() => handleDeleteCategory(c._id)} className="text-red-500 hover:text-red-700 bg-white p-2 rounded-full shadow-sm hover:shadow hover:bg-red-50 hover:scale-110 transition-all duration-200">
                               <Trash2 className="w-5 h-5"/>
                           </button>
                        </li>
                    ))}
                    {categories.filter(c => !c.parentCategory).length === 0 && <p className="text-gray-500 py-2 col-span-2">No primary categories exist yet.</p>}
                 </ul>
              </div>

              {/* Sub Categories Manager */}
              <div className="bg-white rounded-lg shadow-md p-6">
                 <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">Sub Categories</h2>
                 <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New Subcategory Name" className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <select value={newCatParent} onChange={e => setNewCatParent(e.target.value)} className="flex-1 border border-gray-300 px-4 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                       <option value="">- Attach to Primary Category -</option>
                       {categories.filter(c => !c.parentCategory).map(c => (
                           <option key={c._id} value={c._id}>{c.name}</option>
                       ))}
                    </select>
                    <button onClick={() => { if(!newCatParent) { toast.error("Please pick a primary category first"); return; } handleAddCategory(); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 whitespace-nowrap">
                       <Plus className="w-5 h-5"/><span>Add Sub</span>
                    </button>
                 </div>
                 
                 <ul className="space-y-3">
                    {categories.filter(c => c.parentCategory).map(c => {
                        const parent = categories.find(p => p._id === c.parentCategory);
                        return (
                        <li key={c._id} className="flex justify-between items-center border border-gray-200 rounded-xl p-3 bg-white shadow-sm hover:border-blue-300 transition-all duration-300">
                           <div className="flex items-center space-x-3 pl-2">
                              <span className="text-blue-500 font-bold">↳</span>
                              <span className="font-semibold text-gray-700">{c.name}</span>
                              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-md">in {parent?.name || "Unknown"}</span>
                           </div>
                           <button onClick={() => handleDeleteCategory(c._id)} className="text-red-400 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all duration-200">
                               <Trash2 className="w-5 h-5"/>
                           </button>
                        </li>
                    )})}
                    {categories.filter(c => c.parentCategory).length === 0 && <p className="text-gray-500 py-2">No nested sub-categories created yet.</p>}
                 </ul>
              </div>
           </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

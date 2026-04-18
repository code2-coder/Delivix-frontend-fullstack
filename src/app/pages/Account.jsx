import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Shield, Package, ShoppingCart, Lock, Edit3, Save, X, Phone, MapPin, LogOut } from "lucide-react";
import { toast } from "sonner";
import api from "../api/axios";
import { useSEO } from "../hooks/useSEO";

export function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useSEO("Account Center", "Manage your Delivix customer details, shipping addresses, securely update your password, or review your order history.");

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phoneNumber: "", address: "" });

  // Password State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setProfileForm({ 
        name: user.name, 
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        address: user.address || ""
      });
    }
  }, [user, navigate]);

  if (!user) return null;

  //
  // ✏️ Handle Profile Update
  //
  const handleUpdateProfile = async () => {
    if(!profileForm.name || !profileForm.email) {
       return toast.error("Name and Email cannot be empty.");
    }
    if(profileForm.phoneNumber && profileForm.phoneNumber.length > 15) {
       return toast.error("Phone number cannot exceed 15 characters.");
    }
    if(profileForm.address && profileForm.address.length > 200) {
       return toast.error("Address cannot exceed 200 characters.");
    }
    try {
      await api.put("/me/update", profileForm);
      toast.success("Profile updated successfully! Refreshing...");
      setIsEditing(false);
      setTimeout(() => window.location.reload(), 1500); // hard refresh to sync context
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  //
  // 🔐 Handle Password Update
  //
  const handleUpdatePassword = async () => {
    if (passwordForm.password !== passwordForm.confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    try {
      await api.put("/password/update", {
        oldPassword: passwordForm.oldPassword,
        password: passwordForm.password
      });
      toast.success("Password secured and updated.");
      setIsChangingPassword(false);
      setPasswordForm({ oldPassword: "", password: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-emerald-200">
      <Header />

      {/* Modern Gradient Hero Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 py-16 -mb-20 shadow-inner">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white tracking-tight animate-in slide-in-from-bottom-4 duration-500">My Account Center</h1>
            <p className="text-emerald-100 mt-2 font-medium opacity-90">Manage your profile, security, and dashboard settings.</p>
         </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Profile info & Password */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-white/50 hover:shadow-2xl hover:border-emerald-100 transition-all duration-500">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-semibold text-gray-800">Profile Details</h2>
                   {!isEditing ? (
                       <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4"/><span>Edit</span>
                       </button>
                   ) : (
                       <button onClick={() => {setIsEditing(false); setProfileForm({name: user.name, email: user.email, phoneNumber: user.phoneNumber || "", address: user.address || ""})}} className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 bg-gray-100 px-4 py-2 rounded-lg transition-colors">
                          <X className="w-4 h-4"/><span>Cancel</span>
                       </button>
                   )}
                </div>

                {isEditing ? (
                   <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300 bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                             <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow shadow-sm" />
                         </div>
                         <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                             <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow shadow-sm" />
                         </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                             <input type="text" placeholder="+91 XXXXX XXXXX" value={profileForm.phoneNumber} onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow shadow-sm" />
                         </div>
                         <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
                             <input type="text" placeholder="Building, Street, City" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow shadow-sm" />
                         </div>
                      </div>
                      <button onClick={handleUpdateProfile} className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 shadow-sm flex justify-center items-center space-x-2 mt-4">
                         <Save className="w-5 h-5"/><span>Save Changes</span>
                      </button>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                      <div className="flex items-center space-x-4">
                         <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                            <User className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                         </div>
                      </div>
                      <div className="flex items-center space-x-4">
                         <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                            <Mail className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-sm text-gray-500">Email Address</p>
                            <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                         </div>
                      </div>
                      {user.phoneNumber && (
                        <div className="flex items-center space-x-4">
                           <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                              <Phone className="w-6 h-6" />
                           </div>
                           <div>
                              <p className="text-sm text-gray-500">Mobile Number</p>
                              <p className="text-lg font-semibold text-gray-800">{user.phoneNumber}</p>
                           </div>
                        </div>
                      )}
                      {user.address && (
                        <div className="flex items-center space-x-4">
                           <div className="bg-teal-100 p-3 rounded-full text-teal-600">
                              <MapPin className="w-6 h-6" />
                           </div>
                           <div>
                              <p className="text-sm text-gray-500">Address</p>
                              <p className="text-lg font-semibold text-gray-800 truncate max-w-[200px]">{user.address}</p>
                           </div>
                        </div>
                      )}
                      <div className="flex items-center space-x-4">
                         <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                            <Shield className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-sm text-gray-500">Account Type</p>
                            <p className="text-lg font-semibold text-gray-800 capitalize">{user.role}</p>
                         </div>
                      </div>
                   </div>
                )}
             </div>

              {/* CHANGE PASSWORD TARGET SECTION */}
             <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-white/50 hover:shadow-2xl transition-all duration-500">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2"><Lock className="w-5 h-5 text-gray-500"/><span>Security Settings</span></h2>
                </div>
                {!isChangingPassword ? (
                    <button onClick={() => setIsChangingPassword(true)} className="border-2 border-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all w-full sm:w-auto shadow-sm">
                        Change Password
                    </button>
                ) : (
                    <div className="space-y-5 animate-in slide-in-from-top-4 fade-in duration-300 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                            <input type="password" placeholder="Enter old password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-gray-400 outline-none shadow-sm transition-shadow" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                                <input type="password" placeholder="Enter new password" value={passwordForm.password} onChange={e => setPasswordForm({...passwordForm, password: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-shadow" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                                <input type="password" placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-shadow" />
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-4">
                            <button onClick={handleUpdatePassword} className="bg-gray-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-black transition-colors">Apply Password</button>
                            <button onClick={() => {setIsChangingPassword(false); setPasswordForm({oldPassword:"", password:"", confirmPassword:""})}} className="bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                        </div>
                    </div>
                )}
             </div>

          </div>

          {/* RIGHT COLUMN: Quick Links */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 p-6 sticky top-24 border border-white/50">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Quick Navigation</h2>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate("/orders")}
                    className="w-full flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                       <Package className="w-6 h-6 text-emerald-600" />
                       <div className="text-left">
                          <p className="font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">My Orders</p>
                          <p className="text-xs text-gray-500">Track parsing shipments</p>
                       </div>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate("/cart")}
                    className="w-full flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                       <ShoppingCart className="w-6 h-6 text-blue-600" />
                       <div className="text-left">
                          <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">Shopping Cart</p>
                          <p className="text-xs text-gray-500">Checkout items queued</p>
                       </div>
                    </div>
                  </button>
                  {user.role === "admin" && (
                    <button
                        onClick={() => navigate("/admin")}
                        className="w-full flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 hover:shadow-sm transition-all duration-300 group mt-4 origin-bottom"
                    >
                        <div className="flex items-center space-x-4">
                        <Shield className="w-6 h-6 text-purple-600" />
                        <div className="text-left">
                            <p className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">Admin Panel</p>
                            <p className="text-xs text-gray-500">Manage all data</p>
                        </div>
                        </div>
                    </button>
                  )}
                  
                  {/* Sidebar Logout Button */}
                  <button
                    onClick={logout}
                    className="w-full flex justify-between items-center p-4 rounded-xl border border-red-100 hover:border-red-200 hover:bg-red-50 hover:shadow-sm transition-all duration-300 group mt-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-red-100 p-2 rounded-lg text-red-600 group-hover:bg-red-200 transition-colors">
                        <LogOut className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-red-600 group-hover:text-red-700 transition-colors">Sign Out</p>
                        <p className="text-xs text-red-400">Exit your session</p>
                      </div>
                    </div>
                  </button>
                </div>
             </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}

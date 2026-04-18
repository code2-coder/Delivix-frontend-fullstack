import { Link, useNavigate } from "react-router";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  Grid,
  ChevronDown,
  X,
  Loader2,
  Menu
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useCategory } from "../context/CategoryContext";
import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [liveResults, setLiveResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { categories } = useCategory();
  const [showCategories, setShowCategories] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  
  const searchRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Live Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          setIsSearching(true);
          const { data } = await api.get(`/products?keyword=${encodeURIComponent(searchQuery)}&limit=5`);
          setLiveResults(data.products || []);
          setShowSearchDropdown(true);
        } catch (err) {
          console.error("Live search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setLiveResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const parents = categories.filter(c => !c.parentCategory);
    if (parents.length > 0 && !activeCategory) {
      setActiveCategory(parents[0]._id);
    }
  }, [categories]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="flex items-center drop-shadow-sm">
                 <div className="bg-emerald-100 p-2 rounded-xl mr-3 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                    <Package className="w-6 h-6 text-emerald-600" />
                 </div>
                 <span className="bg-gradient-to-r from-emerald-700 to-teal-500 text-transparent bg-clip-text font-black text-2xl tracking-tighter uppercase mr-4">
                   Delivix
                 </span>
              </div>
            </Link>

            {/* Categories Dropdown */}
            <div className="relative group hidden lg:block">
              <button 
                className="flex items-center space-x-1.5 text-gray-600 hover:text-emerald-600 font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-50 transition-all duration-300"
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
              >
                <Grid className="w-5 h-5" />
                <span>Categories</span>
                <ChevronDown className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
              </button>

              {/* Dropdown Menu */}
              {showCategories && (
                <div 
                  className="absolute top-full left-0 w-[800px] pt-4"
                  onMouseEnter={() => setShowCategories(true)}
                  onMouseLeave={() => setShowCategories(false)}
                >
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex overflow-hidden min-h-[400px] max-h-[70vh] animate-in fade-in slide-in-from-top-4 duration-200">
                    {/* Left Sidebar (Parent Categories) */}
                    <div className="w-1/3 bg-gray-50 border-r border-gray-100 py-4 overflow-y-auto custom-scrollbar">
                      <div className="px-6 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Categories
                      </div>
                      <ul className="flex flex-col">
                        {categories.filter(c => !c.parentCategory).map((parent) => (
                          <li 
                            key={parent._id}
                            onMouseEnter={() => setActiveCategory(parent._id)}
                            className={`cursor-pointer flex justify-between items-center transition-all ${
                              activeCategory === parent._id 
                                ? "bg-white text-emerald-600 font-bold border-l-4 border-emerald-500 shadow-sm pl-5 pr-6 py-3" 
                                : "text-gray-700 hover:bg-gray-100 font-medium border-l-4 border-transparent pl-6 pr-6 py-3"
                            }`}
                          >
                            <Link 
                              to={`/?category=${encodeURIComponent(parent.name)}`} 
                              onClick={() => setShowCategories(false)} 
                              className="flex-1 truncate"
                            >
                              {parent.name}
                            </Link>
                            <ChevronDown className="w-4 h-4 -rotate-90 opacity-50 flex-shrink-0 ml-2" />
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Right Content (Subcategories) */}
                    <div className="w-2/3 bg-white p-8 overflow-y-auto custom-scrollbar">
                      {activeCategory ? (
                        <>
                          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                              {categories.find(c => c._id === activeCategory)?.name || "Explore"}
                            </h3>
                            <Link 
                              to={`/?category=${encodeURIComponent(categories.find(c => c._id === activeCategory)?.name || "")}`}
                              className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 hover:bg-emerald-50 px-4 py-1.5 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                              onClick={() => setShowCategories(false)}
                            >
                              Shop All
                            </Link>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {categories.filter(sub => sub.parentCategory === activeCategory).length > 0 ? (
                              categories.filter(sub => sub.parentCategory === activeCategory).map(sub => (
                                <Link
                                  key={sub._id}
                                  to={`/?category=${encodeURIComponent(sub.name)}`}
                                  className="group flex items-center p-3 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all duration-200"
                                  onClick={() => setShowCategories(false)}
                                >
                                  <div className="w-2 h-2 rounded-full bg-gray-200 group-hover:bg-emerald-400 mr-3 transition-colors" />
                                  <span className="text-gray-600 group-hover:text-emerald-700 font-medium group-hover:translate-x-1 transition-transform truncate">
                                    {sub.name}
                                  </span>
                                </Link>
                              ))
                            ) : (
                              <p className="text-sm text-gray-400 col-span-2 py-4 px-2 italic">
                                Exploring {categories.find(c => c._id === activeCategory)?.name}...
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 font-medium">
                          <Grid className="w-5 h-5 mr-2 opacity-50" />
                          Hover over a category
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8 hidden md:block" ref={searchRef}>
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSearchDropdown(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-5 py-2.5 pl-12 pr-10 rounded-2xl bg-gray-100 border-2 border-transparent focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 font-medium text-gray-700"
              />

              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
              
              {isSearching ? (
                <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500 w-5 h-5 animate-spin" />
              ) : searchQuery && (
                <button 
                  type="button"
                  onClick={() => { setSearchQuery(""); setShowSearchDropdown(false); }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Search Suggestions Dropdown */}
              {showSearchDropdown && (searchQuery.trim().length >= 2) && (
                <div className="absolute top-full left-0 w-full mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                  {liveResults.length > 0 ? (
                    <div className="py-2">
                       <div className="px-5 py-2 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-50 mb-1">
                          Products
                       </div>
                       {liveResults.map(product => (
                          <Link
                            key={product._id}
                            to={`/product/${product._id}`}
                            onClick={() => setShowSearchDropdown(false)}
                            className="flex items-center px-5 py-3 hover:bg-emerald-50 transition-colors group"
                          >
                             <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 mr-4 flex-shrink-0 bg-gray-50">
                                <img 
                                  src={product.images?.[0]?.url || product.image} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                                />
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-800 truncate group-hover:text-emerald-700">
                                   {product.name}
                                </h4>
                                <p className="text-emerald-600 font-extrabold text-xs mt-0.5">
                                   ₹{product.price.toFixed(2)}
                                </p>
                             </div>
                             <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                          </Link>
                       ))}
                       <button 
                         onClick={handleSearch}
                         className="w-full py-3 bg-gray-50 text-emerald-700 text-xs font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border-t border-gray-100"
                        >
                          View All Results
                       </button>
                    </div>
                  ) : !isSearching ? (
                    <div className="p-8 text-center">
                       <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                       <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">No products found</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </form>
          <div className="flex items-center space-x-6">
            {/* Search Toggle (Mobile) */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-emerald-600"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open search and menu"
            >
              <Search className="w-6 h-6" />
            </button>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="hidden lg:flex items-center space-x-1.5 text-gray-600 hover:text-emerald-600 font-semibold transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="hidden sm:inline pt-0.5">Admin</span>
                  </Link>
                )}
                <Link
                  to="/cart"
                  className="relative flex items-center space-x-1.5 text-gray-600 hover:text-emerald-600 font-semibold transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 bg-emerald-600 text-white font-bold text-[10px] rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-md">
                      {cartCount}
                    </span>
                  )}
                  <span className="hidden sm:inline pt-0.5">Cart</span>
                </Link>
                <Link
                  to="/account"
                  className="hidden sm:flex items-center space-x-1.5 text-gray-600 hover:text-emerald-600 font-semibold transition-all duration-300 bg-gray-100/50 px-3 py-1.5 rounded-xl border border-gray-100 hover:border-emerald-200"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline pt-0.5">{user.name.split(" ")[0]}</span>
                </Link>

                {/* Logout Button (Desktop) */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-1.5 text-red-500 hover:text-red-600 font-semibold transition-all duration-300 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 hover:border-red-200"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                
                {/* Mobile Menu Trigger */}
                <button 
                  className="lg:hidden p-2 text-gray-700 hover:text-emerald-600"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="w-7 h-7" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                >
                  Sign In
                </Link>
                <button 
                  className="lg:hidden p-2 text-gray-700 hover:text-emerald-600 relative z-[110]"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-expanded={isMobileMenuOpen}
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {/* Animated Hamburger Icon */}
                  <div className="relative w-7 h-7 flex flex-col justify-center items-center group">
                    <span 
                      className={`block absolute h-0.5 w-7 bg-current rounded-full transition-all duration-300 ease-in-out ${
                        isMobileMenuOpen ? "rotate-45" : "-translate-y-2"
                      }`}
                    />
                    <span 
                      className={`block absolute h-0.5 w-7 bg-current rounded-full transition-all duration-300 ease-in-out ${
                        isMobileMenuOpen ? "opacity-0" : "opacity-100"
                      }`}
                    />
                    <span 
                      className={`block absolute h-0.5 w-7 bg-current rounded-full transition-all duration-300 ease-in-out ${
                        isMobileMenuOpen ? "-rotate-45" : "translate-y-2"
                      }`}
                    />
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Content */}
          <div className="absolute top-0 right-0 w-[300px] sm:w-[350px] h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col">
            <div className="p-8 flex justify-between items-center border-b border-gray-50/50">
              <span className="font-black text-2xl text-emerald-600 uppercase tracking-tighter">Menu</span>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Mobile Search */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Search Products</p>
                <form onSubmit={handleSearch} className="relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find premium items..."
                    className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                  <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                </form>
              </div>

              {/* Mobile Categories */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Categories</p>
                <div className="grid grid-cols-1 gap-2">
                  {categories.filter(c => !c.parentCategory).slice(0, 8).map(cat => (
                    <Link 
                      key={cat._id}
                      to={`/?category=${encodeURIComponent(cat.name)}`}
                      className="flex items-center p-3 rounded-xl hover:bg-emerald-50 text-gray-700 font-bold text-sm transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Grid className="w-4 h-4 mr-3 text-emerald-500 opacity-50" />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account Links (Mobile Only) */}
              <div className="pt-4 border-t border-gray-50 space-y-4">
                 {user && (
                    <>
                       <Link to="/account" className="flex items-center space-x-3 text-gray-700 font-bold p-2" onClick={() => setIsMobileMenuOpen(false)}>
                          <User className="w-5 h-5 opacity-50" />
                          <span>My Account</span>
                       </Link>
                       {isAdmin && (
                          <Link to="/admin" className="flex items-center space-x-3 text-gray-700 font-bold p-2" onClick={() => setIsMobileMenuOpen(false)}>
                             <LayoutDashboard className="w-5 h-5 opacity-50" />
                             <span>Dashboard</span>
                          </Link>
                       )}
                       <button 
                         onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                         className="flex items-center space-x-3 text-red-500 font-bold p-2 w-full text-left"
                       >
                          <LogOut className="w-5 h-5 opacity-50" />
                          <span>Sign Out</span>
                       </button>
                    </>
                 )}
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 text-center">
               <p className="text-xs text-gray-400 font-medium">© 2024 Delivix Premium</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

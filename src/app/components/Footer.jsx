import { Link } from "react-router";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  Package,
  MapPin,
  ChevronRight
} from "lucide-react";
import { useCategory } from "../context/CategoryContext";

export function Footer() {
  const { categories } = useCategory();
  const topCategories = categories.filter(c => !c.parentCategory).slice(0, 4);

  return (
    <footer className="relative bg-[#0b1121] text-gray-300 mt-16 border-t-2 border-emerald-500 overflow-hidden">
      {/* Premium dark glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-30 translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 group mb-6 inline-flex">
               <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-2xl mr-2 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                  <Package className="w-6 h-6 text-emerald-400" />
               </div>
               <span className="bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text font-black text-2xl tracking-tighter uppercase">
                 Delivix
               </span>
            </Link>
            <p className="text-gray-400 leading-relaxed font-medium mb-6">
               Your premier destination for the latest tech gadgets, premium accessories, and modern electronics delivered fast.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="bg-slate-800/80 p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-emerald-600 transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-slate-800/80 p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-emerald-600 transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="bg-slate-800/80 p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-emerald-600 transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-white tracking-wide">Quick Links</h3>
            <ul className="space-y-4">
              {['Home', 'My Account', 'Orders', 'Shopping Cart'].map((item, idx) => {
                 const routes = ['/', '/account', '/orders', '/cart'];
                 return (
                  <li key={idx}>
                    <Link to={routes[idx]} className="group flex items-center text-gray-400 hover:text-emerald-400 transition-all font-medium">
                      <ChevronRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-1 text-emerald-500" />
                      {item}
                    </Link>
                  </li>
                 )
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-white tracking-wide">Top Categories</h3>
            <ul className="space-y-4">
              {topCategories.length > 0 ? topCategories.map((cat) => (
                <li key={cat._id}>
                  <Link to={`/?category=${encodeURIComponent(cat.name)}`} className="group flex items-center text-gray-400 hover:text-emerald-400 transition-all font-medium">
                    <ChevronRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-1 text-emerald-500" />
                    {cat.name}
                  </Link>
                </li>
              )) : (
                <li className="text-gray-500 font-medium italic">Loading electronics...</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-white tracking-wide">Contact Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start space-x-4 text-gray-400 group">
                <div className="bg-slate-800/80 p-2 rounded-lg group-hover:bg-emerald-900/40 transition-colors border border-transparent group-hover:border-emerald-500/30">
                   <Phone className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-semibold text-gray-300 mt-1 hover:text-emerald-400 transition-colors cursor-pointer">+91 8767316759</span>
              </li>
              <li className="flex items-start space-x-4 text-gray-400 group">
                <div className="bg-slate-800/80 p-2 rounded-lg group-hover:bg-emerald-900/40 transition-colors border border-transparent group-hover:border-emerald-500/30">
                   <Mail className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-semibold text-gray-300 mt-1 hover:text-emerald-400 transition-colors cursor-pointer">support@delivix.in</span>
              </li>
              {/* <li className="flex items-start space-x-4 text-gray-400 group">
                <div className="bg-slate-800/80 p-2 rounded-lg group-hover:bg-emerald-900/40 transition-colors border border-transparent group-hover:border-emerald-500/30">
                   <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-medium text-gray-400 pt-1 leading-relaxed">Level 4, Commerce House, Mumbai, Maharashtra 400010</span>
              </li> */}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-gray-500 font-semibold mb-4 md:mb-0">&copy; {new Date().getFullYear()} Delivix E-Commerce. All rights reserved.</p>
          <div className="flex space-x-8 text-gray-500 font-semibold">
             <Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
             <Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

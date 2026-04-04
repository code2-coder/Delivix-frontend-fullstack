import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useSEO } from "../hooks/useSEO";

export function PrivacyPolicy() {
  useSEO("Privacy Policy", "Read the Delivix privacy policy.");
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Privacy Policy</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 prose prose-emerald max-w-none text-gray-600">
          <p className="mb-4 font-semibold text-emerald-600">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">1. Information We Collect</h2>
          <p className="mb-4 leading-relaxed">We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This includes your name, email address, shipping address, phone number, and payment information.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">2. How We Use Your Information</h2>
          <p className="mb-4 leading-relaxed">We use the information we collect to process your orders, maintain your account, send you related information including order confirmations, and respond to your customer service requests.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">3. Information Sharing</h2>
          <p className="mb-4 leading-relaxed">We do not share your personal information with third parties except as necessary to process your payments and ship your orders (e.g., payment gateways and shipping carriers).</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">4. Contact Us</h2>
          <p className="mb-4 leading-relaxed">If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@delivix.in" className="text-emerald-600 hover:underline">support@delivix.in</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

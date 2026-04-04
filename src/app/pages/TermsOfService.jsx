import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useSEO } from "../hooks/useSEO";

export function TermsOfService() {
  useSEO("Terms of Service", "Read the Delivix terms of service.");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Terms of Service</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 prose prose-emerald max-w-none text-gray-600">
          <p className="mb-4 font-semibold text-emerald-600">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">1. Acceptance of Terms</h2>
          <p className="mb-4 leading-relaxed">By accessing or using Delivix, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">2. User Accounts</h2>
          <p className="mb-4 leading-relaxed">When you create an account, you must provide accurate and complete information. You are solely responsible for the activity that occurs on your account and must keep your account password secure.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">3. Products and Pricing</h2>
          <p className="mb-4 leading-relaxed">All prices are subject to change without notice. We reserve the right to modify or discontinue any product at any time. We shall not be liable to you or any third party for any modification, price change, or discontinuance.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">4. Returns and Refunds</h2>
          <p className="mb-4 leading-relaxed">Please review our Return Policy for detailed information on returns and refunds. We reserve the right to refuse service to anyone for any reason at any time.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

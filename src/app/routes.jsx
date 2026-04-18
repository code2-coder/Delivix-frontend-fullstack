import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";

// Lazy load components
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const Login = lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const Register = lazy(() => import("./pages/Register").then(m => ({ default: m.Register })));
const Cart = lazy(() => import("./pages/Cart").then(m => ({ default: m.Cart })));
const Orders = lazy(() => import("./pages/Orders").then(m => ({ default: m.Orders })));
const Account = lazy(() => import("./pages/Account").then(m => ({ default: m.Account })));
const Admin = lazy(() => import("./pages/Admin").then(m => ({ default: m.Admin })));
const ProductDetails = lazy(() => import("./pages/ProductDetails").then(m => ({ default: m.ProductDetails })));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail").then(m => ({ default: m.VerifyEmail })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy").then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import("./pages/TermsOfService").then(m => ({ default: m.TermsOfService })));

import { ProtectedRoute } from "./components/ProtectedRoute";

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const LazyComponent = ({ Component }) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LazyComponent Component={Home} />,
  },
  {
    path: "/verify-email/:token",
    element: <LazyComponent Component={VerifyEmail} />,
  },
  {
    path: "/privacy",
    element: <LazyComponent Component={PrivacyPolicy} />,
  },
  {
    path: "/terms",
    element: <LazyComponent Component={TermsOfService} />,
  },
  {
    path: "/login",
    element: <LazyComponent Component={Login} />,
  },
  {
    path: "/register",
    element: <LazyComponent Component={Register} />,
  },
  {
    path: "/product/:id",
    element: <LazyComponent Component={ProductDetails} />,
  },
  {
    path: "/cart",
    element: <LazyComponent Component={Cart} />,
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: "/orders",
        element: <LazyComponent Component={Orders} />,
      },
      {
        path: "/account",
        element: <LazyComponent Component={Account} />,
      },
    ],
  },
  {
    element: <ProtectedRoute adminOnly={true} />,
    children: [
      {
        path: "/admin",
        element: <LazyComponent Component={Admin} />,
      },
    ],
  },
]);

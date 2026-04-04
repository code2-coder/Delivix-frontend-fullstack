import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Cart } from "./pages/Cart";
import { Orders } from "./pages/Orders";
import { Account } from "./pages/Account";
import { Admin } from "./pages/Admin";
import { ProductDetails } from "./pages/ProductDetails";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { VerifyEmail } from "./pages/VerifyEmail";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/verify-email/:token",
    Component: VerifyEmail,
  },
  {
    path: "/privacy",
    Component: PrivacyPolicy,
  },
  {
    path: "/terms",
    Component: TermsOfService,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/product/:id",
    Component: ProductDetails,
  },
  {
    path: "/cart", // Usually cart can be public but depends on requirement; letting it be public for now if guests can shop
    Component: Cart,
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: "/orders",
        Component: Orders,
      },
      {
        path: "/account",
        Component: Account,
      },
    ],
  },
  {
    element: <ProtectedRoute adminOnly={true} />,
    children: [
      {
        path: "/admin",
        Component: Admin,
      },
    ],
  },
]);

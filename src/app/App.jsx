import { RouterProvider } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CategoryProvider } from "./context/CategoryContext";
import { Toaster } from "sonner";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <CategoryProvider>
        <CartProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </CartProvider>
      </CategoryProvider>
    </AuthProvider>
  );
}

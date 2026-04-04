import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/categories");
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, setCategories, loading, fetchCategories }}>
        {children}
    </CategoryContext.Provider>
  );
}

export const useCategory = () => useContext(CategoryContext);

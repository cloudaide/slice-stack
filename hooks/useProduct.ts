import ICategory from "../types/ICategory";
import { useCallback, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";

interface ICategoryQuery {
  cat_id: number;
  product_id: number;
  category_name: string;
  product_name: string;
  description: string;
  price: number;
  category_id: number;
}

export default function useProduct() {
  const db = useSQLiteContext();
  const [products, setProducts] = useState<ICategory[]>([]);

  const getCategoriesWithProduct = async () => {
    const categoryQuery: ICategoryQuery[] = await db.getAllAsync(`
      SELECT 
          categories.id as cat_id,
          products.id as product_id,
          categories.category_name,
          products.product_name,
          products.description,
          products.price,
          products.category_id
      FROM categories
      LEFT JOIN products
      ON products.category_id = categories.id
      ORDER BY products.id ASC;
    `);
    const categories = categoryQuery.reduce((previousValue: ICategory[], current: ICategoryQuery) => {
      const categoryInPrev = previousValue.findIndex((cat: ICategory) => cat.id === current.cat_id);

      if (categoryInPrev >= 0) {
        previousValue[categoryInPrev]?.products.push({
          id: current.product_id,
          product_name: current.product_name,
          description: current.description,
          price: current.price,
          category_id: current.cat_id,
        });
      } else {
        previousValue.push({
          id: current.cat_id,
          name: current.category_name,
          products: [
            {
              id: current.product_id,
              product_name: current.product_name,
              description: current.description,
              price: current.price,
              category_id: current.cat_id,
            }
          ]
        });
      }
      return previousValue;
    }, []);
    setProducts(categories);
  }

  const saveProduct = async (details: { id: number; product_name: string; description: string; extra_info: string; price: string; }) => {
    try {
      const result = await db.runAsync(`
        UPDATE products SET 
          product_name = ?,
          description = ?,
          extra_info = ?,
          price = ?
        WHERE id = ?;`, [details?.product_name, details?.description, details?.extra_info, details?.price, details?.id]);
      if (result.lastInsertRowId) {
        await refetchData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function refetchData() {
    await getCategoriesWithProduct();
  }

  useFocusEffect(
    useCallback(() => {
      async function refetchData2() {
        await getCategoriesWithProduct();
      }
      refetchData2();
    }, [])
  );

  return {
    products,
    saveProduct,
    refetchData,
  }
}
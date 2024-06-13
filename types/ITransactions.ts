import IProduct from "./IProduct";

export interface ITransactions {
  id: number;
  total: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface ITransactionDetails {
  transaction_id: number;
  product_id: number;
  total_price: number;
  product: IProduct;
  quantity: number;
  product_name?: string;
  description?: string;
  extra_info?: string;
}
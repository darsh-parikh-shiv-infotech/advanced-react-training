export type ProductFormValues = {
  title: string;
  description: string;
  brand: string;
  category: string;
  price: string;
  discountPercentage: string;
  stock: string;
};

export type ProductFormState = {
  success: boolean;
  message: string;
  fieldErrors?: Partial<Record<keyof ProductFormValues, string>>;
  productId?: number;
};

export const initialProductFormValues: ProductFormValues = {
  title: "",
  description: "",
  brand: "",
  category: "",
  price: "",
  discountPercentage: "0",
  stock: "0",
};

export const initialProductFormState: ProductFormState = {
  success: false,
  message: "",
};

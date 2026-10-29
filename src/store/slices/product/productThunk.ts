import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiError, type ApiErrorPayload } from "../../../api/apiError";
import { addProductApi, deleteProductApi, fetchProductApi } from "../../../api/productApi";
import { COMMON_ERROR_MESSAGES } from "../../../utils/constants";

export type review = {
  rating: number;
  comment: string;
  data: string;
  reviewerName: string;
  reviewerEmail: string;
};
export type product = {
  id: number;
  title: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  warrantyInformation: string;
  shippingInformation: string;
  returnPolicy: string;
  images: string[] | [];
  thumbnail: string | null;
  reviews: review[] | [];
};
export type fetchProductRequest = {
  search?: string | null;
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: "asc" | "desc";
};
export type fetchProductResponse = {
  products: product[];
  total: number;
  skip: number;
  limit: number;
};
export type deleteProductRequest = {
  id: number;
};
export type deleteProductResponse = {
  id: number;
  isDeleted: boolean;
};
export type addProductRequest = Partial<product>;
export type addProductResponse = {
  id: number;
};

export const fetchProduct = createAsyncThunk<
  fetchProductResponse,
  fetchProductRequest,
  { rejectValue: ApiErrorPayload }
>(
  "product/fetchProduct",
  async (
    { search = null, skip = 0, limit = 10, sortBy = "id", order = "asc" },
    { rejectWithValue, signal },
  ) => {
    try {
      const response = await fetchProductApi({ search, skip, limit, sortBy, order }, signal);

      return response;
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        return rejectWithValue({
          message: error.message,
          status: error.status,
          code: error.code,
        });
      }

      return rejectWithValue({
        message: COMMON_ERROR_MESSAGES.UNEXPECTED_ERROR,
      });
    }
  },
);

export const fetchProductFeed = createAsyncThunk<
  fetchProductResponse,
  fetchProductRequest,
  { rejectValue: ApiErrorPayload }
>(
  "product/fetchProductFeed",
  async (
    { search = null, skip = 0, limit = 10, sortBy = "id", order = "asc" },
    { rejectWithValue, signal },
  ) => {
    try {
      return await fetchProductApi({ search, skip, limit, sortBy, order }, signal);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        return rejectWithValue({
          message: error.message,
          status: error.status,
          code: error.code,
        });
      }

      return rejectWithValue({
        message: COMMON_ERROR_MESSAGES.UNEXPECTED_ERROR,
      });
    }
  },
);

export const deleteProduct = createAsyncThunk<
  deleteProductResponse,
  deleteProductRequest,
  { rejectValue: ApiErrorPayload }
>("product/deleteProduct", async ({ id }, { rejectWithValue }) => {
  try {
    return await deleteProductApi({ id });
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
        code: error.code,
      });
    }

    return rejectWithValue({
      message: COMMON_ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
});

export const createProduct = createAsyncThunk<
  addProductResponse,
  addProductRequest,
  { rejectValue: ApiErrorPayload }
>("product/addProduct", async (body, { rejectWithValue }) => {
  try {
    return await addProductApi(body);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
        code: error.code,
      });
    }

    return rejectWithValue({
      message: COMMON_ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
  }
});

import { createSlice } from "@reduxjs/toolkit";
import {
  createProduct,
  deleteProduct,
  fetchProduct,
  fetchProductFeed,
  type product,
} from "./productThunk";
import { COMMON_ERROR_MESSAGES } from "../../../utils/constants";

type states = "loading" | "idle" | "success" | "error";
type ProductState = {
  erorr: string | null;
  status: {
    fetchProductState: states;
    feedState: states;
    deleteProductState: states;
    createProduct: states;
  };
  products: product[];
  selectedProduct: product | null;
  total: number;
  skip: number;
  limit: number;
  currentRequestId: string | null;

  feedProducts: product[];
  feedTotal: number;
  feedHasMore: boolean;
  feedRequestId: string | null;
};
const initialState: ProductState = {
  erorr: null,
  status: {
    fetchProductState: "idle",
    feedState: "idle",
    deleteProductState: "idle",
    createProduct: "idle",
  },
  products: [],
  selectedProduct: null,
  total: 0,
  skip: 0,
  limit: 0,
  currentRequestId: null,

  feedProducts: [],
  feedTotal: 0,
  feedHasMore: true,
  feedRequestId: null,
};

const authSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.erorr = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProduct.pending, (state, action) => {
        state.erorr = null;
        state.status.fetchProductState = "loading";
        state.currentRequestId = action.meta.requestId;
      })

      .addCase(fetchProduct.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;

        state.status.fetchProductState = "success";
        state.products = action.payload.products;
        state.total = action.payload.total;
        state.limit = action.payload.limit;
        state.skip = action.payload.skip;
        state.currentRequestId = null;
      })

      .addCase(fetchProduct.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;

        state.status.fetchProductState = action.meta.aborted ? "idle" : "error";

        state.erorr = action.meta.aborted
          ? null
          : (action.payload?.message ??
            action.error.message ??
            COMMON_ERROR_MESSAGES.FETCH_PRODUCT_FAILED);
        state.currentRequestId = null;
      })

      .addCase(fetchProductFeed.pending, (state, action) => {
        state.erorr = null;
        state.status.feedState = "loading";
        state.feedRequestId = action.meta.requestId;
      })

      .addCase(fetchProductFeed.fulfilled, (state, action) => {
        if (state.feedRequestId !== action.meta.requestId) return;

        const existingIds = new Set(state.feedProducts.map((item) => item.id));
        state.feedProducts.push(
          ...action.payload.products.filter((item) => !existingIds.has(item.id)),
        );
        state.feedTotal = action.payload.total;
        state.feedHasMore =
          action.payload.products.length > 0 &&
          action.payload.skip + action.payload.products.length < action.payload.total;
        state.status.feedState = "success";
        state.feedRequestId = null;
      })

      .addCase(fetchProductFeed.rejected, (state, action) => {
        if (state.feedRequestId !== action.meta.requestId) return;

        state.status.feedState = action.meta.aborted ? "idle" : "error";
        state.erorr = action.meta.aborted
          ? null
          : (action.payload?.message ??
            action.error.message ??
            COMMON_ERROR_MESSAGES.FETCH_PRODUCT_FAILED);
        state.feedRequestId = null;
      })

      .addCase(deleteProduct.pending, (state) => {
        state.status.deleteProductState = "loading";
        state.erorr = null;
      })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.status.deleteProductState = "success";
        if (!action.payload.isDeleted) return;

        const deletedId = action.payload.id;
        const wasInProducts = state.products.some((product) => product.id === deletedId);
        const wasInFeed = state.feedProducts.some((product) => product.id === deletedId);

        state.products = state.products.filter((product) => product.id !== deletedId);
        state.feedProducts = state.feedProducts.filter((product) => product.id !== deletedId);
        if (wasInProducts) state.total = Math.max(0, state.total - 1);
        if (wasInFeed) state.feedTotal = Math.max(0, state.feedTotal - 1);
      })

      .addCase(deleteProduct.rejected, (state, action) => {
        state.status.deleteProductState = "error";
        state.erorr = action.meta.aborted
          ? null
          : (action.payload?.message ??
            action.error.message ??
            COMMON_ERROR_MESSAGES.DELETE_FAILED);
      })

      .addCase(createProduct.pending, (state) => {
        state.status.createProduct = "loading";
        state.erorr = null;
      })

      .addCase(createProduct.fulfilled, (state) => {
        state.status.createProduct = "success";
      })

      .addCase(createProduct.rejected, (state, action) => {
        state.status.createProduct = "error";
        state.erorr = action.meta.aborted
          ? null
          : (action.payload?.message ?? action.error.message ?? COMMON_ERROR_MESSAGES.ADD_FAILED);
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;

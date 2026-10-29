import type {
  fetchProductResponse,
  fetchProductRequest,
  deleteProductRequest,
  deleteProductResponse,
  addProductRequest,
  addProductResponse,
} from "../store/slices/product/productThunk";
import axiosClient from "./axiosClient";

export const fetchProductApi = async (
  body: fetchProductRequest,
  signal?: AbortSignal,
): Promise<fetchProductResponse> => {
  const params = new URLSearchParams({
    q: body.search ?? "",
    skip: String(body.skip),
    limit: String(body.limit),
    sortBy: body.sortBy ?? "id",
    order: body.order ?? "asc",
  });

  const response = await axiosClient.get<fetchProductResponse>(
    `/products/search?${params.toString()}`,
    { signal },
  );

  return response.data;
};

export const deleteProductApi = async (
  body: deleteProductRequest,
): Promise<deleteProductResponse> => {
  const response = await axiosClient.delete<deleteProductResponse>(`/products/${body.id}`);

  return response.data;
};

export const addProductApi = async (body: addProductRequest): Promise<addProductResponse> => {
  const response = await axiosClient.post<addProductResponse>(`/products`, { body });

  return response.data;
};

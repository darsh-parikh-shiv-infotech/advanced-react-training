import type { Key, ReactNode } from "react";
import type { product } from "../store/slices/product/productThunk";

export type SortOrder = "asc" | "desc";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => ReactNode;
  className?: string;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => Key;

  loading: boolean;
  error: string | null;
  total: number;

  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: SortOrder;

  pageSizeOptions?: number[];
  emptyMessage?: string;

  onSearchChange: (value: string) => void;
  onSortChange: (columnId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export const getProductColumns = (
  onDelete: (product: product) => void,
  onEdit: (product: product) => void,
): DataTableColumn<product>[] => {
  return [
    {
      id: "id",
      header: "Id",
      render: (product) => <span className="font-medium text-gray-900">{product.id}</span>,
    },
    {
      id: "title",
      header: "Title",
      render: (product) => <span className="font-medium text-gray-900">{product.title}</span>,
    },
    {
      id: "category",
      header: "Category",
      render: (product) => product.category,
    },
    {
      id: "stock",
      header: "Stock",
      render: (product) => product.stock,
    },
    {
      id: "price",
      header: "Price",
      render: (product) => product.price,
    },
    {
      id: "discountPrice",
      header: "Discount Price",
      sortable: false,
      render: (product) =>
        (product.price - (product.price * product.discountPercentage) / 100).toFixed(2),
    },
    {
      id: "image",
      header: "Image",
      sortable: false,
      render: (product) => {
        return (
          product.images &&
          product.images[0] && (
            <img className="w-15 h-15 shrink-0" alt="product-img" src={product.images[0]} />
          )
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      sortable: false,
      render: (product) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(product)}
            className="font-medium text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];
};

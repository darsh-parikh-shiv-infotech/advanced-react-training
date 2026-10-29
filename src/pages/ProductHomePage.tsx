import { startTransition, useCallback, useMemo, useOptimistic, useState } from "react";
import { useAppDispatch, useAppSelector } from "../utils/storeUtil";
import { getProductColumns, type SortOrder } from "../utils/dataTableUtil";
import {
  deleteProduct,
  fetchProduct,
  type fetchProductRequest,
  type product,
} from "../store/slices/product/productThunk";
import BaseProductDataTable from "../components/BaseProductDataTable";
import { useFetch } from "../hooks/useFetch";
import { Link } from "react-router-dom";

type TableState = {
  skip: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: SortOrder;
};
const ProductHomePage = () => {
  const { status, erorr, products, total } = useAppSelector((state) => state.product);
  const isLoading = status.fetchProductState == "loading";

  const dispatch = useAppDispatch();

  const [optimisticProducts, setOptimisticProducts] = useOptimistic(
    products,
    (curr, deletedId: number) => curr.filter((prod) => prod.id !== deletedId),
  );
  const [pendingDeletions, setPendingDeletions] = useState<number[]>([]);
  const [tableState, setTableState] = useState<TableState>({
    skip: 0,
    pageSize: 10,
    search: "",
    sortBy: "title",
    sortOrder: "asc",
  });
  const normalizedSearch = tableState.search.trim();
  const requestArgs = useMemo<fetchProductRequest>(
    () => ({
      skip: tableState.skip,
      limit: tableState.pageSize,
      search: normalizedSearch,
      sortBy: tableState.sortBy,
      order: tableState.sortOrder,
    }),
    [
      tableState.skip,
      tableState.pageSize,
      normalizedSearch,
      tableState.sortBy,
      tableState.sortOrder,
    ],
  );
  const fetchProducts = useCallback(
    (args: fetchProductRequest) => dispatch(fetchProduct(args)),
    [dispatch],
  );

  useFetch({
    args: requestArgs,
    fetcher: fetchProducts,
    debounceKey: normalizedSearch,
    debounceMs: 350,
  });

  const handleSearchChange = useCallback((search: string) => {
    setTableState((previous) => ({
      ...previous,
      search,
      skip: 0,
    }));
  }, []);

  const handleSortChange = useCallback((columnId: string) => {
    setTableState((previous) => {
      const sameColumn = previous.sortBy === columnId;

      return {
        ...previous,
        skip: 0,
        sortBy: columnId,
        sortOrder: sameColumn && previous.sortOrder === "asc" ? "desc" : "asc",
      };
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setTableState((previous) => ({
      ...previous,
      skip: Math.max(0, page - 1) * previous.pageSize,
    }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setTableState((previous) => ({
      ...previous,
      pageSize,
      skip: 0,
    }));
  }, []);

  const handleDelete = useCallback(
    (product: product) => {
      if (pendingDeletions.includes(product.id)) return;
      if (!window.confirm(`Delete ${product.title}?`)) return;

      setPendingDeletions((ids) => [...ids, product.id]);
      startTransition(async () => {
        setOptimisticProducts(product.id);
        try {
          await dispatch(deleteProduct({ id: product.id }));
        } finally {
          setPendingDeletions((ids) => ids.filter((id) => id !== product.id));
        }
      });
    },
    [dispatch, pendingDeletions, setOptimisticProducts],
  );
  const handleEdit = useCallback(() => {
    // Replace this with your edit route or modal.
  }, []);

  const columns = useMemo(
    () => getProductColumns(handleDelete, handleEdit),
    [handleDelete, handleEdit],
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="w-full flex gap-5 justify-end">
          <Link className="font-medium italic text-blue-900 underline hover:opacity-50" to={"/add"}>
            Add New Product
          </Link>
          <Link
            className="font-medium italic text-blue-900 underline hover:opacity-50"
            to={"/feed"}
          >
            Feed Page
          </Link>
        </div>
        <BaseProductDataTable
          loading={isLoading}
          columns={columns}
          products={optimisticProducts}
          error={erorr}
          tableState={tableState}
          total={total}
          handlePageChange={handlePageChange}
          handlePageSizeChange={handlePageSizeChange}
          handleSearchChange={handleSearchChange}
          handleSortChange={handleSortChange}
        />
      </div>
    </main>
  );
};

export default ProductHomePage;

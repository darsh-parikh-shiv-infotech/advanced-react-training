import { type product } from "../store/slices/product/productThunk";
import type { DataTableColumn, SortOrder } from "../utils/dataTableUtil";
import { DataTable } from "./common/DataTable";

interface BaseProductDataTableProp {
  products: product[];
  columns: DataTableColumn<product>[];
  loading: boolean;
  error: string | null;

  total: number;
  tableState: {
    skip: number;
    pageSize: number;
    search: string;
    sortBy: string;
    sortOrder: SortOrder;
  };

  handleSearchChange: (search: string) => void;
  handleSortChange: (columnId: string) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
}
const BaseProductDataTable = ({
  products,
  columns,
  loading,
  error,
  total,
  tableState,
  handlePageChange,
  handlePageSizeChange,
  handleSearchChange,
  handleSortChange,
}: BaseProductDataTableProp) => {
  return (
    <>
      <header>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Products Management</h1>

        <p className="mt-1 text-sm text-gray-500">Manage products add new, update and delete</p>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <DataTable<product>
          data={products}
          columns={columns}
          loading={loading}
          error={error}
          total={total}
          getRowId={(product) => product.id}
          page={Math.floor(tableState.skip / tableState.pageSize) + 1}
          pageSize={tableState.pageSize}
          search={tableState.search}
          sortBy={tableState.sortBy}
          sortOrder={tableState.sortOrder}
          pageSizeOptions={[10, 20, 50]}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          emptyMessage="No users found."
        />
      </div>
    </>
  );
};

export default BaseProductDataTable;

import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../utils/storeUtil";
import { fetchProductFeed } from "../store/slices/product/productThunk";
import { Loader } from "lucide-react";
import { BaseProductCard } from "../components/BaseProductCard";
import { Link } from "react-router-dom";

const ProductFeedPage = () => {
  const {
    feedProducts,
    status,
    erorr: feedError,
    feedHasMore,
  } = useAppSelector((state) => state.product);
  const isLoading = status.feedState === "loading";

  const dispatch = useAppDispatch();
  const observerTarget = useRef<HTMLDivElement>(null);
  const activeRequest = useRef<{ abort: () => void } | null>(null);
  const loadMore = useCallback(() => {
    if (isLoading || !feedHasMore || activeRequest.current) return;

    const request = dispatch(
      fetchProductFeed({
        skip: feedProducts.length,
        limit: 10,
      }),
    );
    activeRequest.current = request;
    void request.then(() => {
      if (activeRequest.current === request) {
        activeRequest.current = null;
      }
    });
  }, [dispatch, feedHasMore, feedProducts.length, isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "300px" },
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [loadMore]);

  useEffect(
    () => () => {
      activeRequest.current?.abort();
    },
    [],
  );

  return (
    <main className="min-h-screen mx-auto max-w-7xl bg-gray-50 px-4 py-8 sm:px-8">
      <div className="space-y-6">
        <div className="w-full flex justify-end">
          <Link className="font-medium italic text-blue-900 underline hover:opacity-50" to={"/"}>
            Table View
          </Link>
        </div>
        <div className="products-list">
          {feedProducts.map((product) => (
            <BaseProductCard product={product} key={product.id} />
          ))}
        </div>
        <div ref={observerTarget}></div>
        {isLoading && (
          <div className="flex justify-center align-center w-full">
            <Loader />
          </div>
        )}
        {feedError && (
          <div role="alert" className="text-center">
            <p>Error: {feedError}</p>
            <button type="button" onClick={loadMore}>
              Retry
            </button>
          </div>
        )}
        {!feedHasMore && feedProducts.length > 0 && (
          <p className="text-center text-gray-500">You’re all caught up.</p>
        )}
      </div>
    </main>
  );
};

export default ProductFeedPage;

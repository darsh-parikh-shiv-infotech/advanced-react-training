import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import ProductHomePage from "./pages/ProductHomePage";
import ProductFeedPage from "./pages/ProductFeedPage";
import ProductFormPage from "./pages/ProductFormPage";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route index element={<ProductHomePage />} />
        <Route path="/feed" element={<ProductFeedPage />} />
        <Route path="/add" element={<ProductFormPage />} />
      </Route>,
    ),
  );
  return <RouterProvider router={router} />;
}

export default App;

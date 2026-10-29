import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  createProduct,
  type addProductRequest,
  type product,
} from "../store/slices/product/productThunk";
import {
  initialProductFormState,
  initialProductFormValues,
  type ProductFormState,
  type ProductFormValues,
} from "../utils/productFormUtil";
import { useAppDispatch } from "../utils/storeUtil";

type Props = {
  product?: product;
  onCancel?: () => void;
  onSuccess?: (productId: number) => void;
};

function validateStep(
  step: number,
  values: ProductFormValues,
): Partial<Record<keyof ProductFormValues, string>> {
  const errors: Partial<Record<keyof ProductFormValues, string>> = {};

  if (step === 1) {
    if (!values.title.trim()) {
      errors.title = "Title is required.";
    }
    if (!values.description.trim()) {
      errors.description = "Description is required.";
    }
    if (!values.brand.trim()) {
      errors.brand = "Brand is required.";
    }
    if (!values.category.trim()) {
      errors.category = "Category is required.";
    }
  }

  if (step === 2) {
    const price = Number(values.price);
    const discount = Number(values.discountPercentage);
    const stock = Number(values.stock);

    if (values.price.trim() === "" || !Number.isFinite(price) || price <= 0) {
      errors.price = "Enter a price greater than zero.";
    }

    if (
      values.discountPercentage.trim() === "" ||
      !Number.isFinite(discount) ||
      discount < 0 ||
      discount > 100
    ) {
      errors.discountPercentage = "Discount must be between 0 and 100.";
    }

    if (values.stock.trim() === "" || !Number.isInteger(stock) || stock < 0) {
      errors.stock = "Enter a valid stock quantity.";
    }
  }

  return errors;
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {pending ? "Saving..." : editing ? "Save changes" : "Create product"}
    </button>
  );
}

export default function ProductFormPage({ product, onCancel, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [values, setValues] = useState<ProductFormValues>(() =>
    product
      ? {
          title: product.title,
          description: product.description,
          brand: product.brand,
          category: product.category,
          price: String(product.price),
          discountPercentage: String(product.discountPercentage),
          stock: String(product.stock),
        }
      : initialProductFormValues,
  );

  const [stepErrors, setStepErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>(
    {},
  );
  const [editedFields, setEditedFields] = useState<(keyof ProductFormValues)[]>([]);

  const action = async (
    _previousState: ProductFormState,
    formData: FormData,
  ): Promise<ProductFormState> => {
    const formValues: ProductFormValues = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      brand: String(formData.get("brand") ?? ""),
      category: String(formData.get("category") ?? ""),
      price: String(formData.get("price") ?? ""),
      discountPercentage: String(formData.get("discountPercentage") ?? ""),
      stock: String(formData.get("stock") ?? ""),
    };

    const fieldErrors = {
      ...validateStep(1, formValues),
      ...validateStep(2, formValues),
    };
    if (Object.keys(fieldErrors).length > 0) {
      setStepErrors(fieldErrors);
      if (Object.keys(validateStep(1, formValues)).length > 0) {
        setStep(1);
      }

      return {
        success: false,
        message: "Please correct the highlighted fields.",
        fieldErrors,
      };
    }

    if (product) {
      return {
        success: false,
        message: "Editing products is not supported yet.",
      };
    }

    const productData: addProductRequest = {
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      brand: formValues.brand.trim(),
      category: formValues.category.trim(),
      price: Number(formValues.price),
      discountPercentage: Number(formValues.discountPercentage),
      stock: Number(formValues.stock),
    };

    try {
      const createdProduct = await dispatch(createProduct(productData)).unwrap();
      onSuccess?.(createdProduct.id);
      if (!onSuccess) navigate("/");

      return {
        success: true,
        message: "Product created successfully.",
        productId: createdProduct.id,
      };
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Unable to create product. Please try again.";

      return {
        success: false,
        message,
      };
    }
  };

  const [state, formAction] = useActionState(action, initialProductFormState);

  function updateField(field: keyof ProductFormValues, value: string) {
    setEditedFields((previous) => (previous.includes(field) ? previous : [...previous, field]));
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    setStepErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  }

  function nextStep() {
    const errors = validateStep(step, values);
    setStepErrors(errors);

    if (Object.keys(errors).length === 0) {
      setStep(2);
    }
  }

  function previousStep() {
    setStep(1);
  }

  function renderError(field: keyof ProductFormValues) {
    const message =
      stepErrors[field] ?? (editedFields.includes(field) ? undefined : state.fieldErrors?.[field]);

    return message ? <p className="mt-1 text-sm text-red-600">{message}</p> : null;
  }

  return (
    <main className="min-h-screen mx-auto max-w-7xl bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="w-full flex gap-5 justify-end">
          <Link className="font-medium italic text-blue-900 underline hover:opacity-50" to={"/"}>
            Back To Home
          </Link>
        </div>
        <form action={formAction} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">{product ? "Edit product" : "Add product"}</h2>

            <p className="mt-1 text-sm text-gray-500">Step {step} of 2</p>

            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={2}
              aria-valuenow={step}
              aria-label="Form progress"
            >
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${step * 50}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <section className="space-y-4">
              <h3 className="font-medium">Product details</h3>

              <div>
                <label htmlFor="title" className="block text-sm">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  value={values.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="mt-1 w-full rounded-lg border p-2"
                />
                {renderError("title")}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={values.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  className="mt-1 w-full rounded-lg border p-2"
                  rows={3}
                />
                {renderError("description")}
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm">
                  Brand
                </label>
                <input
                  id="brand"
                  name="brand"
                  value={values.brand}
                  onChange={(event) => updateField("brand", event.target.value)}
                  className="mt-1 w-full rounded-lg border p-2"
                />
                {renderError("brand")}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm">
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  value={values.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  className="mt-1 w-full rounded-lg border p-2"
                />
                {renderError("category")}
              </div>
            </section>
          )}

          {step === 2 && (
            <>
              {/* Step 1 inputs are unmounted, so include their
              current values in the final FormData. */}
              <input type="hidden" name="title" value={values.title} />
              <input type="hidden" name="description" value={values.description} />
              <input type="hidden" name="brand" value={values.brand} />
              <input type="hidden" name="category" value={values.category} />

              <section className="space-y-4">
                <h3 className="font-medium">Pricing and inventory</h3>

                <div>
                  <label htmlFor="price" className="block text-sm">
                    Price
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={values.price}
                    onChange={(event) => updateField("price", event.target.value)}
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                  {renderError("price")}
                </div>

                <div>
                  <label htmlFor="discountPercentage" className="block text-sm">
                    Discount percentage
                  </label>
                  <input
                    id="discountPercentage"
                    name="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={values.discountPercentage}
                    onChange={(event) => updateField("discountPercentage", event.target.value)}
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                  {renderError("discountPercentage")}
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm">
                    Stock
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={values.stock}
                    onChange={(event) => updateField("stock", event.target.value)}
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                  {renderError("stock")}
                </div>
              </section>
            </>
          )}

          {state.message && (
            <p
              role={state.success ? "status" : "alert"}
              className={state.success ? "text-green-700" : "text-red-600"}
            >
              {state.message}
            </p>
          )}

          <div className="flex flex-wrap justify-between gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onCancel ?? (() => navigate("/"))}
              className="rounded-lg border px-4 py-2"
            >
              Cancel
            </button>

            <div className="flex gap-2">
              {step === 2 && (
                <button
                  type="button"
                  onClick={previousStep}
                  className="rounded-lg border px-4 py-2"
                >
                  Back
                </button>
              )}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                >
                  Next
                </button>
              ) : (
                <SubmitButton editing={Boolean(product)} />
              )}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

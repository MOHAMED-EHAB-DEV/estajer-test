async function fetchApi(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Api-Agent": "android",
    "Accept-Language": "ar",
  };

  headers["Authorization"] = `Bearer ${process.env.Vom_Token}`;

  const options = { method, headers };

  if (body) options.body = JSON.stringify(body);

  const response = await fetch(
    `${process.env.VOM_API_BASE_URL}${endpoint}`,
    options,
  );

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/pdf")) {
    const pdfBuffer = await response.arrayBuffer();
    return pdfBuffer;
  }
  const data = await response.json();
  if (!response.ok) {
    console.error("API Error:", data);
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export const createVomCategory = ({ name_ar, name_en }) =>
  fetchApi("/products/categories", "POST", { name_ar, name_en });

export const getUnits = () => fetchApi("/products/units", "Get");
export const getCategories = () => fetchApi("/products/categories", "Get");
export const getProducts = () => fetchApi("/products/products", "Get");
export const getAccounts = () => fetchApi("/accounting/accounts", "Get");
export const getUsers = () => fetchApi("/sales/customers", "Get");
export const getFeeServices = () => fetchApi("/settings/fee-services", "Get");
export const getInvoice = ({ invoiceId }) =>
  fetchApi(`/sales/invoices/${invoiceId}/print`, "Get");

export const createVomProduct = async ({
  name_en,
  name_ar,
  category_id,
  selling_price,
  selling_account_id,
}) => {
  const body = {
    name_en,
    name_ar,
    category_id: category_id.toString(),
    selling_price: selling_price.toString(),
    unit_id: "4",
    type: "service",
    is_selling: true,
    selling_account_id,
    tax_id: 2,
  };
  const data = await fetchApi("/products/products", "POST", body);
  return data.data.product.id;
};

export const createVomCustomer = async ({
  name,
  email,
  mobile,
  taxCode,
  address,
}) => {
  const body = {
    name,
    email,
    mobile,
    tax_number: taxCode,
    country_code: "SA",
    opening_balance: 0,
    account_receivable_id: 5,
    city: "",
    street: "",
    postal_code: "",
    country: address,
  };
  const data = await fetchApi("/sales/customers", "POST", body);
  return data.data.customer.id;
};

export const createVomInvoice = async ({
  invoiceType,
  customer,
  products,
  orderId,
}) => {
  const body = {
    action: "save",
    type: invoiceType,
    customer: Number(customer),
    payment_date: new Date()
      .toISOString()
      .split("T")[0]
      .split("-")
      .reverse()
      .join("-"),
    time: new Date().toTimeString().substring(0, 5),
    payment_term: 1,
    payment_account: 2,
    terms: "",
    description: `رقم الطلب: ${orderId}`,
    products: products.map((p) => {
      return {
        product_id: Number(p.product_id),
        quantity: 1,
        unit_price: p.unit_price,
        discount: 0,
        tax_id: 2,
        vat: p.unit_price * 0.15,
        total: p.unit_price,
        description: `رقم الطلب: ${orderId}`,
      };
    }),
  };
  const data = await fetchApi("/sales/invoices", "POST", body);
  return data;
};

export const getVomInvoiceUrl = (invoiceId) => {
  if (!invoiceId) return null;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";
  return `${baseUrl}/api/invoice/${invoiceId}`;
};

export const getVomInvoice = async (invoiceId) => {
  if (!invoiceId) return null;
  try {
    const data = await fetchApi(`/sales/invoices/${invoiceId}`, "GET");
    return data;
  } catch (error) {
    console.error("Error fetching VOM invoice:", error);
    return null;
  }
};

export const createVomPurchaseBill = async ({
  supplier,
  description = null,
  paymentTerm = 1,
  paymentAccount = 2,
  notes = null,
  terms = null,
  paymentDate,
  products,
  costCenterId = null,
}) => {
  // Validate required parameters
  if (!supplier) {
    throw new Error("Supplier ID is required for Purchase Bill creation");
  }

  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new Error("Products array is required and cannot be empty");
  }

  if (!paymentDate) {
    throw new Error("Payment date is required");
  }

  // Validate and format payment date
  const date = new Date(paymentDate);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid payment date provided");
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  // Validate and format products
  const validatedProducts = products.map((product, index) => {
    if (!product.product_id) {
      throw new Error(`Product ID is required for product at index ${index}`);
    }

    const unitPrice = Number(product.unit_price);
    const quantity = Number(product.quantity || 1);
    const discount = Number(product.discount || 0);

    if (isNaN(unitPrice) || unitPrice < 0) {
      throw new Error(`Invalid unit price for product at index ${index}`);
    }

    if (isNaN(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity for product at index ${index}`);
    }

    const total = product.total
      ? Number(product.total)
      : unitPrice * quantity - discount;
    const vat = Number(product.vat || 0);

    return {
      product_id: Number(product.product_id),
      quantity: quantity,
      unit_price: unitPrice,
      discount: discount,
      total: total,
      tax_id: product.tax_id ? Number(product.tax_id) : 2, // Default to tax_id 2
      vat: vat,
      description: product.description || null,
    };
  });

  const body = {
    supplier: Number(supplier),
    description,
    payment_term: Number(paymentTerm),
    payment_account: Number(paymentAccount),
    notes,
    terms,
    payment_date: formattedDate,
    products: validatedProducts,
  };

  if (costCenterId) body.cost_center_id = Number(costCenterId);

  console.log("Purchase Bill request body:", JSON.stringify(body, null, 2));

  try {
    const res = await fetchApi("/purchases/purchase-bills", "POST", body);
    console.log("Purchase Bill created successfully:", res);
    return res;
  } catch (error) {
    console.error("Error creating VOM purchase bill:", error);
    console.error("Request body that failed:", JSON.stringify(body, null, 2));
    throw error;
  }
};

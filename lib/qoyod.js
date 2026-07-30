import User from "@/models/User";

async function fetchQoyodApi(endpoint, method = "GET", body = null) {
  const apiKey = process.env.QOYOD_API_KEY;
  if (!apiKey) {
    throw new Error("QOYOD_API_KEY environment variable is not set");
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "API-KEY": apiKey,
  };

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const baseUrl = "https://api.qoyod.com/2.0";
  const response = await fetch(`${baseUrl}${endpoint}`, options);

  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    console.error("Qoyod API Error:", responseData);
    let errorMessage = "Qoyod API returned an error";
    if (typeof responseData === "object") {
      if (responseData.errors) {
        if (Array.isArray(responseData.errors)) {
          errorMessage = responseData.errors.join(", ");
        } else if (typeof responseData.errors === "object") {
          errorMessage = Object.entries(responseData.errors)
            .map(([key, msgs]) => `${key}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
            .join("; ");
        } else {
          errorMessage = JSON.stringify(responseData.errors);
        }
      } else {
        errorMessage = responseData.message || JSON.stringify(responseData);
      }
    } else {
      errorMessage = responseData;
    }
    throw new Error(errorMessage);
  }

  return responseData;
}

export async function getOrCreateQoyodCustomer(owner) {
  if (!owner) throw new Error("Owner data is required for Qoyod customer");

  const billing = owner?.companyDetails?.billingAddress;
  const streetStr = billing?.street || "";
  const districtStr = billing?.district || "";
  const buildingNumStr = billing?.buildingNumber || "";

  const billingAddressLine =
    streetStr || districtStr || buildingNumStr
      ? `${buildingNumStr} ${streetStr}, ${districtStr}`.trim()
      : owner.address || "";

  const qoyodBillingAddress = {
    billing_address: billingAddressLine,
    billing_city: billing?.city || "",
    billing_state: billing?.district || "",
    billing_zip: billing?.postalCode || "",
    billing_country: "Saudi Arabia",
    building_number: buildingNumStr,
  };

  let taxNumber = owner?.companyDetails?.taxCode || "";
  const cleanTax = taxNumber.replace(/\D/g, "");
  if (cleanTax.length !== 15) {
    if (taxNumber) {
      console.warn(`[QOYOD] Invalid tax number length (${taxNumber.length} chars: "${taxNumber}"). Excluding from Qoyod payload.`);
    }
    taxNumber = "";
  } else {
    taxNumber = cleanTax;
  }

  // Check if owner already has qoyodId in MongoDB
  if (owner.qoyodId) {
    if (billing?.street && billing?.city) {
      try {
        await fetchQoyodApi(`/customers/${owner.qoyodId}`, "PUT", {
          contact: {
            tax_number: taxNumber,
            billing_address: qoyodBillingAddress,
          },
        });
      } catch (err) {
        console.error("Failed to update Qoyod customer address:", err);
      }
    }
    return owner.qoyodId;
  }

  // 1. Search for customer in Qoyod by email
  if (owner.email) {
    try {
      const searchUrl = `/customers?q[email_eq]=${encodeURIComponent(owner.email)}`;
      const data = await fetchQoyodApi(searchUrl, "GET");
      if (data.customers && data.customers.length > 0) {
        const qoyodId = data.customers[0].id.toString();
        await User.findByIdAndUpdate(owner._id, { qoyodId });
        if (billing?.street && billing?.city) {
          try {
            await fetchQoyodApi(`/customers/${qoyodId}`, "PUT", {
              contact: {
                tax_number: taxNumber,
                billing_address: qoyodBillingAddress,
              },
            });
          } catch (err) {
            console.error("Failed to update Qoyod customer address:", err);
          }
        }
        return qoyodId;
      }
    } catch (err) {
      if (err.message && err.message.includes("we found nothing")) {
        console.log(`Customer with email ${owner.email} not found in Qoyod.`);
      } else {
        console.error("Error searching Qoyod customer by email:", err);
      }
    }
  }

  // 2. Search for customer in Qoyod by phone
  if (owner.phone) {
    try {
      const searchUrl = `/customers?q[phone_number_eq]=${encodeURIComponent(owner.phone)}`;
      const data = await fetchQoyodApi(searchUrl, "GET");
      if (data.customers && data.customers.length > 0) {
        const qoyodId = data.customers[0].id.toString();
        await User.findByIdAndUpdate(owner._id, { qoyodId });
        if (billing?.street && billing?.city) {
          try {
            await fetchQoyodApi(`/customers/${qoyodId}`, "PUT", {
              contact: {
                tax_number: taxNumber,
                billing_address: qoyodBillingAddress,
              },
            });
          } catch (err) {
            console.error("Failed to update Qoyod customer address:", err);
          }
        }
        return qoyodId;
      }
    } catch (err) {
      if (err.message && err.message.includes("we found nothing")) {
        console.log(`Customer with phone ${owner.phone} not found in Qoyod.`);
      } else {
        console.error("Error searching Qoyod customer by phone:", err);
      }
    }
  }

  // 3. Create new customer in Qoyod
  const customerName = owner?.companyDetails?.companyName || owner.fullName;

  const body = {
    contact: {
      name: customerName,
      email: owner.email || "",
      phone_number: owner.phone || "",
      tax_number: taxNumber,
      status: "Active",
      billing_address: qoyodBillingAddress,
    },
  };

  console.log("Creating new Qoyod customer:", JSON.stringify(body, null, 2));
  const data = await fetchQoyodApi("/customers", "POST", body);
  const qoyodId = data.contact.id.toString();

  // Save to MongoDB
  await User.findByIdAndUpdate(owner._id, { qoyodId });
  return qoyodId;
}

export async function createQoyodInvoice({
  contactId,
  issueDate,
  reference,
  description,
  unitPrice,
}) {
  const body = {
    invoice: {
      contact_id: Number(contactId),
      inventory_id: 1, // Main branch
      issue_date: issueDate,
      due_date: issueDate,
      status: "Approved",
      reference: reference,
      description: description,
      payment_method: 42,
      line_items: [
        {
          product_id: 258, // عمولات استأجر
          description: "عمولات استأجر",
          quantity: 1,
          unit_price: unitPrice.toString(),
        },
      ],
    },
  };

  console.log("Creating Qoyod invoice:", JSON.stringify(body, null, 2));
  const data = await fetchQoyodApi("/invoices", "POST", body);
  return data.invoice.id;
}

export async function getQoyodInvoice(invoiceId) {
  const data = await fetchQoyodApi(`/invoices/${invoiceId}`, "GET");
  return data.invoice;
}

export async function createQoyodInvoicePayment({
  invoiceId,
  accountId = 8,
  amount,
  date,
  reference,
  description,
}) {
  const body = {
    invoice_payment: {
      invoice_id: Number(invoiceId),
      account_id: Number(accountId),
      date: date,
      amount: amount.toString(),
      reference: reference,
      description: description,
      payment_method: 42,
    },
  };

  console.log("Creating Qoyod invoice payment:", JSON.stringify(body, null, 2));
  const data = await fetchQoyodApi("/invoice_payments", "POST", body);
  return data.id;
}


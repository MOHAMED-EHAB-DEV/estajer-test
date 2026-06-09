/**
 * Check a freelance certificate via the internal API route.
 * @param {Object} params
 * @param {string} params.nationalId - 10-digit national ID starting with 1
 * @param {string} params.certificateNumber - Certificate number in FL-XXXXXXXXX format
 * @returns {Promise<{status: string, expiryDate: string}>}
 */
export async function checkFreelanceCertificate({
  nationalId,
  certificateNumber,
}) {
  const res = await fetch("/api/freelance/check-certificate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nationalId, certificateNumber }),
  });

  if (!res.ok) {
    const data = await res.json();
    const error = new Error(data.error || "Failed to verify certificate");
    error.errorCode = data.errorCode;
    error.details = data.details;
    throw error;
  }

  return res.json(); // { status: "ACTIVE", expiryDate: "2026-05-01" }
}

/**
 * Server-side check for freelance certificate (used in API routes).
 * Calls the external Freelance Portal API directly.
 * @param {Object} params
 * @param {string} params.nationalId
 * @param {string} params.certificateNumber
 * @returns {Promise<{status: string, expiryDate: string}>}
 */
export async function checkFreelanceCertificateServer({
  nationalId,
  certificateNumber,
}) {
  const response = await fetch(
    "https://integration.freelance.sa/api/v3/certificate/details-by-national-id-and-certificate-number",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "client-id": process.env.FREELANCE_CLIENT_ID,
        "app-key": process.env.FREELANCE_APP_KEY,
      },
      body: JSON.stringify({ nationalId, certificateNumber }),
    },
  );
  if (!response.ok) {
    console.log(response);
    throw new Error("Certificate verification failed");
  }
  const data = await response.json();

  if (!data.success) {
    const errorMessages = {
      P001: "Invalid API credentials",
      L001: "Invalid certificate or license number",
      L020: "Certificate not linked to partner account",
    };

    const errorCode = data.result?.errorCode || data.errorCode;
    const error = new Error(
      errorMessages[errorCode] || "Certificate verification failed",
    );
    error.errorCode = errorCode;
    throw error;
  }

  return data.result; // { status, expiryDate }
}

/**
 * Validate nationalId format on client side
 * Must be exactly 10 digits and start with 1
 */
export function validateNationalId(nationalId) {
  return /^1\d{9}$/.test(nationalId);
}

/**
 * Validate certificateNumber format on client side
 * Must be FL- followed by 9 digits (12 chars total)
 */
export function validateCertificateNumber(certificateNumber) {
  return /^FL-\d{9}$/.test(certificateNumber);
}

/**
 * Certificate status constants
 */
export const CERTIFICATE_STATUS = {
  ACTIVE: "ACTIVE", // Valid & working
  EXPIRED: "EXPIRED", // Past expiry date
  REVOKED: "REVOKED", // Revoked by admin
  REJECTED: "REJECTED", // Didn't meet standards
  CANCELED: "CANCELED", // Canceled by user
  PENDING: "PENDING", // Awaiting admin review
};

/**
 * Check if a certificate status is valid for registration
 */
export function isCertificateActive(status) {
  return status === CERTIFICATE_STATUS.ACTIVE;
}

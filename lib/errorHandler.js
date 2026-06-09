import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ErrorLog from "@/models/ErrorLog";

const IGNORED_MESSAGES = [
  "email verification required",
  "authentication required",
  "user is banned",
];

/**
 * Check if the error should be ignored for logging
 * @param {Error} error - The error object
 * @returns {boolean} - True if the error should be ignored
 */
function isIgnoredError(error) {
  const message = error.message?.toLowerCase() || "";
  return IGNORED_MESSAGES.some((msg) => message.includes(msg));
}

/**
 * Log an error to the database
 * @param {Error} error - The error object
 * @param {Object} context - Additional context about the error
 * @param {string} context.endpoint - The API endpoint path
 * @param {string} context.method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {Object} [context.user] - The authenticated user (if any)
 * @param {Object} [context.requestBody] - The request body (be careful with sensitive data)
 * @param {Object} [context.requestParams] - Query parameters or URL params
 * @param {string} [context.id] - The resource ID (e.g. product ID)
 * @param {Request} [context.req] - The original request object
 */
export async function logError(error, context) {
  // Skip logging strictly expected user errors/exceptions
  if (isIgnoredError(error)) return;

  try {
    await connectDB();

    const errorLog = {
      message: error.message || "Unknown error",
      stack: error.stack,
      endpoint: context.endpoint,
      method: context.method,
      statusCode: context.statusCode || 500,
      userId: context.user?._id,
      requestBody: sanitizeRequestBody(context.requestBody),
      requestParams: context.requestParams,
      userAgent: context.req?.headers?.get?.("user-agent"),
      ip:
        context.req?.headers?.get?.("x-forwarded-for") ||
        context.req?.headers?.get?.("x-real-ip"),
      resourceId: context.id,
      userToken:
        context.req?.cookies?.get?.("token")?.value ||
        context.req?.headers?.get?.("authorization"),
    };
    await ErrorLog.create(errorLog);
  } catch (logError) {
    // Don't throw if logging fails - just console log
    console.error("Failed to log error to database:", logError);
  }
}

/**
 * Sanitize request body to remove sensitive information
 * @param {Object} body - The request body
 * @returns {Object} - Sanitized body
 */
function sanitizeRequestBody(body) {
  if (!body) return null;

  const sensitiveFields = [
    "password",
    "confirmPassword",
    "token",
    "secret",
    "apiKey",
    "creditCard",
    "cardNumber",
    "cvv",
    "iban",
  ];

  const sanitized = { ...body };

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) sanitized[field] = "[REDACTED]";
  });

  // Handle nested objects (one level deep)
  Object.keys(sanitized).forEach((key) => {
    if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sensitiveFields.forEach((field) => {
        if (sanitized[key][field]) sanitized[key][field] = "[REDACTED]";
      });
    }
  });
  return sanitized;
}

/**
 * Get appropriate HTTP status code based on error
 * @param {Error} error - The error object
 * @returns {number} - HTTP status code
 */
function getStatusCode(error) {
  // If it's an ApiError with a statusCode, use that
  if (error.statusCode && typeof error.statusCode === "number") {
    return error.statusCode;
  }

  const message = error.message?.toLowerCase() || "";

  if (message.includes("authentication") || message.includes("unauthorized")) {
    return 401;
  }
  if (
    message.includes("forbidden") ||
    message.includes("permission") ||
    message.includes("banned")
  ) {
    return 403;
  }
  if (message.includes("not found")) {
    return 404;
  }
  if (message.includes("validation") || message.includes("invalid")) {
    return 400;
  }
  if (message.includes("conflict") || message.includes("duplicate")) {
    return 409;
  }

  return 500;
}

/**
 * Handle API errors - logs to database and returns appropriate response
 * @param {Error} error - The error object
 * @param {Object} context - Context about the request
 * @param {string} context.endpoint - The API endpoint path
 * @param {string} context.method - HTTP method
 * @param {Object} [context.user] - Authenticated user
 * @param {Object} [context.requestBody] - Request body
 * @param {Object} [context.requestParams] - Query/URL params
 * @param {Request} [context.req] - Original request
 * @param {boolean} [context.skipLogging] - Skip logging to DB (for expected errors)
 * @returns {NextResponse} - JSON error response
 */
export async function handleApiError(error, context) {
  try {
    const statusCode = getStatusCode(error);
    const isIgnored = isIgnoredError(error);

    // Log the error to console unless ignored
    if (!isIgnored)
      console.error(`[${context.method}] ${context.endpoint}:`, error);

    // Log to database unless explicitly skipped or ignored
    if (
      !context.skipLogging &&
      !isIgnored &&
      process.env.NODE_ENV !== "development"
    ) {
      await logError(error, { ...context, statusCode });
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      { status: statusCode },
    );
  } catch (error) {
    console.error("Failed to handle API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

export default handleApiError;

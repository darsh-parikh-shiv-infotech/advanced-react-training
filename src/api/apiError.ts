import { API_ERROR_MESSAGES } from "../utils/constants/index";
import { StatusCodes } from "http-status-codes";

export interface ApiErrorPayload {
  message: string;
  status?: number;
  code?: string;
}

type ApiResponseObject = Record<string, unknown>;

const isApiResponseObject = (value: unknown): value is ApiResponseObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getResponseObjects = (value: unknown): ApiResponseObject[] => {
  if (!isApiResponseObject(value)) return [];

  return [value, ...getResponseObjects(value.data), ...getResponseObjects(value.payload)];
};

const getStatusCode = (value: unknown): number | undefined => {
  const statusCode =
    typeof value === "number" || typeof value === "string" ? Number(value) : undefined;

  return statusCode !== undefined && Number.isInteger(statusCode) ? statusCode : undefined;
};

const getMessage = (value: unknown): string | undefined => {
  const objects = getResponseObjects(value);

  for (const responseObject of objects) {
    for (const key of ["message", "error"]) {
      const message = responseObject[key];
      if (typeof message === "string" && message.trim()) {
        return message.trim();
      }
    }
  }

  return undefined;
};

export const getApiResponseMessage = getMessage;

export const getApplicationApiError = (value: unknown): ApiError | undefined => {
  const failedResponse = getResponseObjects(value).find((responseObject) => {
    const statusCode = getStatusCode(responseObject.statusCode);
    return (
      statusCode !== undefined &&
      (statusCode < StatusCodes.OK || statusCode >= StatusCodes.MULTIPLE_CHOICES)
    );
  });

  if (!failedResponse) return undefined;

  return new ApiError(
    getMessage(failedResponse) ?? getMessage(value) ?? API_ERROR_MESSAGES.REQUEST_FAILED,
    getStatusCode(failedResponse.statusCode),
  );
};

export const toApiErrorPayload = (error: unknown, fallbackMessage: string): ApiErrorPayload => {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
    };
  }

  return {
    message: fallbackMessage,
  };
};

export class ApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

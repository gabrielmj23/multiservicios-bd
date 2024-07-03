import sql from "mssql";
import { ZodError } from "zod";

export function handleError(error: unknown) {
  console.error(error);
  if (
    error instanceof sql.ConnectionError ||
    error instanceof sql.RequestError
  ) {
    return {
      type: "error" as const,
      code: error.code,
      message: error.message,
    };
  }
  if (error instanceof ZodError) {
    return {
      type: "error" as const,
      code: error.name,
      message: error.message,
    };
  }
  return {
    type: "error" as const,
    message: "Ocurrió un error",
  };
}

import { handleError } from "./common.server";
import sql from "mssql";
import { sqlConfig } from "./connectDb.server";

export async function setRol(rol: string) {
  try {
    await sql.connect(sqlConfig);
    await sql.query`EXECUTE AS USER = ${rol}`;
    return { type: "success" as const, message: "Rol cambiado" };
  } catch (error) {
    return handleError(error);
  }
}

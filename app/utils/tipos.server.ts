import { sqlConfig } from "./connectDb.server";
import sql from "mssql";
import { tipoVehiculoSchema } from "./schemas";
import { handleError } from "./common.server";

export async function getTipos() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
            SELECT TOP 50 *
            FROM TiposVehiculos
        `;
    const tipos = await Promise.all(
      result.recordset.map(
        async (tipo) => await tipoVehiculoSchema.parseAsync(tipo)
      )
    );
    return { type: "success" as const, data: tipos };
  } catch (error) {
    return handleError(error);
  }
}

export async function addTipo(formData: FormData) {
  try {
    await sql.connect(sqlConfig);
    const nombreTipo = String(formData.get("NombreTipo"));
    await sql.query`
                INSERT INTO TiposVehiculos (NombreTipo)
                VALUES (${nombreTipo})
            `;
    return { type: "success" as const, message: "Creado con éxito" };
  } catch (error) {
    return handleError(error);
  }
}

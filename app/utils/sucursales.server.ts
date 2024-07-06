import { handleError } from "./common.server";
import sql from "mssql";
import { sqlConfig } from "./connectDb.server";
import { z } from "zod";

export async function getSucursalesInicio() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT RIFSuc, NombreSuc FROM Sucursales`;
    const sucursales = await Promise.all(
      result.recordset.map((result) =>
        z
          .object({
            RIFSuc: z.string().min(1).max(12),
            NombreSuc: z.string().min(1).max(20),
          })
          .parseAsync(result)
      )
    );
    return { type: "success" as const, data: sucursales };
  } catch (error) {
    return handleError(error);
  }
}

export async function addSucursal(formData: FormData) {
  try {
    const sucursal = {
      RIFSuc: String(formData.get("RIFSuc")),
      NombreSuc: String(formData.get("NombreSuc")),
      CiudadSuc: String(formData.get("CiudadSuc")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
        INSERT INTO Sucursales (RIFSuc, NombreSuc, CiudadSuc)
        VALUES (${sucursal.RIFSuc}, ${sucursal.NombreSuc}, ${sucursal.CiudadSuc})
        `;
    return { type: "success" as const, message: "Sucursal creada con éxito" };
  } catch (error) {
    return handleError(error);
  }
}

export async function editarSucursal(formData: FormData) {
  try {
    const RIFSuc = String(formData.get("RIFSuc"));
    const CIEncargado = String(formData.get("CIEncargado"));

    await sql.connect(sqlConfig);
    const result = await sql.query`
      UPDATE Sucursales
      SET CIEncargado = ${CIEncargado}, FechadeIngreso = GETDATE()
      WHERE RIFSuc = ${RIFSuc}
    `;

    if (result.rowsAffected[0] > 0) {
      return { type: "success", message: "Sucursal actualizada correctamente." };
    } else {
      return { type: "error", message: "No se encontró la sucursal para actualizar." };
    }
  } catch (error) {
    return handleError(error);
  }
}
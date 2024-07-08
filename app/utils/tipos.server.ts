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

export async function getTiposNoS(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
            SELECT TOP 50 *
            FROM TiposVehiculos
            WHERE CodTipo NOT IN (SELECT tv.CodTipo
                                  FROM TiposVehiculos tv, SucursalesAtiendenVehiculos sav
                                  WHERE  tv.CodTipo = sav.CodTipo AND sav.RIFSucursal = ${RIFSuc})
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

export async function getTiposSucursal(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    const resultas = await sql.query`
                SELECT tv.CodTipo, tv.NombreTipo
                FROM TiposVehiculos tv, SucursalesAtiendenVehiculos sav
                WHERE  tv.CodTipo = sav.CodTipo AND sav.RIFSucursal = ${RIFSuc}
            `;
    const tipos = await Promise.all(
      resultas.recordset.map(
        async (tipo) => await tipoVehiculoSchema.parseAsync(tipo)
      )
    );
    return { type: "success" as const, data: tipos };
  } catch (error) {
    return handleError(error);
  }
}

export async function eliminarSucursalesAtiendenVehiculos(formData: FormData) {
  try {
    await sql.connect(sqlConfig);
    const RIFSuc = String(formData.get("RIFSuc"));
    const CodTipo = String(formData.get("CodTipo"));
    await sql.query`
                DELETE FROM SucursalesAtiendenVehiculos WHERE RIFSuc = ${RIFSuc} AND CodTipo = ${CodTipo}
            `;
    return { type: "success" as const, message: "Creado con éxito" };
  } catch (error) {
    return handleError(error);
  }
}

export async function agregarSucursalesAtiendenVehiculos(formData: FormData) {
  try {
    await sql.connect(sqlConfig);
    const RIFSuc = String(formData.get("RIFSuc"));
    const CodTipo = String(formData.get("CodTipo"));
    await sql.query`
                INSERT INTO SucursalesAtiendenVehiculos (RIFSucursal, CodTipo) VALUES (${RIFSuc}, ${CodTipo})
            `;
    return { type: "success" as const, message: "Creado con éxito" };
  } catch (error) {
    return handleError(error);
  }
}

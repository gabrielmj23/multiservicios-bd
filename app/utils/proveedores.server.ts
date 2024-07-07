import { handleError } from "./common.server";
import sql from "mssql";
import { sqlConfig } from "./connectDb.server";
import { proveedorSchema } from "./schemas";

export async function getProveedores() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT * FROM Proveedores`;
    const proveedores = await Promise.all(
      result.recordset.map(async (proveedor) =>
        proveedorSchema.parseAsync(proveedor)
      )
    );
    return { type: "success" as const, data: proveedores };
  } catch (error) {
    return handleError(error);
  }
}

export async function addProveedor(formData: FormData) {
  try {
    const proveedor = {
      RIFProv: String(formData.get("RIFProv")),
      RazonProv: String(formData.get("RazonProv")),
      DireccionProv: String(formData.get("DireccionProv")),
      TlfLocal: String(formData.get("TlfLocal")),
      TlfCelular: String(formData.get("TlfCelular")),
      PersonaCont: String(formData.get("PersonaCont")),
      CodLinea: Number(formData.get("CodLinea")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
      INSERT INTO Proveedores
      VALUES (${proveedor.RIFProv}, ${proveedor.RazonProv}, ${proveedor.DireccionProv},
        ${proveedor.TlfLocal}, ${proveedor.TlfCelular}, ${proveedor.PersonaCont}, ${proveedor.CodLinea})
    `;
    return {
      type: "success" as const,
      message: "Proveedor agregado con éxito",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function editProveedor(formData: FormData) {
  try {
    const proveedor = {
      RIFProv: String(formData.get("RIFProv")),
      RazonProv: String(formData.get("RazonProv")),
      DireccionProv: String(formData.get("DireccionProv")),
      TlfLocal: String(formData.get("TlfLocal")),
      TlfCelular: String(formData.get("TlfCelular")),
      PersonaCont: String(formData.get("PersonaCont")),
      CodLinea: Number(formData.get("CodLinea")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
        UPDATE Proveedores
        SET RazonProv = ${proveedor.RazonProv}, DireccionProv = ${proveedor.DireccionProv},
        TlfLocal = ${proveedor.TlfLocal}, TlfCelular = ${proveedor.TlfCelular},
        PersonaCont = ${proveedor.PersonaCont}, CodLinea = ${proveedor.CodLinea}
        WHERE RIFProv = ${proveedor.RIFProv}
        `;
    return {
      type: "success" as const,
      message: "Proveedor editado con éxito",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function eliminarProveedor(formData: FormData) {
  try {
    const RIFProv = String(formData.get("RIFProv"));
    await sql.connect(sqlConfig);
    await sql.query`DELETE FROM Proveedores WHERE RIFProv = ${RIFProv}`;
    return {
      type: "success" as const,
      message: "Proveedor eliminado con éxito",
    };
  } catch (error) {
    return handleError(error);
  }
}

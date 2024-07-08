import { handleError } from "./common.server";
import sql from "mssql";
import { sqlConfig } from "./connectDb.server";
import { vehiculoConForaneosSchema } from "./schemas";
import { z } from "zod";

export async function getVehiculosConModelo() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
        SELECT TOP 50 v.CodVehiculo, v.PlacaVehic, v.FechaAdq, v.TipoAceite, v.CodMarca, v.CodModelo, v.CIPropietario, ma.NombreMarca, mo.DescModelo, c.NombreCliente
        FROM Vehiculos v, Marcas ma, Modelos mo, Clientes c
        WHERE v.CodMarca = mo.CodMarca
        AND v.CodModelo = mo.CodModelo
        AND mo.CodMarca = ma.CodMarca
        AND v.CIPropietario = c.CICliente
    `;
    const vehiculos = await Promise.all(
      result.recordset.map(
        async (vehiculo) => await vehiculoConForaneosSchema.parseAsync(vehiculo)
      )
    );
    return { type: "success" as const, data: vehiculos };
  } catch (error) {
    return handleError(error);
  }
}

export async function getVehiculoParaFicha(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
      SELECT v.CodVehiculo, v.PlacaVehic
      FROM Vehiculos v, Modelos mo
      WHERE v.CodModelo = mo.CodModelo
      AND mo.CodTipo IN (
        SELECT CodTipo
        FROM SucursalesAtiendenVehiculos
        WHERE RIFSucursal = ${RIFSuc}
      )
    `;
    const vehiculos = await Promise.all(
      result.recordset.map((vehiculo) =>
        z
          .object({
            CodVehiculo: z.number().int(),
            PlacaVehic: z.string(),
          })
          .parseAsync(vehiculo)
      )
    );
    return { type: "success" as const, data: vehiculos };
  } catch (error) {
    return handleError(error);
  }
}

export async function addVehiculo(formData: FormData) {
  try {
    const vehiculo = {
      PlacaVehic: String(formData.get("PlacaVehic")),
      FechaAdq: String(formData.get("FechaAdq")),
      TipoAceite: String(formData.get("TipoAceite")),
      CodMarca: Number(formData.get("CodMarca")),
      CodModelo: Number(formData.get("CodModelo")),
      CIPropietario: String(formData.get("CIPropietario")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
      INSERT INTO Vehiculos (PlacaVehic, FechaAdq, TipoAceite, CodMarca, CodModelo, CIPropietario)
      VALUES (${vehiculo.PlacaVehic}, ${vehiculo.FechaAdq}, ${vehiculo.TipoAceite}, ${vehiculo.CodMarca}, ${vehiculo.CodModelo}, ${vehiculo.CIPropietario})
    `;
    return {
      type: "success" as const,
      message: "Vehículo agregado correctamente",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function editVehiculo(formData: FormData) {
  try {
    const vehiculo = {
      CodVehiculo: Number(formData.get("CodVehiculo")),
      PlacaVehic: String(formData.get("PlacaVehic")),
      FechaAdq: String(formData.get("FechaAdq")),
      TipoAceite: String(formData.get("TipoAceite")),
      CodMarca: Number(formData.get("CodMarca")),
      CodModelo: Number(formData.get("CodModelo")),
      CIPropietario: String(formData.get("CIPropietario")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
      UPDATE Vehiculos
      SET PlacaVehic = ${vehiculo.PlacaVehic}, FechaAdq = ${vehiculo.FechaAdq}, TipoAceite = ${vehiculo.TipoAceite}, CodMarca = ${vehiculo.CodMarca}, CodModelo = ${vehiculo.CodModelo}, CIPropietario = ${vehiculo.CIPropietario}
      WHERE CodVehiculo = ${vehiculo.CodVehiculo}
    `;
    return {
      type: "success" as const,
      message: "Vehículo modificado correctamente",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function eliminarVehiculo(formData: FormData) {
  try {
    const CodVehiculo = Number(formData.get("CodVehiculo"));
    await sql.connect(sqlConfig);
    await sql.query`
      DELETE FROM Vehiculos
      WHERE CodVehiculo = ${CodVehiculo}
    `;
    return {
      type: "success" as const,
      message: "Vehículo eliminado correctamente",
    };
  } catch (error) {
    return handleError(error);
  }
}

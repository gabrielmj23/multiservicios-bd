import { handleError } from "./common.server";
import sql from "mssql";
import { sqlConfig } from "./connectDb.server";
import { fichaTableSchema } from "./schemas";

export async function getFichas(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
        SELECT fs.CodFicha, fs.CodVehiculo, v.CIPropietario, fs.Autorizado, fs.TiempoEnt, fs.TiempoSalEst, fs.TiempoSalReal
        FROM FichasServicios fs, Vehiculos v
        WHERE fs.CodVehiculo = v.CodVehiculo AND fs.RIFSucursal = ${RIFSuc}
    `;
    const fichas = await Promise.all(
      result.recordset.map(async (ficha) => fichaTableSchema.parseAsync(ficha))
    );
    return { type: "success" as const, data: fichas };
  } catch (error) {
    return handleError(error);
  }
}

export async function addFicha(formData: FormData, RIFSuc: string) {
  try {
    const ficha = {
      CodVehiculo: String(formData.get("CodVehiculo")),
      Autorizado: formData.get("Autorizado"),
      TiempoEnt: String(formData.get("TiempoEnt")),
      TiempoSalEst: String(formData.get("TiempoSalEst")),
    };
    await sql.connect(sqlConfig);
    if (ficha.Autorizado) {
      await sql.query`
          INSERT INTO FichasServicios (CodVehiculo, Autorizado, TiempoEnt, TiempoSalEst, RIFSucursal)
          VALUES (${ficha.CodVehiculo}, ${String(ficha.Autorizado)}, ${
        ficha.TiempoEnt
      }, ${ficha.TiempoSalEst}, ${RIFSuc})
        `;
    } else {
      await sql.query`
          INSERT INTO FichasServicios (CodVehiculo, TiempoEnt, TiempoSalEst, RIFSucursal)
          VALUES (${ficha.CodVehiculo}, ${ficha.TiempoEnt}, ${ficha.TiempoSalEst}, ${RIFSuc})`;
    }
    return {
      type: "success" as const,
      message: "Ficha agregada correctamente",
    };
  } catch (error) {
    return handleError(error);
  }
}

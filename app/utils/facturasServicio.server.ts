import sql from "mssql";
import { sqlConfig } from "./connectDb.server";
import { handleError } from "./common.server";
import { facturaServicioSchema } from "./schemas";

export async function getFacturasServicio(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
      SELECT fac.CodFServ, fac.FechaFServ, fac.MontoFServ, fac.PorcDcto, fac.CodFicha
      FROM FacturasServicio fac, FichasServicios fs
      WHERE fs.RIFSucursal = ${RIFSuc}
      AND fac.CodFicha = fs.CodFicha
      ORDER BY fac.FechaFServ DESC
    `;
    const facturas = await Promise.all(
      result.recordset.map(
        async (factura) => await facturaServicioSchema.parseAsync(factura)
      )
    );
    return { type: "success" as const, data: facturas };
  } catch (error) {
    return handleError(error);
  }
}

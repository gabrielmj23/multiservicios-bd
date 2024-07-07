import sql from "mssql";
import { sqlConfig } from "./connectDb.server";
import { handleError } from "./common.server";
import { detalleFacturaSchema, facturaServicioSchema } from "./schemas";

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

export async function getDetalleFactura(CodFServ: number) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
        SELECT fac.CodFServ, fac.FechaFServ, fac.MontoFServ, fac.PorcDcto, c.CICliente, c.NombreCliente, v.CodVehiculo, v.PlacaVehic,
            ar.NumRealizada, a.DescActividad, ar.PrecioHora, ar.Tiempo, ar.PrecioHora * ar.Tiempo AS TotalActividad,
            i.NombreIns, arc.Cantidad, arc.Precio, arc.Cantidad * arc.Precio AS TotalInsumo
        FROM FacturasServicio fac, Clientes c, Vehiculos v, ActividadesRealizadas ar, Actividades a, Insumos i,
            ActividadesRealizadasConsumen arc, FichasServicios fs
        WHERE fac.CodFServ = ${CodFServ}
        AND fac.CodFicha = fs.CodFicha AND fs.CodVehiculo = v.CodVehiculo AND v.CIPropietario = c.CICliente
        AND ar.CodFicha = fac.CodFicha AND ar.CodServicio = a.CodServicio AND ar.CodAct = a.CodActividad
        AND i.CodIns = arc.CodInsumo
        AND ar.CodFicha = arc.CodFicha AND ar.CodServicio = arc.CodServicio AND ar.CodAct = arc.CodAct AND ar.NumRealizada = arc.NumRealizada
    `;
    if (result.recordset.length === 0) {
      return { type: "error" as const, message: "Factura no encontrada" };
    }
    const detalles = await Promise.all(
      result.recordset.map(async (detalle) =>
        detalleFacturaSchema.parseAsync(detalle)
      )
    );
    const datosBasicos = {
      CodFServ: detalles[0].CodFServ,
      FechaFServ: detalles[0].FechaFServ,
      MontoFServ: detalles[0].MontoFServ,
      PorcDcto: detalles[0].PorcDcto,
      CICliente: detalles[0].CICliente,
      NombreCliente: detalles[0].NombreCliente,
      CodVehiculo: detalles[0].CodVehiculo,
      PlacaVehic: detalles[0].PlacaVehic,
    };
    const manoDeObra = detalles.reduce(
      (acc, detalle) => {
        const idx = acc.findIndex(
          (det) => det.NumRealizada === detalle.NumRealizada
        );
        if (idx === -1) {
          acc.push({
            NumRealizada: detalle.NumRealizada,
            DescActividad: detalle.DescActividad,
            PrecioHora: detalle.PrecioHora,
            Tiempo: detalle.Tiempo,
            TotalActividad: detalle.TotalActividad,
          });
        }
        return acc;
      },
      Array<{
        NumRealizada: number;
        DescActividad: string;
        PrecioHora: number;
        Tiempo: number;
        TotalActividad: number;
      }>()
    );
    const insumosRepuestos = detalles.reduce(
      (acc, detalle) => {
        const idx = acc.findIndex(
          (det) =>
            det.NombreIns === detalle.NombreIns &&
            det.Precio === detalle.Precio &&
            det.Cantidad === detalle.Cantidad
        );
        if (idx === -1) {
          acc.push({
            NombreIns: detalle.NombreIns,
            Cantidad: detalle.Cantidad,
            Precio: detalle.Precio,
            TotalInsumo: detalle.TotalInsumo,
          });
        }
        return acc;
      },
      Array<{
        NombreIns: string;
        Cantidad: number;
        Precio: number;
        TotalInsumo: number;
      }>()
    );
    return {
      type: "success" as const,
      data: { datosBasicos, manoDeObra, insumosRepuestos },
    };
  } catch (error) {
    return handleError(error);
  }
}

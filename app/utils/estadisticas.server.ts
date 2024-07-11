import { handleError } from "./common.server";
import sql from "mssql";
import { sqlConfig } from "./connectDb.server";
import { z } from "zod";
import { personalMasAtiendeSchema } from "./schemas";

export async function marcasAtendidasPorServicio() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT * FROM MarcasAtendidasPorServicio`;
    const marcasAtendidas = await Promise.all(
      result.recordset.map(async (marca) =>
        z
          .object({
            NombreServ: z.string(),
            NombreMarca: z.string(),
            TotalServicios: z.number().int(),
          })
          .parseAsync(marca)
      )
    );
    return { type: "success" as const, data: marcasAtendidas };
  } catch (error) {
    return handleError(error);
  }
}

export async function personalMasAtiende(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    const result =
      await sql.query`SELECT * FROM PersonalRealizaServiciosPorMes WHERE RIFSuc = ${RIFSuc}`;
    const personal = await Promise.all(
      result.recordset.map(async (persona) =>
        personalMasAtiendeSchema.parseAsync(persona)
      )
    );
    return { type: "success" as const, data: personal };
  } catch (error) {
    return handleError(error);
  }
}

export async function clientesPorFrecuencia(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    const result =
      await sql.query`SELECT CICliente, NombreCliente, TotalServicios FROM ClientesFrecuentesPorSuc WHERE RIFSucursal = ${RIFSuc}`;
    const clientes = await Promise.all(
      result.recordset.map(async (cliente) =>
        z
          .object({
            CICliente: z.string(),
            NombreCliente: z.string(),
            TotalServicios: z.number().int(),
          })
          .parseAsync(cliente)
      )
    );
    return { type: "success" as const, data: clientes };
  } catch (error) {
    return handleError(error);
  }
}

export async function articulosPorVentas(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    const result =
      await sql.query`SELECT CodArticuloT, NombreArticuloT, TotalVentas FROM ArticulosVendidosPorSuc WHERE RIFSuc = ${RIFSuc}`;
    const articulos = await Promise.all(
      result.recordset.map(async (articulo) =>
        z
          .object({
            CodArticuloT: z.number().int(),
            NombreArticuloT: z.string(),
            TotalVentas: z.number().int(),
          })
          .parseAsync(articulo)
      )
    );
    return { type: "success" as const, data: articulos };
  } catch (error) {
    return handleError(error);
  }
}

export async function serviciosMasSolicitados() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT * FROM ServiciosMasSolicitados`;
    const servicios = await Promise.all(
      result.recordset.map(async (servicio) =>
        z
          .object({
            CodServicio: z.number().int(),
            NombreServ: z.string(),
            TotalSolicitudes: z.number().int(),
          })
          .parseAsync(servicio)
      )
    );
    return { type: "success" as const, data: servicios };
  } catch (error) {
    return handleError(error);
  }
}

export async function historialServicios(CodVehiculo: string | null) {
  if (!CodVehiculo) {
    return { type: "success" as const, data: [] };
  }
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
        SELECT CodFicha, TiempoEnt, NombreServ, DescActividad
        FROM HistoricoServiciosPorVehiculo
        WHERE CodVehiculo = ${CodVehiculo}
    `;
    const servicios = await Promise.all(
      result.recordset.map(async (servicio) =>
        z
          .object({
            CodFicha: z.number().int(),
            TiempoEnt: z.date(),
            NombreServ: z.string(),
            DescActividad: z.string(),
          })
          .parseAsync(servicio)
      )
    );
    return { type: "success" as const, data: servicios };
  } catch (error) {
    return handleError(error);
  }
}

export async function comparacionSuc(tipoFact: string | null) {
  if (!tipoFact) {
    return { type: "success" as const, data: [] };
  }
  try {
    await sql.connect(sqlConfig);
    if (tipoFact === "servicios") {
      const result = await sql.query`SELECT * FROM SucursalesFactServicios`;
      const servicios = await Promise.all(
        result.recordset.map(async (servicio) =>
          z
            .object({
              RIFSuc: z.string(),
              NombreSuc: z.string(),
              TotalFacturas: z.number().int(),
              TotalFacturado: z.number(),
            })
            .parseAsync(servicio)
        )
      );
      return { type: "success" as const, data: servicios };
    } else {
      const result = await sql.query`SELECT * FROM SucursalesFactTienda`;
      const tienda = await Promise.all(
        result.recordset.map(async (producto) =>
          z
            .object({
              RIFSuc: z.string(),
              NombreSuc: z.string(),
              TotalFacturas: z.number().int(),
              TotalFacturado: z.number().int(),
            })
            .parseAsync(producto)
        )
      );
      return { type: "success" as const, data: tienda };
    }
  } catch (error) {
    return handleError(error);
  }
}

export async function clientesSuspenden() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT * FROM ClientesSuspendenReservas`;
    const clientes = await Promise.all(
      result.recordset.map(async (cliente) =>
        z
          .object({
            CICliente: z.string(),
            NombreCliente: z.string(),
            ReservasSuspendidas: z.number().int(),
          })
          .parseAsync(cliente)
      )
    );
    return { type: "success" as const, data: clientes };
  } catch (error) {
    return handleError(error);
  }
}

export async function proveedoresMasSuministros() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT * FROM ProveedorMasSuministros`;
    const proveedores = await Promise.all(
      result.recordset.map(async (proveedor) =>
        z
          .object({
            RIFProv: z.string(),
            RazonProv: z.string(),
            TotalSuministrado: z.number().int(),
          })
          .parseAsync(proveedor)
      )
    );
    return { type: "success" as const, data: proveedores };
  } catch (error) {
    return handleError(error);
  }
}

export async function insumosAjustados() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT * FROM InsumosAjustados`;
    const insumos = await Promise.all(
      result.recordset.map(async (insumo) =>
        z
          .object({
            CodIns: z.number().int(),
            NombreIns: z.string(),
            CodAjuste: z.number().int(),
            FechaAjuste: z.date(),
            TipoAjuste: z.string(),
            ComentarioAjuste: z.string(),
            Diferencia: z.number().int(),
          })
          .parseAsync(insumo)
      )
    );
    return { type: "success" as const, data: insumos };
  } catch (error) {
    return handleError(error);
  }
}

import sql from "mssql";
import { handleError } from "./common.server";
import { sqlConfig } from "./connectDb.server";
import { servicioConActividadesSchema } from "./schemas";
import { z } from "zod";

export async function getServiciosDeSucursal(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
        SELECT s.CodServicio, s.NombreServ, s.MontoServ, s.CIEncargado, s.CICoordinador, a.CodActividad, a.DescActividad, a.CostoHora
        FROM Servicios s LEFT JOIN Actividades a ON s.CodServicio = a.CodServicio, SucursalesOfrecen so
        WHERE so.RIFSucursal = ${RIFSuc} AND so.CodServicio = s.CodServicio
    `;
    const servicios = await Promise.all(
      result.recordset.map(async (srv) =>
        servicioConActividadesSchema.parseAsync(srv)
      )
    );
    // Agrupar las actividades en arreglos por servicio
    const serviciosConActividades = servicios.reduce(
      (acc, srv) => {
        const srvIndex = acc.findIndex(
          (s) => s.CodServicio === srv.CodServicio
        );
        if (srvIndex === -1) {
          acc.push({
            CodServicio: srv.CodServicio,
            NombreServ: srv.NombreServ,
            MontoServ: srv.MontoServ,
            CIEncargado: srv.CIEncargado,
            CICoordinador: srv.CICoordinador,
            Actividades: [],
          });
          acc.at(-1)?.Actividades.push({
            CodActividad: srv.CodActividad,
            DescActividad: srv.DescActividad,
            CostoHora: srv.CostoHora,
          });
        } else {
          acc[srvIndex].Actividades.push({
            CodActividad: srv.CodActividad,
            DescActividad: srv.DescActividad,
            CostoHora: srv.CostoHora,
          });
        }
        return acc;
      },
      [] as Array<{
        CodServicio: number;
        NombreServ: string;
        MontoServ: number;
        CIEncargado: string;
        CICoordinador: string;
        Actividades: Array<{
          CodActividad: number | null;
          DescActividad: string | null;
          CostoHora: number | null;
        }>;
      }>
    );
    return { type: "success" as const, data: serviciosConActividades };
  } catch (error) {
    return handleError(error);
  }
}

export async function getServicios() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
            SELECT CodServicio, NombreServ
            FROM Servicios
        `;
    const servicios = await Promise.all(
      result.recordset.map(async (srv) =>
        z
          .object({
            CodServicio: z.number(),
            NombreServ: z.string(),
          })
          .parseAsync(srv)
      )
    );
    return { type: "success" as const, data: servicios };
  } catch (error) {
    return handleError(error);
  }
}

export async function addServicio(formData: FormData, RIFSuc: string) {
  try {
    const servicio = {
      NombreServ: String(formData.get("NombreServ")),
      CIEncargado: String(formData.get("CIEncargado")),
      CICoordinador: String(formData.get("CICoordinador")),
      Capacidad: Number(formData.get("Capacidad")),
      TiempoReserva: Number(formData.get("TiempoReserva")),
    };
    await sql.connect(sqlConfig);
    const result = await sql.query`
            INSERT INTO Servicios (NombreServ, MontoServ, CIEncargado, CICoordinador)
            OUTPUT Inserted.CodServicio
            VALUES (${servicio.NombreServ}, 0, ${servicio.CIEncargado}, ${servicio.CICoordinador})
        `;
    const CodServicio = Number(result.recordset[0].CodServicio);
    await sql.query`
            INSERT INTO SucursalesOfrecen (RIFSucursal, CodServicio, Capacidad, TiempoReserva)
            VALUES (${RIFSuc}, ${CodServicio}, ${servicio.Capacidad}, ${servicio.TiempoReserva})
        `;
    return { type: "success" as const, message: "Servicio agregado con éxito" };
  } catch (error) {
    return handleError(error);
  }
}

export async function editServicio(formData: FormData) {
  try {
    const servicio = {
      CodServicio: Number(formData.get("CodServicio")),
      NombreServ: String(formData.get("NombreServ")),
      CIEncargado: String(formData.get("CIEncargado")),
      CICoordinador: String(formData.get("CICoordinador")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
            UPDATE Servicios
            SET NombreServ = ${servicio.NombreServ}, CIEncargado = ${servicio.CIEncargado}, CICoordinador = ${servicio.CICoordinador}
            WHERE CodServicio = ${servicio.CodServicio}
        `;
    return {
      type: "success" as const,
      message: "Servicio editado con éxito",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function eliminarServicio(formData: FormData) {
  try {
    const CodServicio = Number(formData.get("CodServicio"));
    await sql.connect(sqlConfig);
    await sql.query`
            DELETE FROM Servicios
            WHERE CodServicio = ${CodServicio}
        `;
    return {
      type: "success" as const,
      message: "Servicio eliminado con éxito",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function ofrecerServicio(formData: FormData, RIFSuc: string) {
  try {
    const CodServicio = Number(formData.get("CodServicio"));
    const Capacidad = Number(formData.get("Capacidad"));
    const TiempoReserva = Number(formData.get("TiempoReserva"));
    await sql.connect(sqlConfig);
    await sql.query`
                INSERT INTO SucursalesOfrecen (RIFSucursal, CodServicio, Capacidad, TiempoReserva)
                VALUES (${RIFSuc}, ${CodServicio}, ${Capacidad}, ${TiempoReserva})
            `;
    return {
      type: "success" as const,
      message: "Servicio ofrecido con éxito",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function addActividad(formData: FormData) {
  try {
    const actividad = {
      CodServicio: Number(formData.get("CodServicio")),
      DescActividad: String(formData.get("DescActividad")),
      CostoHora: Number(formData.get("CostoHora")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
            INSERT INTO Actividades (CodServicio, DescActividad, CostoHora)
            VALUES (${actividad.CodServicio}, ${actividad.DescActividad}, ${actividad.CostoHora})
        `;
    return {
      type: "success" as const,
      message: "Actividad agregada con éxito",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function editActividad(formData: FormData) {
  try {
    const actividad = {
      CodServicio: Number(formData.get("CodServicio")),
      CodActividad: Number(formData.get("CodActividad")),
      DescActividad: String(formData.get("DescActividad")),
      CostoHora: Number(formData.get("CostoHora")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
            UPDATE Actividades
            SET DescActividad = ${actividad.DescActividad}, CostoHora = ${actividad.CostoHora}
            WHERE CodServicio = ${actividad.CodServicio} AND CodActividad = ${actividad.CodActividad}
        `;
    return {
      type: "success" as const,
      message: "Actividad editada con éxito",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function eliminarActividad(formData: FormData) {
  try {
    const CodServicio = Number(formData.get("CodServicio"));
    const CodActividad = Number(formData.get("CodActividad"));
    await sql.connect(sqlConfig);
    await sql.query`
            DELETE FROM Actividades
            WHERE CodServicio = ${CodServicio} AND CodActividad = ${CodActividad}
        `;
    return {
      type: "success" as const,
      message: "Actividad eliminada con éxito",
    };
  } catch (error) {
    return handleError(error);
  }
}

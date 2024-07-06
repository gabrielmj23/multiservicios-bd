import { handleError } from "./common.server";
import sql from "mssql";
import { sqlConfig } from "./connectDb.server";
import { reservaTableSchema } from "./schemas";

export async function getReservas(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
        SELECT r.NumReserva, r.FechaReserva, r.FechaServicio, r.Abono, r.CodVehiculo, r.CodServicio, s.NombreServ
        FROM Reservas r, Servicios s
        WHERE r.CodServicio = s.CodServicio
        AND r.RIFSucursal = ${RIFSuc}
    `;
    const reservas = await Promise.all(
      result.recordset.map((reserva) => reservaTableSchema.parseAsync(reserva))
    );
    return { type: "success" as const, data: reservas };
  } catch (error) {
    return handleError(error);
  }
}

export async function addReserva(formData: FormData, RIFSuc: string) {
  try {
    const reserva = {
      FechaServicio: String(formData.get("FechaServicio")),
      Abono: Number(formData.get("Abono")),
      CodVehiculo: Number(formData.get("CodVehiculo")),
      CodServicio: Number(formData.get("CodServicio")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
            INSERT INTO Reservas (FechaReserva, FechaServicio, Abono, CodVehiculo, CodServicio, RIFSucursal)
            VALUES (GETDATE(), ${reserva.FechaServicio}, ${reserva.Abono}, ${reserva.CodVehiculo}, ${reserva.CodServicio}, ${RIFSuc})
        `;
    return { type: "success" as const, message: "Reserva agregada con éxito" };
  } catch (error) {
    return handleError(error);
  }
}

import { handleError } from "./common.server";
import { sqlConfig } from "./connectDb.server";
import sql from "mssql";
import { empleadoSchema } from "./schemas";

export async function getEmpleados(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    // Buscar empleados
    const result =
      await sql.query`SELECT * FROM Empleados WHERE RIFSuc = ${RIFSuc}`;
    const empleados = await Promise.all(
      result.recordset.map((result) => empleadoSchema.parseAsync(result))
    );
    // Buscar CI de encargado
    const result2 =
      await sql.query`SELECT CIEncargado, FechaInicioEncargado FROM Sucursales WHERE RIFSuc = ${RIFSuc}`;
    let CIEncargado = null,
      FechaInicioEncargado = null;
    if (result2.recordset.length > 0 && result2.recordset[0].CIEncargado) {
      CIEncargado = String(result2.recordset[0].CIEncargado);
      FechaInicioEncargado = String(result2.recordset[0].FechaInicioEncargado);
    }
    return {
      type: "success" as const,
      data: { empleados, CIEncargado, FechaInicioEncargado },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function addEmpleado(formData: FormData, RIFSuc: string) {
  try {
    const empleado = {
      CIEmpleado: String(formData.get("CIEmpleado")),
      NombreEmp: String(formData.get("NombreEmp")),
      DireccionEmp: String(formData.get("DireccionEmp")),
      TlfEmp: String(formData.get("TlfEmp")),
      SalarioEmp: Number(formData.get("SalarioEmp")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
      INSERT INTO Empleados (CIEmpleado, NombreEmp, DireccionEmp, TlfEmp, SalarioEmp, RIFSuc)
      VALUES (${empleado.CIEmpleado}, ${empleado.NombreEmp}, ${empleado.DireccionEmp}, ${empleado.TlfEmp}, ${empleado.SalarioEmp}, ${RIFSuc})
    `;
    return { type: "success" as const, message: "Empleado añadido con éxito" };
  } catch (error) {
    return handleError(error);
  }
}

export async function eliminarEmpleado(formData: FormData, RIFSuc: string) {
  try {
    const empleado = {
      CIEmpleado: String(formData.get("CIEmpleado")),
      NombreEmp: String(formData.get("NombreEmp")),
      DireccionEmp: String(formData.get("DireccionEmp")),
      TlfEmp: String(formData.get("TlfEmp")),
      SalarioEmp: Number(formData.get("SalarioEmp")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
      DELETE FROM Empleados
      WHERE CIEmpleado = ${empleado.CIEmpleado} AND RIFSuc = ${RIFSuc}
    `;
    return { type: "success" as const, message: "Empleado eliminado con éxito" };
  } catch (error) {
    return handleError(error);
  }
}

export async function editarEmpleado(formData: FormData) {
  try {
    const empleado = {
      CIEmpleado: String(formData.get("CIEmpleado")),
      NombreEmp: String(formData.get("NombreEmp")),
      DireccionEmp: String(formData.get("DireccionEmp")),
      TlfEmp: String(formData.get("TlfEmp")),
      SalarioEmp: Number(formData.get("SalarioEmp")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
      UPDATE Empleados
      SET NombreEmp = ${empleado.NombreEmp}, DireccionEmp = ${empleado.DireccionEmp}, TlfEmp = ${empleado.TlfEmp}, SalarioEmp = ${empleado.SalarioEmp}
      WHERE CIEmpleado = ${empleado.CIEmpleado}
    `;
    return { type: "success" as const, message: "Empleado editado con éxito" };
  } catch (error) {
    return handleError(error);
  }
}

export async function hacerEncargado(formData: FormData, RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    await sql.query`
      UPDATE Sucursales
      SET CIEncargado = ${String(
        formData.get("CIEmpleado")
      )}, FechaInicioEncargado = GETDATE()
      WHERE RIFSuc = ${RIFSuc}
    `;
    return {
      type: "success" as const,
      message: "Empleado hecho encargado con éxito",
    };
  } catch (error) {
    return handleError(error);
  }
}

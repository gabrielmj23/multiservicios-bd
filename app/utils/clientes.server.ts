import { json } from "@remix-run/react";
import sql from "mssql";
import { sqlConfig } from "./connectDb.server";
import { clienteSchema } from "./schemas";
import { handleError } from "./common.server";

export async function getClientes() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT TOP 50 * FROM Clientes`;
    const parsedResults = await Promise.all(
      result.recordset.map(
        async (cliente) => await clienteSchema.parseAsync(cliente)
      )
    );
    return json({
      type: "success" as const,
      data: parsedResults,
    });
  } catch (error) {
    return json(handleError(error));
  }
}

export async function getCedulas() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT CICliente FROM Clientes`;
    const cedulas = result.recordset.map((cliente) =>
      String(cliente.CICliente)
    );
    return {
      type: "success" as const,
      data: cedulas,
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function addCliente(formData: FormData) {
  try {
    let cliente = {
      CICliente: String(formData.get("CICliente")),
      NombreCliente: String(formData.get("NombreCliente")),
      Tlf1: String(formData.get("Tlf1")),
      Tlf2: String(formData.get("Tlf2")),
      EmailCliente: String(formData.get("EmailCliente")),
    };
    cliente = clienteSchema.parse(cliente);
    await sql.connect(sqlConfig);
    await sql.query`
      INSERT INTO Clientes (CICliente, NombreCliente, Tlf1, Tlf2, EmailCliente)
      VALUES (${cliente.CICliente}, ${cliente.NombreCliente}, ${cliente.Tlf1}, ${cliente.Tlf2}, ${cliente.EmailCliente})
    `;
    return json({
      type: "success" as const,
      message: "Cliente agregado correctamente",
    });
  } catch (error) {
    return json(handleError(error));
  }
}

export async function editCliente(formData: FormData) {
  try {
    let cliente = {
      CICliente: String(formData.get("CICliente")),
      NombreCliente: String(formData.get("NombreCliente")),
      Tlf1: String(formData.get("Tlf1")),
      Tlf2: String(formData.get("Tlf2")),
      EmailCliente: String(formData.get("EmailCliente")),
    };
    cliente = clienteSchema.parse(cliente);
    await sql.connect(sqlConfig);
    await sql.query`
        UPDATE Clientes
        SET NombreCliente = ${cliente.NombreCliente}, Tlf1 = ${cliente.Tlf1}, Tlf2 = ${cliente.Tlf2}, EmailCliente = ${cliente.EmailCliente}
        WHERE CICliente = ${cliente.CICliente}
    `;
    return json({
      type: "success" as const,
      message: "Cliente actualizado con éxito",
    });
  } catch (error) {
    return json(handleError(error));
  }
}

export async function eliminarCliente(formData: FormData) {
  try {
    const CICliente = String(formData.get("CICliente"));
    await sql.connect(sqlConfig);
    await sql.query`DELETE FROM Clientes WHERE CICliente = ${CICliente}`;
    return {
      type: "success" as const,
      message: "Cliente eliminado con éxito",
    };
  } catch (error) {
    return handleError(error);
  }
}

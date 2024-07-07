import { handleError } from "./common.server";
import sql from "mssql";
import { sqlConfig } from "./connectDb.server";
import {
  articulosTiendaSchema,
  facturaTiendaIncluyenSchema,
  facturaTiendaSchema,
} from "./schemas";

interface FacturaDetalles {
  CICliente: string;
  Articulos: { CodArticuloT: number; Cantidad: number }[];
}

export async function getArticulosTienda(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
      SELECT *
      FROM ArticulosTienda
      Where RIFSuc = ${RIFSuc}
    `;
    const articulos = await Promise.all(
      result.recordset.map(
        async (articulo) => await articulosTiendaSchema.parseAsync(articulo)
      )
    );
    return { type: "success" as const, data: articulos };
  } catch (error) {
    return handleError(error);
  }
}

export async function addArticuloTienda(formData: FormData, RIFSuc: string) {
  try {
    const articulo = {
      NombreArticuloT: String(formData.get("NombreArticuloT")),
      Precio: Number(formData.get("Precio")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
      INSERT INTO ArticulosTienda (NombreArticuloT, Precio, RIFSuc)
      VALUES (${articulo.NombreArticuloT}, ${articulo.Precio}, ${RIFSuc})
    `;
    return {
      type: "success" as const,
      message: "Artículo añadido con éxito",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function editarArticuloTienda(formData: FormData) {
  try {
    const articulo = {
      CodArticuloT: Number(formData.get("CodArticuloT")),
      NombreArticuloT: String(formData.get("NombreArticuloT")),
      Precio: Number(formData.get("Precio")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
      UPDATE ArticulosTienda
      SET NombreArticuloT = ${articulo.NombreArticuloT},
          Precio = ${articulo.Precio}
      WHERE CodArticuloT = ${articulo.CodArticuloT}
    `;
    return {
      type: "success" as const,
      message: "Artículo editado con éxito",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function crearFacturaYArticulos(
  facturaDetalles: FacturaDetalles,
  RIFSuc: string
) {
  const pool = await sql.connect(sqlConfig);
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // Insert into Facturas table
    const { recordset: facturaInserted } = await transaction
      .request()
      .input("CICliente", sql.VarChar, facturaDetalles.CICliente)
      .input("RIFSuc", sql.VarChar, RIFSuc).query(`
        INSERT INTO FacturasTienda ( FechaFTien, CICliente, RIFSuc)
        OUTPUT INSERTED.CodFTien
        VALUES ( GETDATE(), @CICliente, @RIFSuc)
      `);

    const codFTien = facturaInserted[0].CodFTien;

    // Insert into FacturasIncluyen table for each articulo
    for (const articulo of facturaDetalles.Articulos) {
      const result = await transaction
        .request()
        .input("CodArticuloT", sql.Int, articulo.CodArticuloT).query(`
          SELECT Precio FROM ArticulosTienda WHERE CodArticuloT = @CodArticuloT
        `);

      const precio = result.recordset[0].Precio;

      await transaction
        .request()
        .input("CodFTien", sql.Int, codFTien)
        .input("CodArticuloT", sql.Int, articulo.CodArticuloT)
        .input("Cantidad", sql.Int, articulo.Cantidad)
        .input("Precio", sql.Decimal(10, 2), precio).query(`
          INSERT INTO FacturasTiendaIncluyen (CodFTien, CodArticuloT, Cantidad, Precio)
          VALUES (@CodFTien, @CodArticuloT, @Cantidad, @Precio)
        `);
    }

    await transaction.commit();
    return {
      type: "success",
      message: "Factura y artículos añadidos con éxito",
    };
  } catch (error) {
    await transaction.rollback();
    return handleError(error);
  }
}

export async function getFacturasTienda(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
      SELECT *
      FROM FacturasTienda
      WHERE RIFSuc = ${RIFSuc}
    `;
    const facturas = await Promise.all(
      result.recordset.map(
        async (factura) => await facturaTiendaSchema.parseAsync(factura)
      )
    );
    return { type: "success" as const, data: facturas };
  } catch (error) {
    return handleError(error);
  }
}

export async function getFacturaTienda(CodFTien: number) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
      SELECT *
      FROM FacturasTienda
      WHERE CodFTien = ${CodFTien}
    `;
    const factura = await facturaTiendaSchema.parseAsync(result.recordset[0]);
    return { type: "success" as const, data: factura };
  } catch (error) {
    return handleError(error);
  }
}

export async function getFacturasTiendaIncluyen(CodFTien: number) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
      SELECT *
      FROM FacturasTiendaIncluyen
      WHERE CodFTien = ${CodFTien}
    `;
    const facturasIncluyen = await Promise.all(
      result.recordset.map(
        async (facturaIncluyen) =>
          await facturaTiendaIncluyenSchema.parseAsync(facturaIncluyen)
      )
    );
    return { type: "success" as const, data: facturasIncluyen };
  } catch (error) {
    return handleError(error);
  }
}

import { sqlConfig } from "./connectDb.server";
import sql from "mssql";
import { marcaConModelosSchema, marcaSoloConModelos } from "./schemas";
import { handleError } from "./common.server";

export async function getMarcasConModelos() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
        SELECT TOP 50 ma.CodMarca, ma.NombreMarca, mo.CodModelo, mo.DescModelo
        FROM Marcas ma
        LEFT JOIN Modelos mo ON ma.CodMarca = mo.CodMarca
    `;
    const marcas = await Promise.all(
      result.recordset.map(
        async (marca) => await marcaConModelosSchema.parseAsync(marca)
      )
    );
    const marcasFinal = marcas.reduce((acc, marca) => {
      const marcaIndex = acc.findIndex((m) => m.CodMarca === marca.CodMarca);
      if (marcaIndex === -1) {
        acc.push({
          CodMarca: marca.CodMarca,
          NombreMarca: marca.NombreMarca,
          Modelos: [
            { CodModelo: marca.CodModelo, DescModelo: marca.DescModelo },
          ],
        });
      } else {
        acc[marcaIndex].Modelos.push({
          CodModelo: marca.CodModelo,
          DescModelo: marca.DescModelo,
        });
      }
      return acc;
    }, Array<{ CodMarca: number; NombreMarca: string; Modelos: Array<{ CodModelo: number | null; DescModelo: string | null }> }>());
    return { type: "success" as const, data: marcasFinal };
  } catch (error) {
    return handleError(error);
  }
}

export async function getMarcasSoloConModelos() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
        SELECT ma.CodMarca, ma.NombreMarca, mo.CodModelo, mo.DescModelo
        FROM Marcas ma, Modelos mo
        WHERE ma.CodMarca = mo.CodMarca
    `;
    const marcas = await Promise.all(
      result.recordset.map(
        async (marca) => await marcaSoloConModelos.parseAsync(marca)
      )
    );
    const marcasFinal = marcas.reduce((acc, marca) => {
      const marcaIndex = acc.findIndex((m) => m.CodMarca === marca.CodMarca);
      if (marcaIndex === -1) {
        acc.push({
          CodMarca: marca.CodMarca,
          NombreMarca: marca.NombreMarca,
          Modelos: [
            { CodModelo: marca.CodModelo, DescModelo: marca.DescModelo },
          ],
        });
      } else {
        acc[marcaIndex].Modelos.push({
          CodModelo: marca.CodModelo,
          DescModelo: marca.DescModelo,
        });
      }
      return acc;
    }, Array<{ CodMarca: number; NombreMarca: string; Modelos: Array<{ CodModelo: number; DescModelo: string }> }>());
    return { type: "success" as const, data: marcasFinal };
  } catch (error) {
    return handleError(error);
  }
}

export async function addMarca(formData: FormData) {
  try {
    await sql.connect(sqlConfig);
    const nombreMarca = String(formData.get("NombreMarca"));
    await sql.query`
            INSERT INTO Marcas (NombreMarca)
            VALUES (${nombreMarca})
        `;
    console.log("HOLA");
    return { type: "success" as const, message: "Creada con éxito" };
  } catch (error) {
    return handleError(error);
  }
}

export async function editMarca(formData: FormData) {
  try {
    await sql.connect(sqlConfig);
    const codMarca = Number(formData.get("CodMarca"));
    const nombreMarca = String(formData.get("NombreMarca"));
    await sql.query`
            UPDATE Marcas
            SET NombreMarca = ${nombreMarca}
            WHERE CodMarca = ${codMarca}
        `;
    return { type: "success" as const, message: "Editada con éxito" };
  } catch (error) {
    return handleError(error);
  }
}

export async function eliminarMarca(formData: FormData) {
  try {
    await sql.connect(sqlConfig);
    const codMarca = Number(formData.get("CodMarca"));
    await sql.query`
            DELETE FROM Marcas
            WHERE CodMarca = ${codMarca}
        `;
    return { type: "success" as const, message: "Eliminada con éxito" };
  } catch (error) {
    return handleError(error);
  }
}

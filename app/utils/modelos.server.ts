import { handleError } from "./common.server";
import { sqlConfig } from "./connectDb.server";
import { modeloSchema, viewModeloSchema } from "./schemas";
import sql from "mssql";

export async function getModelo(codMarca: number, codModelo: number) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
        SELECT DescModelo, NumPuestos, Peso, TipoAcMotor, TipoAcCaja, Octan, TipoRefri, NombreTipo
        FROM Modelos, TiposVehiculos
        WHERE CodMarca = ${codMarca} AND CodModelo = ${codModelo}
        AND Modelos.CodTipo = TiposVehiculos.CodTipo
    `;
    const modelo = viewModeloSchema.parse(result.recordset[0]);
    return { type: "success" as const, data: modelo };
  } catch (error) {
    return handleError(error);
  }
}

export async function addModelo(formData: FormData) {
  try {
    let modelo = {
      CodMarca: Number(formData.get("CodMarca")),
      DescModelo: String(formData.get("DescModelo")),
      NumPuestos: Number(formData.get("NumPuestos")),
      Peso: Number(formData.get("Peso")),
      TipoAcMotor: String(formData.get("TipoAcMotor")),
      TipoAcCaja: String(formData.get("TipoAcCaja")),
      Octan: Number(formData.get("Octan")),
      TipoRefri: String(formData.get("TipoRefri")),
      CodTipo: Number(formData.get("CodTipo")),
    };
    modelo = modeloSchema.parse(modelo);
    await sql.connect(sqlConfig);
    await sql.query`
            INSERT INTO Modelos (CodMarca, DescModelo, NumPuestos, Peso, TipoAcMotor, TipoAcCaja, Octan, TipoRefri, CodTipo)
            VALUES (${modelo.CodMarca}, ${modelo.DescModelo}, ${modelo.NumPuestos}, ${modelo.Peso}, ${modelo.TipoAcMotor}, ${modelo.TipoAcCaja}, ${modelo.Octan}, ${modelo.TipoRefri}, ${modelo.CodTipo})
        `;
    return { type: "success" as const, message: "Modelo creado con éxito" };
  } catch (error) {
    return handleError(error);
  }
}

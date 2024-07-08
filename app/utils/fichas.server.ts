import { handleError } from "./common.server";
import sql from "mssql";
import { sqlConfig } from "./connectDb.server";
import { actividadesRealizadasSchema, fichaTableSchema } from "./schemas";

export async function getFichas(RIFSuc: string) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
        SELECT fs.CodFicha, fs.CodVehiculo, v.CIPropietario, fs.Autorizado, fs.TiempoEnt, fs.TiempoSalEst, fs.TiempoSalReal
        FROM FichasServicios fs, Vehiculos v
        WHERE fs.CodVehiculo = v.CodVehiculo AND fs.RIFSucursal = ${RIFSuc}
    `;
    const fichas = await Promise.all(
      result.recordset.map(async (ficha) => fichaTableSchema.parseAsync(ficha))
    );
    return { type: "success" as const, data: fichas };
  } catch (error) {
    return handleError(error);
  }
}

export async function addFicha(formData: FormData, RIFSuc: string) {
  try {
    const ficha = {
      CodVehiculo: String(formData.get("CodVehiculo")),
      Autorizado: formData.get("Autorizado"),
      TiempoEnt: String(formData.get("TiempoEnt")).split("T").join(" "),
      TiempoSalEst: String(formData.get("TiempoSalEst")).split("T").join(" "),
    };
    await sql.connect(sqlConfig);
    if (ficha.Autorizado) {
      await sql.query`
          INSERT INTO FichasServicios (CodVehiculo, Autorizado, TiempoEnt, TiempoSalEst, RIFSucursal)
          VALUES (${ficha.CodVehiculo}, ${String(ficha.Autorizado)}, ${
        ficha.TiempoEnt
      }, ${ficha.TiempoSalEst}, ${RIFSuc})
        `;
    } else {
      await sql.query`
          INSERT INTO FichasServicios (CodVehiculo, TiempoEnt, TiempoSalEst, RIFSucursal)
          VALUES (${ficha.CodVehiculo}, ${ficha.TiempoEnt}, ${ficha.TiempoSalEst}, ${RIFSuc})`;
    }
    return {
      type: "success" as const,
      message: "Ficha agregada correctamente",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function tieneFactura(CodFicha: number) {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`
        SELECT CodFServ
        FROM FacturasServicio
        WHERE CodFicha = ${CodFicha}
    `;
    return { type: "success" as const, data: result.recordset.length > 0 };
  } catch (error) {
    return handleError(error);
  }
}

export async function iniciarRegistroFicha(
  CodFicha: number,
  TiempoSalReal: string
) {
  try {
    await sql.connect(sqlConfig);
    await sql.query`
        UPDATE FichasServicios
        SET TiempoSalReal = ${TiempoSalReal}
        WHERE CodFicha = ${CodFicha}
    `;
    await sql.query`
        INSERT INTO FacturasServicio (FechaFServ, MontoFServ, CodFicha)
        VALUES (${TiempoSalReal}, 0, ${CodFicha})
    `;
    return {
      type: "success" as const,
      message: "Ficha actualizada correctamente",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getDatosFicha(CodFicha: number) {
  try {
    await sql.connect(sqlConfig);
    // Datos básicos
    const datos = await sql.query`
        SELECT fs.CodFicha, fs.CodVehiculo, v.CIPropietario, fs.Autorizado, fs.TiempoEnt, fs.TiempoSalEst, fs.TiempoSalReal
        FROM FichasServicios fs, Vehiculos v
        WHERE fs.CodVehiculo = v.CodVehiculo
        AND fs.CodFicha = ${CodFicha}
    `;
    if (datos.recordset.length === 0) {
      return { type: "error" as const, message: "Ficha no encontrada" };
    }
    const ficha = fichaTableSchema.parse(datos.recordset[0]);

    // Actividades realizadas
    const result = await sql.query`
        SELECT ar.CodServicio, ar.CodAct, a.DescActividad, ar.NumRealizada, ar.PrecioHora, ar.Tiempo, arc.CodInsumo, i.NombreIns, arc.CIEmpleado, arc.Cantidad, arc.Precio
        FROM ActividadesRealizadas ar
        LEFT JOIN ActividadesRealizadasConsumen arc
          ON ar.CodFicha = arc.CodFicha
          AND ar.CodServicio = arc.CodServicio
          AND ar.CodAct = arc.CodAct
          AND ar.NumRealizada = arc.NumRealizada
        LEFT JOIN Insumos i
          ON arc.CodInsumo = i.CodIns
        LEFT JOIN Actividades a
          ON ar.CodAct = a.CodActividad
        WHERE ar.CodFicha = ${CodFicha}
    `;
    const actividadesRealizadas = await Promise.all(
      result.recordset.map((ar) => actividadesRealizadasSchema.parseAsync(ar))
    );
    const actividades = actividadesRealizadas.reduce(
      (acc, ar) => {
        const idx = acc.findIndex((a) => a.NumRealizada === ar.NumRealizada);
        if (idx === -1) {
          acc.push({
            CodServicio: ar.CodServicio,
            CodAct: ar.CodAct,
            DescAct: ar.DescActividad,
            NumRealizada: ar.NumRealizada,
            PrecioHora: ar.PrecioHora,
            Tiempo: ar.Tiempo,
            RecursosUsados: [
              {
                CodInsumo: ar.CodInsumo,
                NombreIns: ar.NombreIns,
                CIEmpleado: ar.CIEmpleado,
                Cantidad: ar.Cantidad,
                Precio: ar.Precio,
              },
            ],
          });
        } else {
          acc[idx].RecursosUsados.push({
            CodInsumo: ar.CodInsumo,
            NombreIns: ar.NombreIns,
            CIEmpleado: ar.CIEmpleado,
            Cantidad: ar.Cantidad,
            Precio: ar.Precio,
          });
        }
        return acc;
      },
      Array<{
        CodServicio: number;
        CodAct: number;
        DescAct: string;
        NumRealizada: number;
        PrecioHora: number;
        Tiempo: number;
        RecursosUsados: Array<{
          CodInsumo: number | null;
          NombreIns: string | null;
          CIEmpleado: string | null;
          Cantidad: number | null;
          Precio: number | null;
        }>;
      }>()
    );

    return {
      type: "success" as const,
      data: {
        ...ficha,
        actividadesRealizadas: actividades,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function hacerActividad(CodFicha: number, formData: FormData) {
  try {
    const actividadRealizada = {
      CodServicio: String(formData.get("CodServicio")),
      CodAct: String(formData.get("CodActividad")),
      PrecioHora: String(formData.get("PrecioHora")),
      Tiempo: String(formData.get("Tiempo")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
        INSERT INTO ActividadesRealizadas (CodFicha, CodServicio, CodAct, PrecioHora, Tiempo)
        VALUES (${CodFicha}, ${actividadRealizada.CodServicio}, ${actividadRealizada.CodAct}, ${actividadRealizada.PrecioHora}, ${actividadRealizada.Tiempo})
    `;
    return {
      type: "success" as const,
      message: "Actividad realizada correctamente",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function consumirInsumo(CodFicha: number, formData: FormData) {
  try {
    const insumoConsumido = {
      CodServicio: String(formData.get("CodServicio")),
      CodAct: String(formData.get("CodAct")),
      NumRealizada: String(formData.get("NumRealizada")),
      CodInsumo: String(formData.get("CodInsumo")),
      CIEmpleado: String(formData.get("CIEmpleado")),
      Cantidad: String(formData.get("Cantidad")),
      Precio: String(formData.get("Precio")),
    };
    await sql.connect(sqlConfig);
    await sql.query`
        INSERT INTO ActividadesRealizadasConsumen (CodFicha, CodServicio, CodAct, NumRealizada, CodInsumo, CIEmpleado, Cantidad, Precio)
        VALUES (${CodFicha}, ${insumoConsumido.CodServicio}, ${insumoConsumido.CodAct}, ${insumoConsumido.NumRealizada}, ${insumoConsumido.CodInsumo}, ${insumoConsumido.CIEmpleado}, ${insumoConsumido.Cantidad}, ${insumoConsumido.Precio})
    `;
    return {
      type: "success" as const,
      message: "Insumo consumido correctamente",
    };
  } catch (error) {
    return handleError(error);
  }
}

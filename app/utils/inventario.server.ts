import {json} from "@remix-run/react";
import sql from "mssql";
import {sqlConfig} from "./connectDb.server"
import {lineaSchema, insumoSchema, InventariosFisicosSchema} from "./schemas";
import {handleError} from "./common.server";

export async function getInventariosFisicos() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query`SELECT * FROM InventariosFisicos`;
        const parsedResults = await Promise.all(
            result.recordset.map(
                async (inventario) => await InventariosFisicosSchema.parseAsync(inventario)
            )
        );
        return {
            type: "success" as const,
            data: parsedResults,
        };
    } catch (error) {
        return handleError(error);
    }

}

export async function addInventarioFisico(formData: FormData){
    try {
        let inventario = {
            Fecha: new Date(formData.get("Fecha") as string),
            CodIns: Number(formData.get("CodIns")),
            Cantidad: Number(formData.get("Cantidad")),
        };
        inventario = InventariosFisicosSchema.parse(inventario);
        await sql.connect(sqlConfig);
        await sql.query`
            INSERT INTO InventariosFisicos (Fecha, CodIns, Cantidad)
            VALUES (${inventario.Fecha}, ${inventario.CodIns}, ${inventario.Cantidad})
        `;
        return {
            type: "success" as const,
            message: "Inventario físico agregado correctamente",
        };
    } catch (error){
        return handleError(error);
    }
}

export async function getInsumos() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query`SELECT * FROM Insumos`;
        const parsedResults = await Promise.all(
            result.recordset.map(
                async (insumo) => await insumoSchema.parseAsync(insumo)
            )
        );

        return{
            type: "success" as const,
            data: parsedResults,
        };

    } catch (error){
        return handleError(error)
    }

}

export async function getLineas() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query`SELECT * FROM LineasSuministro`;
        const parsedResults = await Promise.all(
            result.recordset.map(
                async (linea) => await lineaSchema.parseAsync(linea)
            )
        );
        return {
            type: "success" as const,
            data: parsedResults,
        }
    } catch(error) {
        return handleError(error);
    }
}
export async function addLinea(formData: FormData){
    try {
        let linea = {
            
            NombreLinea: String(formData.get("NombreLinea")),
        };
        linea = lineaSchema.parse(linea);
        await sql.connect(sqlConfig);
        await sql.query`
            INSERT INTO LineasSuministro (NombreLinea)
            VALUES (${linea.NombreLinea})
        `;
        return {
            type: "success" as const,
            message: "Linea agregada correctamente",
        };
    } catch (error){
        return handleError(error);
    }
}

export async function addInsumo(formData: FormData){
    try {
        let insumo = {
           
            NombreIns: String(formData.get("NombreIns")),
            DescripcionIns: String(formData.get("DescripcionIns")),
            FabricanteIns: String(formData.get("FabricanteIns")),
            EsEco: Number(formData.get("EsEco")),
            PrecioIns: Number(formData.get("PrecioIns")),
            ExistIns: Number(formData.get("ExistIns")),
            MinIns: Number(formData.get("MinIns")),
            MaxIns: Number(formData.get("MaxIns")),
            UMedida: String(formData.get("Umedida")),
            CodLinea: Number(formData.get("CodLinea")),
        };
        insumo = insumoSchema.parse(insumo);
        await sql.connect(sqlConfig);
        await sql.query `
            INSERT INTO Insumos (NombreIns, DescripcionIns, FabricanteIns, EsEco, PrecioIns, ExistIns, MinIns, MaxIns, Umedida, CodLinea)
            VALUES (${insumo.NombreIns}, ${insumo.DescripcionIns}, ${insumo.FabricanteIns}, ${insumo.EsEco}, ${insumo.PrecioIns}, ${insumo.ExistIns}, ${insumo.MinIns}, ${insumo.MaxIns}, ${insumo.UMedida}, ${insumo.CodLinea})
        `;
        return{
            type: "success" as const,
            message: "Insumo agregado correctamente",
        };

    } catch (error){
        return handleError(error);
    }
}

export async function editInsumo(formData: FormData){
    try {
        let insumo = {
            CodIns: Number(formData.get("CodIns")),
            NombreIns: String(formData.get("NombreIns")),
            DescripcionIns: String(formData.get("DescripcionIns")),
            FabricanteIns: String(formData.get("FabricanteIns")),
            EsEco: Number(formData.get("EsEco")),
            PrecioIns: Number(formData.get("PrecioIns")),
            ExistIns: Number(formData.get("ExistIns")),
            MinIns: Number(formData.get("MinIns")),
            MaxIns: Number(formData.get("MaxIns")),
            UMedida: String(formData.get("UMedida")),
            CodLinea: Number(formData.get("CodLinea")),
        };
        insumo = insumoSchema.parse(insumo);
        await sql.connect(sqlConfig);
        await sql.query`
            UPDATE Insumos
            SET NombreIns = ${insumo.NombreIns}, DescripcionIns = ${insumo.DescripcionIns}, FabricanteIns = ${insumo.FabricanteIns}, EsEco = ${insumo.EsEco}, PrecioIns = ${insumo.PrecioIns}, ExistIns = ${insumo.ExistIns}, MinIns = ${insumo.ExistIns}, MaxIns = ${insumo.MaxIns}, UMedida = ${insumo.UMedida}, CodLinea = ${insumo.CodLinea}
            WHERE CodIns = ${insumo.CodIns}
        `;
        return {
            type: "success" as const,
            message: "Insumo editado correctamente"
        }

    } catch (error) {
        return json(handleError(error));
    }
}

export async function editLinea(formData: FormData){
    try {
        let linea = {
            CodLinea: Number(formData.get("CodLinea")),
            NombreLinea: String(formData.get("NombreLinea")),
        };
        linea = lineaSchema.parse(linea);
        await sql.connect(sqlConfig);
        await sql.query`
            UPDATE LineasSuministro
            SET NombreLinea = ${linea.NombreLinea}
            WHERE CodLinea = ${linea.CodLinea}
        `;
        return {
            type: "success" as const,
            message: "Linea editada correctamente",
        }
    } catch (error) {
        return handleError(error);
    }
}

export async function deleteInsumo(formData: FormData){
    try {
        let insumo = {
            CodIns: Number(formData.get("CodIns")),
        };
        await sql.connect(sqlConfig);
        await sql.query`
            DELETE FROM Insumos
            WHERE CodIns = ${insumo.CodIns}
        `;
        return {
            type: "success" as const,
            message: "Insumo eliminado correctamente",
        }
    } catch (error) {
        return handleError(error);
    }
}

export async function deleteLinea(formData: FormData){
    try {
        let linea = {
            CodLinea: Number(formData.get("CodLinea")),
        };
        await sql.connect(sqlConfig);
        await sql.query`
            DELETE FROM LineasSuministro
            WHERE CodLinea = ${linea.CodLinea}
        `;
        return {
            type: "success" as const,
            message: "Linea eliminada correctamente",
        }
    } catch (error) {
        return handleError(error);
    }
}
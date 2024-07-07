
import { z } from "zod";

export type DBResponseType =
  | {
      type: "success";
      data: unknown | undefined;
      message: string | undefined;
    }
  | {
      type: "error";
      code: string | null;
      message: string;
    };

export const insumoSchema = z.object({
  CodIns: z.number().int().min(1).optional(),
  NombreIns: z.string().min(1).max(15),
  DescripcionIns: z.string().min(1).max(30),
  FabricanteIns: z.string().min(1).max(30),
  EsEco: z.union([z.boolean(), z.number().transform((num) => num !== 0)]), // Transforma números a booleanos, donde 0 es false y cualquier otro número es true
  PrecioIns: z.number().gt(0),
  ExistIns: z.number().int().min(0),
  MinIns: z.number().int().min(0),
  MaxIns: z.number().int().min(0),
  UMedida: z.string().min(1).max(10),
  CodLinea: z.number().int().min(1),

});

export const lineaSchema = z.object({
  CodLinea: z.number().int().min(1).optional(),
  NombreLinea: z.string().min(1).max(30),
});

export const InventariosFisicosSchema = z.object({
  Id: z.number().int().min(1).optional(),
  Fecha: z.date(),
  CodIns: z.number().int().min(1),
  Cantidad: z.number().int().min(0),
});

export const clienteSchema = z.object({
  CICliente: z.string().min(1).max(10),
  NombreCliente: z.string().min(1).max(30),
  Tlf1: z.string().min(1).max(15),
  Tlf2: z.string().min(1).max(15),
  EmailCliente: z.string().email().max(50),
});

export const tipoVehiculoSchema = z.object({
  CodTipo: z.number().int().min(1),
  NombreTipo: z.string().min(1).max(20),
});

export const marcaConModelosSchema = z.object({
  CodMarca: z.number().int().min(1),
  NombreMarca: z.string().min(1).max(20),
  CodModelo: z.number().int().min(1).nullable(),
  DescModelo: z.string().min(1).max(20).nullable(),
});

export const marcaSoloConModelos = z.object({
  CodMarca: z.number().int().min(1),
  NombreMarca: z.string().min(1).max(20),
  CodModelo: z.number().int().min(1),
  DescModelo: z.string().min(1).max(20),
});

export const modeloSchema = z.object({
  CodMarca: z.number().int().min(1),
  CodModelo: z.number().int().min(1).optional(),
  DescModelo: z.string().min(1).max(20),
  NumPuestos: z.number().int().min(1),
  Peso: z.number().int().min(1),
  TipoAcMotor: z.string().min(1).max(12),
  TipoAcCaja: z.string().min(1).max(12),
  Octan: z.number().int().min(87).max(91),
  TipoRefri: z.string().min(1).max(12),
  CodTipo: z.number().int().min(1),
});

export const viewModeloSchema = z.object({
  DescModelo: z.string().min(1).max(20),
  NumPuestos: z.number().int().min(1),
  Peso: z.number().int().min(1),
  TipoAcMotor: z.string().min(1).max(12),
  TipoAcCaja: z.string().min(1).max(12),
  Octan: z.number().int().min(87).max(91),
  TipoRefri: z.string().min(1).max(12),
  NombreTipo: z.string().min(1).max(20),
});

export const vehiculoSchema = z.object({
  PlacaVehic: z.string().min(1).max(8),
  FechaAdq: z.date(),
  TipoAceite: z.string().min(1).max(15),
  CodMarca: z.number().int().min(1),
  CodModelo: z.number().int().min(1),
  CIPropietario: z.string().min(1).max(10),
});

export const vehiculoConForaneosSchema = vehiculoSchema.extend({
  CodVehiculo: z.number().int().min(1),
  NombreMarca: z.string().min(1).max(20),
  DescModelo: z.string().min(1).max(20),
  NombreCliente: z.string().min(1).max(30),
});

export const empleadoSchema = z.object({
  CIEmpleado: z.string().min(1).max(10),
  NombreEmp: z.string().min(1).max(30),
  DireccionEmp: z.string().min(1).max(30),
  TlfEmp: z.string().min(1).max(12),
  SalarioEmp: z.number().gt(0),
  RIFSuc: z.string().min(1).max(12),
})

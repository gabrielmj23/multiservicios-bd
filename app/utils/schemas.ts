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

export const clienteSchema = z.object({
  CICliente: z.string().min(1).max(10),
  NombreCliente: z.string().min(1).max(30),
  Tlf1: z.string().min(1).max(15),
  Tlf2: z.string().min(1).max(15),
  EmailCliente: z.string().email().max(50),
});

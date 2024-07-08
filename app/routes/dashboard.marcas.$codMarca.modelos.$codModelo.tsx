import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getModelo } from "~/utils/modelos.server";
import { PiSeatbeltBold, PiEngineBold, PiSnowflakeBold } from "react-icons/pi";
import { FaWeightScale } from "react-icons/fa6";
import { TbGasStation } from "react-icons/tb";
import { GiGearStick } from "react-icons/gi";
import { MdOutlineClass } from "react-icons/md";

export async function loader({ params }: LoaderFunctionArgs) {
  const codMarca = Number(params.codMarca);
  const codModelo = Number(params.codModelo);
  return await getModelo(codMarca, codModelo);
}

export default function DashboardModelo() {
  const modelo = useLoaderData<typeof loader>();
  if (modelo.type === "error") {
    return (
      <div className="p-6">
        <h1>Ver modelo</h1>
        <p>{modelo.message}</p>
      </div>
    );
  }
  return (
    <div className="p-6">
      <h1>Modelo: {modelo.data.DescModelo}</h1>
      <div className="flex flex-col gap-3 ps-3">
        <span className="flex items-center gap-2">
          <PiSeatbeltBold size={24} /> <b>Número de puestos:</b>{" "}
          {modelo.data.NumPuestos}
        </span>
        <span className="flex items-center gap-2">
          <FaWeightScale size={24} /> <b>Peso:</b> {modelo.data.Peso}
        </span>
        <span className="flex items-center gap-2">
          <PiEngineBold size={24} /> <b>Tipo de aceite de motor:</b>{" "}
          {modelo.data.TipoAcMotor}
        </span>
        <span className="flex items-center gap-2">
          <GiGearStick size={24} /> <b>Tipo de aceite de caja:</b>{" "}
          {modelo.data.TipoAcCaja}
        </span>
        <span className="flex items-center gap-2">
          <TbGasStation size={24} /> <b>Octanaje:</b> {modelo.data.Octan}
        </span>
        <span className="flex items-center gap-2">
          <PiSnowflakeBold size={24} /> <b>Tipo de refrigerante:</b>{" "}
          {modelo.data.TipoRefri}
        </span>
        <span className="flex items-center gap-2">
          <MdOutlineClass size={24} /> <b>Tipo de vehículo:</b>{" "}
          {modelo.data.NombreTipo}
        </span>
      </div>
    </div>
  );
}

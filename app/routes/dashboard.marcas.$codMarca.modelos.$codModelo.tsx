import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData, useParams } from "@remix-run/react";
import { editModelo, eliminarModelo, getModelo } from "~/utils/modelos.server";
import { PiSeatbeltBold, PiEngineBold, PiSnowflakeBold } from "react-icons/pi";
import { FaWeightScale } from "react-icons/fa6";
import { TbGasStation } from "react-icons/tb";
import { GiGearStick } from "react-icons/gi";
import { MdOutlineClass } from "react-icons/md";
import { Button, Label, Modal, TextInput } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export async function loader({ params }: LoaderFunctionArgs) {
  const codMarca = Number(params.codMarca);
  const codModelo = Number(params.codModelo);
  return await getModelo(codMarca, codModelo);
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("_action");
  if (action === "edit") return await editModelo(formData);
  if (action === "delete") return await eliminarModelo(formData);
}

export default function DashboardModelo() {
  const modelo = useLoaderData<typeof loader>();
  const params = useParams();
  const [isEdit, setIsEdit] = useState(false);
  const [isEliminar, setIsEliminar] = useState(false);
  const fetcher = useFetcher<typeof action>();

  if (modelo.type === "error") {
    return (
      <div className="p-6">
        <h1>Ver modelo</h1>
        <p>{modelo.message}</p>
      </div>
    );
  }

  if (fetcher.data?.type === "error") {
    toast.error(fetcher.data.message, {
      id: "error-toast",
    });
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
      <div className="grid grid-cols-2 pt-3 gap-6">
        <Button type="button" onClick={() => setIsEdit(true)}>
          Editar
        </Button>
        <Button
          type="button"
          color="failure"
          onClick={() => setIsEliminar(true)}
        >
          Eliminar
        </Button>
      </div>
      <Modal show={isEdit} onClose={() => setIsEdit(false)}>
        <Modal.Header>Editar modelo</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsEdit(false)}>
            <fieldset>
              <Label htmlFor="DescModelo">Descripción</Label>
              <TextInput
                id="DescModelo"
                name="DescModelo"
                defaultValue={modelo.data.DescModelo}
              ></TextInput>
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-8">
              <div>
                <Label htmlFor="NumPuestos">Número de puestos</Label>
                <TextInput
                  id="NumPuestos"
                  name="NumPuestos"
                  type="number"
                  defaultValue={modelo.data.NumPuestos}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="Peso">Peso</Label>
                <TextInput
                  id="Peso"
                  name="Peso"
                  type="number"
                  min="1"
                  defaultValue={modelo.data.Peso}
                />
              </div>
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-8">
              <div>
                <Label htmlFor="TipoAcMotor">Tipo de aceite de motor</Label>
                <TextInput
                  id="TipoAcMotor"
                  name="TipoAcMotor"
                  defaultValue={modelo.data.TipoAcMotor}
                />
              </div>
              <div>
                <Label htmlFor="TipoAcCaja">Tipo de aceite de caja</Label>
                <TextInput
                  id="TipoAcCaja"
                  name="TipoAcCaja"
                  defaultValue={modelo.data.TipoAcCaja}
                />
              </div>
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-8">
              <div>
                <Label htmlFor="Octan">Octanaje</Label>
                <TextInput
                  id="Octan"
                  name="Octan"
                  type="number"
                  min="87"
                  max="91"
                  defaultValue={modelo.data.Octan}
                />
              </div>
              <div>
                <Label htmlFor="TipoRefri">Tipo de refrigerante</Label>
                <TextInput
                  id="TipoRefri"
                  name="TipoRefri"
                  defaultValue={modelo.data.TipoRefri}
                />
              </div>
            </fieldset>
            <input type="hidden" name="CodMarca" value={params.codMarca} />
            <input type="hidden" name="CodModelo" value={params.codModelo} />
            <Button type="submit" name="_action" value="edit">
              Editar
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal
        show={isEliminar}
        size="md"
        onClose={() => setIsEliminar(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              ¿Desea eliminar el modelo de vehículo {modelo.data.DescModelo}?
            </h3>
            <div className="flex justify-center gap-4">
              <fetcher.Form method="post" onSubmit={() => setIsEliminar(false)}>
                <input type="hidden" name="CodMarca" value={params.codMarca} />
                <input
                  type="hidden"
                  name="CodModelo"
                  value={params.codModelo}
                />
                <Button
                  color="failure"
                  type="submit"
                  name="_action"
                  value="delete"
                >
                  Si, Confirmar
                </Button>
              </fetcher.Form>

              <Button color="gray" onClick={() => setIsEliminar(false)}>
                No, Cancelar
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

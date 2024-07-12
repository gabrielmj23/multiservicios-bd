import { ActionFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  Accordion,
  Button,
  Label,
  Modal,
  Select,
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import {
  addMarca,
  editMarca,
  eliminarMarca,
  getMarcasConModelos,
} from "~/utils/marcas.server";
import { addModelo } from "~/utils/modelos.server";
import { getTipos } from "~/utils/tipos.server";

export async function loader() {
  return {
    marcas: await getMarcasConModelos(),
    tiposVehiculos: await getTipos(),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (String(formData.get("_action"))) {
    case "nuevaMarca":
      return await addMarca(formData);
    case "editMarca":
      return await editMarca(formData);
    case "eliminarMarca":
      return await eliminarMarca(formData);
    case "nuevoModelo":
      return await addModelo(formData);
  }
}

export default function DashboardMarcas() {
  const { marcas, tiposVehiculos } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingModelo, setIsCreatingModelo] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [marcaEdit, setMarcaEdit] = useState<{
    CodMarca: number;
    NombreMarca: string;
    Modelos: Array<{ CodModelo: number | null; DescModelo: string | null }>;
  } | null>(null);
  const [isEliminar, setIsEliminar] = useState(false);
  const [codMarcaModelo, setCodMarcaModelo] = useState(0);

  if (marcas.type === "error" || tiposVehiculos.type === "error") {
    return (
      <div className="p-6">
        <h1>Marcas de vehículos</h1>
        <p>{marcas.type === "error" ? marcas.message : null}</p>
        <p>{tiposVehiculos.type === "error" ? tiposVehiculos.message : null}</p>
      </div>
    );
  }

  if (fetcher.data?.type === "error") {
    toast.error(fetcher.data.message, {
      id: "error-toast",
    });
  }

  return (
    <div className="p-6 w-1/2">
      <h1>Marcas de vehículos</h1>
      {marcas.data.length === 0 ? (
        <>
          <p>No hay marcas todavía</p>
          <Button
            className="mt-2"
            type="button"
            onClick={() => setIsCreating(true)}
          >
            Agrega la primera marca
          </Button>
        </>
      ) : (
        <>
          <Button
            className="my-2"
            type="button"
            onClick={() => setIsCreating(true)}
          >
            Nueva marca
          </Button>
          <Accordion>
            {marcas.data.map((marca) => (
              <Accordion.Panel key={marca.CodMarca}>
                <Accordion.Title>{marca.NombreMarca}</Accordion.Title>
                <Accordion.Content className="bg-gray-50">
                  <ul>
                    {marca.Modelos.map((modelo, index) =>
                      modelo.CodModelo === null ? (
                        <li key={marca.CodMarca + "-" + index}>Sin modelos</li>
                      ) : (
                        <li
                          key={marca.CodMarca + "-" + index}
                          className="list-disc"
                        >
                          <Link
                            to={`${marca.CodMarca}/modelos/${modelo.CodModelo}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {modelo.DescModelo}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsCreatingModelo(true);
                        setCodMarcaModelo(marca.CodMarca);
                      }}
                    >
                      Nuevo modelo
                    </Button>
                    <Button
                      type="button"
                      color="warning"
                      onClick={() => {
                        setMarcaEdit(marca);
                        setIsEdit(true);
                      }}
                    >
                      Editar marca
                    </Button>
                    <Button
                      type="button"
                      color="failure"
                      onClick={() => {
                        setMarcaEdit(marca);
                        setIsEliminar(true);
                      }}
                    >
                      Eliminar marca
                    </Button>
                  </div>
                </Accordion.Content>
              </Accordion.Panel>
            ))}
          </Accordion>
        </>
      )}
      <Modal show={isCreating} onClose={() => setIsCreating(false)}>
        <Modal.Header>Nueva marca</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsCreating(false)}>
            <fieldset>
              <Label htmlFor="NombreMarca">Nombre de la marca</Label>
              <TextInput
                id="NombreMarca"
                name="NombreMarca"
                type="text"
              ></TextInput>
            </fieldset>
            <Button type="submit" name="_action" value="nuevaMarca">
              Crear
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal show={isEdit} onClose={() => setIsEdit(false)}>
        <Modal.Header>Editar marca</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsEdit(false)}>
            <fieldset>
              <Label htmlFor="NombreMarca">Nombre de la marca</Label>
              <TextInput
                id="NombreMarca"
                name="NombreMarca"
                type="text"
                defaultValue={marcaEdit?.NombreMarca}
              ></TextInput>
            </fieldset>
            <input type="hidden" name="CodMarca" value={marcaEdit?.CodMarca} />
            <Button type="submit" name="_action" value="editMarca">
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
              ¿Desea eliminar la marca {marcaEdit?.NombreMarca}?
            </h3>
            <div className="flex justify-center gap-4">
              <fetcher.Form method="post" onSubmit={() => setIsEliminar(false)}>
                <input
                  type="hidden"
                  name="CodMarca"
                  value={marcaEdit?.CodMarca}
                />
                <Button
                  color="success"
                  type="submit"
                  name="_action"
                  value="eliminarMarca"
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
      <Modal show={isCreatingModelo} onClose={() => setIsCreatingModelo(false)}>
        <Modal.Header>Nuevo modelo</Modal.Header>
        <Modal.Body>
          <fetcher.Form
            method="post"
            onSubmit={() => setIsCreatingModelo(false)}
          >
            <fieldset>
              <Label htmlFor="DescModelo">Descripción</Label>
              <TextInput
                id="DescModelo"
                name="DescModelo"
                type="text"
              ></TextInput>
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-8">
              <div>
                <Label htmlFor="NumPuestos">Número de puestos</Label>
                <TextInput
                  id="NumPuestos"
                  name="NumPuestos"
                  type="number"
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="Peso">Peso</Label>
                <TextInput id="Peso" name="Peso" type="number" min="1" />
              </div>
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-8">
              <div>
                <Label htmlFor="TipoAcMotor">Tipo de aceite de motor</Label>
                <TextInput id="TipoAcMotor" name="TipoAcMotor" type="text" />
              </div>
              <div>
                <Label htmlFor="TipoAcCaja">Tipo de aceite de caja</Label>
                <TextInput id="TipoAcCaja" name="TipoAcCaja" type="text" />
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
                />
              </div>
              <div>
                <Label htmlFor="TipoRefri">Tipo de refrigerante</Label>
                <TextInput id="TipoRefri" name="TipoRefri" type="text" />
              </div>
            </fieldset>
            <fieldset>
              <Label htmlFor="CodTipo">Tipo de vehículo</Label>
              <Select id="CodTipo" name="CodTipo">
                {tiposVehiculos.data.map((tipo) => (
                  <option key={tipo.CodTipo} value={tipo.CodTipo}>
                    {tipo.NombreTipo}
                  </option>
                ))}
              </Select>
            </fieldset>
            <input type="hidden" name="CodMarca" value={codMarcaModelo} />
            <Button type="submit" name="_action" value="nuevoModelo">
              Crear
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

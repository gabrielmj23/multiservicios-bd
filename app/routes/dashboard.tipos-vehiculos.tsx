import { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { addTipo, deleteTipo, editTipo, getTipos } from "~/utils/tipos.server";

export async function loader() {
  return await getTipos();
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("_action");
  if (action === "new") return await addTipo(formData);
  if (action === "edit") return await editTipo(formData);
  if (action === "delete") return await deleteTipo(formData);
}

export default function DashboardTipos() {
  const tipos = useLoaderData<typeof loader>();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tipoEdit, setTipoEdit] = useState<{
    CodTipo: number;
    NombreTipo: string;
  } | null>(null);
  const [isEliminar, setIsEliminar] = useState(false);
  const [eliminarTipo, setEliminarTipo] = useState<{
    CodTipo: number;
    NombreTipo: string;
  } | null>(null);
  const fetcher = useFetcher<typeof action>();

  if (tipos.type === "error") {
    return <div className="p-6">{tipos.message}</div>;
  }

  if (fetcher.data?.type === "error") {
    toast.error(fetcher.data.message, {
      id: "error-toast",
    });
  }

  return (
    <div className="p-6">
      <h1>Tipos de Vehículos</h1>
      {tipos.data.length === 0 ? (
        <>
          <p>No hay tipos registrados</p>
          <Button
            className="mt-2"
            type="button"
            onClick={() => setIsCreating(true)}
          >
            Crea el primero
          </Button>
        </>
      ) : (
        <>
          <Button
            className="my-2"
            type="button"
            onClick={() => setIsCreating(true)}
          >
            Agregar tipo
          </Button>
          <Table hoverable className="w-96">
            <Table.Head>
              <Table.HeadCell>Tipo</Table.HeadCell>
              <Table.HeadCell>Acción</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {tipos.data.map((tipo) => (
                <Table.Row key={tipo.CodTipo}>
                  <Table.Cell>{tipo.NombreTipo}</Table.Cell>
                  <Table.Cell>
                    <Select>
                      <option disabled selected>
                        Seleccionar...
                      </option>
                      <option
                        onClick={() => {
                          setTipoEdit(tipo);
                          setIsEditing(true);
                        }}
                      >
                        Editar
                      </option>
                      <option
                        onClick={() => {
                          setEliminarTipo(tipo);
                          setIsEliminar(true);
                        }}
                      >
                        Eliminar
                      </option>
                    </Select>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </>
      )}
      <Modal show={isCreating} onClose={() => setIsCreating(false)}>
        <Modal.Header>Nuevo tipo de vehículo</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsCreating(false)}>
            <fieldset>
              <Label htmlFor="NombreTipo">Nombre del tipo</Label>
              <TextInput id="NombreTipo" name="NombreTipo" type="text" />
            </fieldset>
            <Button
              type="submit"
              name="_action"
              value="new"
              disabled={fetcher.state !== "idle"}
            >
              Guardar
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal show={isEditing} onClose={() => setIsEditing(false)}>
        <Modal.Header>Editar tipo de vehículo</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsEditing(false)}>
            <fieldset>
              <Label htmlFor="NombreTipo">Nombre del tipo</Label>
              <TextInput
                id="NombreTipo"
                name="NombreTipo"
                defaultValue={tipoEdit?.NombreTipo}
              />
            </fieldset>
            <input type="hidden" name="CodTipo" value={tipoEdit?.CodTipo} />
            <Button
              type="submit"
              name="_action"
              value="edit"
              disabled={fetcher.state !== "idle"}
            >
              Guardar
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
              ¿Desea eliminar el tipo {eliminarTipo?.NombreTipo}?
            </h3>
            <div className="flex justify-center gap-4">
              <fetcher.Form method="post" onSubmit={() => setIsEliminar(false)}>
                <input
                  type="hidden"
                  name="CodTipo"
                  value={eliminarTipo?.CodTipo}
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

import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { z } from "zod";
import { getSession } from "~/session";
import {
  addEmpleado,
  editarEmpleado,
  getEmpleados,
  hacerEncargado,
  deleteEmpleado,
} from "~/utils/empleados.server";
import { empleadoSchema } from "~/utils/schemas";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session || session.has("error")) {
    return redirect("/");
  }
  const RIFSuc = session.get("RIFSuc");
  if (!RIFSuc) {
    return redirect("/");
  }
  return getEmpleados(RIFSuc);
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = String(formData.get("_action"));
  const session = await getSession(request.headers.get("Cookie"));
  if (!session || session.has("error")) {
    return redirect("/");
  }
  const RIFSuc = session.get("RIFSuc");
  if (!RIFSuc) {
    return redirect("/");
  }
  switch (action) {
    case "nuevoEmp":
      return await addEmpleado(formData, RIFSuc);
    case "hacerEncargado":
      return await hacerEncargado(formData, RIFSuc);
    case "editarEmp":
      return await editarEmpleado(formData);
    case "eliminarEmp":
      return await deleteEmpleado(formData, RIFSuc);
  }
}

export default function DashboardEmpleados() {
  const empleados = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [isCreating, setIsCreating] = useState(false);
  const [eliminarEmpleado, setEliminarEmpleado] = useState<z.infer<
    typeof empleadoSchema
  > | null>(null);
  const [isEliminar, setIsEliminar] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<z.infer<
    typeof empleadoSchema
  > | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  if (empleados.type === "error") {
    return (
      <div className="p-6">
        <h1>Empleados de esta sucursal</h1>
        <p>{empleados.message}</p>
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
      <h1>Empleados de esta sucursal</h1>
      <div className="mb-6">
        <h2 className="mb-2">Encargado:</h2>
        {empleados.data.CIEncargado && empleados.data.FechaInicioEncargado ? (
          <p>
            {
              empleados.data.empleados.find(
                (emp) => emp.CIEmpleado === empleados.data.CIEncargado
              )?.NombreEmp
            }
            , desde:{" "}
            {new Date(empleados.data.FechaInicioEncargado).toLocaleDateString()}
          </p>
        ) : (
          <p>No hay encargado asignado</p>
        )}
      </div>
      <div>
        <h2 className="mb-2">Empleados:</h2>
        <Button
          type="button"
          className="mb-2"
          onClick={() => setIsCreating(true)}
        >
          Registrar empleado
        </Button>
        <Table hoverable className="min-w-fit">
          <Table.Head>
            <Table.HeadCell>Cédula</Table.HeadCell>
            <Table.HeadCell>Nombre</Table.HeadCell>
            <Table.HeadCell>Dirección</Table.HeadCell>
            <Table.HeadCell>Teléfono</Table.HeadCell>
            <Table.HeadCell>Salario</Table.HeadCell>
            <Table.HeadCell>Acciones</Table.HeadCell>
          </Table.Head>
          <Table.Body className="bg-gray-100">
            {empleados.data.empleados.map((emp) => (
              <Table.Row key={emp.CIEmpleado}>
                <Table.Cell>{emp.CIEmpleado}</Table.Cell>
                <Table.Cell>{emp.NombreEmp}</Table.Cell>
                <Table.Cell>{emp.DireccionEmp}</Table.Cell>
                <Table.Cell>{emp.TlfEmp}</Table.Cell>
                <Table.Cell>${emp.SalarioEmp.toLocaleString()}</Table.Cell>
                <Table.Cell>
                  <Select>
                    <option disabled selected>
                      Seleccionar...
                    </option>
                    {empleados.data.CIEncargado === null ? (
                      <option
                        onClick={() => {
                          fetcher.submit(
                            {
                              _action: "hacerEncargado",
                              CIEmpleado: emp.CIEmpleado,
                            },
                            { method: "post" }
                          );
                        }}
                      >
                        Hacer encargado
                      </option>
                    ) : null}
                    <option
                      onClick={() => {
                        setEditingEmpleado(emp);
                        setIsEditing(true);
                      }}
                    >
                      Editar
                    </option>
                    <option
                      onClick={() => {
                        setEliminarEmpleado(emp);
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
      </div>
      <Modal show={isCreating} onClose={() => setIsCreating(false)}>
        <Modal.Header>Registrar empleado</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsCreating(false)}>
            <fieldset>
              <Label htmlFor="CIEmpleado">Cédula</Label>
              <TextInput
                id="CIEmpleado"
                name="CIEmpleado"
                type="text"
                required
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="NombreEmp">Nombre</Label>
              <TextInput id="NombreEmp" name="NombreEmp" type="text" required />
            </fieldset>
            <fieldset>
              <Label htmlFor="DireccionEmp">Dirección</Label>
              <TextInput
                id="DireccionEmp"
                name="DireccionEmp"
                type="text"
                required
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="TlfEmp">Teléfono</Label>
              <TextInput id="TlfEmp" name="TlfEmp" type="text" required />
            </fieldset>
            <fieldset>
              <Label htmlFor="SalarioEmp">Salario</Label>
              <TextInput
                id="SalarioEmp"
                name="SalarioEmp"
                type="number"
                required
                min="0"
              />
            </fieldset>
            <Button
              name="_action"
              value="nuevoEmp"
              type="submit"
              disabled={fetcher.state !== "idle"}
            >
              Registrar
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal show={isEditing} onClose={() => setIsEditing(false)}>
        <Modal.Header>Editar empleado</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsEditing(false)}>
            <fieldset>
              <Label htmlFor="CIEmpleado">Cédula</Label>
              <TextInput
                id="CIEmpleado"
                name="CIEmpleado"
                type="text"
                value={editingEmpleado?.CIEmpleado}
                required
                readOnly
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="NombreEmp">Nombre</Label>
              <TextInput
                id="NombreEmp"
                name="NombreEmp"
                type="text"
                defaultValue={editingEmpleado?.NombreEmp}
                required
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="DireccionEmp">Dirección</Label>
              <TextInput
                id="DireccionEmp"
                name="DireccionEmp"
                type="text"
                defaultValue={editingEmpleado?.DireccionEmp}
                required
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="TlfEmp">Teléfono</Label>
              <TextInput
                id="TlfEmp"
                name="TlfEmp"
                type="text"
                defaultValue={editingEmpleado?.TlfEmp}
                required
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="SalarioEmp">Salario</Label>
              <TextInput
                id="SalarioEmp"
                name="SalarioEmp"
                type="number"
                defaultValue={editingEmpleado?.SalarioEmp}
                required
                min="0"
              />
            </fieldset>
            <Button
              name="_action"
              value="editarEmp"
              type="submit"
              disabled={fetcher.state !== "idle"}
            >
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
              ¿Desea eliminar al empleado {eliminarEmpleado?.NombreEmp} de
              cedula {eliminarEmpleado?.CIEmpleado} de la sucursal?
            </h3>
            <div className="flex justify-center gap-4">
              <fetcher.Form method="post" onSubmit={() => setIsEliminar(false)}>
                <input
                  type="hidden"
                  name="CIEmpleado"
                  value={eliminarEmpleado?.CIEmpleado}
                />
                <input
                  type="hidden"
                  name="NombreEmp"
                  value={eliminarEmpleado?.NombreEmp}
                />
                <Button
                  color="success"
                  type="submit"
                  name="_action"
                  value="eliminarEmp"
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

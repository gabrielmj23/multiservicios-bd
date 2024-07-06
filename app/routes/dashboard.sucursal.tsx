import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { useState } from "react";
import { z } from "zod";
import { getSession } from "~/session";
import {
  addEmpleado,
  editarEmpleado,
  getEmpleados,
  hacerEncargado,
} from "~/utils/empleados.server";
import { empleadoSchema } from "~/utils/schemas";
import { HiOutlineExclamationCircle } from "react-icons/hi";
/*
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
*/

export async function loader() {
  // Datos de ejemplo ajustados a la estructura de la tabla Sucursales
  return {
    data: {      
        RIFSuc: 'J-12345678-9',
        NombreSuc: 'Sucursal Central',
        CiudadSuc: 'Caracas',
        CIEncargado: null,
        FechaInicioEncargado: '2024-05-01',
      empleados: [
        {
          CIEmpleado: '12345678',
          NombreEmp: 'Juan Pérez',
          DireccionEmp: 'Calle Falsa 123',
          TlfEmp: '04141234567',
          SalarioEmp: 500.00,
          RIFSuc: 'J-12345678-9'
        },
        {
          CIEmpleado: '87654321',
          NombreEmp: 'Ana Gómez',
          DireccionEmp: 'Avenida Siempreviva 456',
          TlfEmp: '04241234567',
          SalarioEmp: 600.00,
          RIFSuc: 'J-12345678-9'
        },
        {
          CIEmpleado: '7452321',
          NombreEmp: 'Pepe Gómez',
          DireccionEmp: 'Avenida Siempreviva 456',
          TlfEmp: '04241234567',
          SalarioEmp: 600.00,
          RIFSuc: 'J-12345678-9'
        },
        {
          CIEmpleado: '12654321',
          NombreEmp: 'Anuel Gómez',
          DireccionEmp: 'Avenida Siempreviva 456',
          TlfEmp: '04241234567',
          SalarioEmp: 600.00,
          RIFSuc: 'J-12345678-9'
        },
      ]
    },
    message: "Datos cargados con éxito",
  };
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
  }
}

export default function DashboardEmpleados() {
  const empleados = useLoaderData<typeof loader>();
  const sucursal = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [isCreating, setIsCreating] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<z.infer<
    typeof empleadoSchema
  > | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  // Función para manejar el clic en "Seleccionar", que actualiza el empleado seleccionado y abre el modal
  const handleSeleccionarClick = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setOpenModal(true);
  };

  if (sucursal.data.CIEncargado === null) {
    return (
      <div className="p-6">
        <h1>Mi sucursal: {sucursal.data.NombreSuc}</h1>
        <div className="mb-6">
            <h2 className="mb-6">Ciudad: {sucursal.data.CiudadSuc}</h2>
            <h2 className="mb-2">Encargado:</h2>
            <p>No hay encargado asignado. Seleccione un empleado de la siguiente tabla para que sea el encargado de la sucursal.</p>
            <div className="overflow-x-auto">
                <Table>
                    <Table.Head>
                    <Table.HeadCell>Cedula de identidad</Table.HeadCell>
                    <Table.HeadCell>Nombre</Table.HeadCell>
                    <Table.HeadCell>Teléfono</Table.HeadCell>
                    <Table.HeadCell>
                        <span className="sr-only">Seleccionar</span>
                    </Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                    {empleados.data.empleados.map((empleado) => (
                        <Table.Row key={empleado.CIEmpleado} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {empleado.CIEmpleado}
                        </Table.Cell>
                        <Table.Cell>{empleado.NombreEmp}</Table.Cell>
                        <Table.Cell>{empleado.TlfEmp}</Table.Cell>
                        <Table.Cell>
                            <a href="#" onClick={(e) => {
                            e.preventDefault(); // Previene la navegación
                            handleSeleccionarClick(empleado);
                            }} className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                            Seleccionar
                            </a>
                        </Table.Cell>
                        </Table.Row>
                    ))}
                    </Table.Body>
                </Table>
                {empleadoSeleccionado && (
                    <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
                    <Modal.Header />
                        <Modal.Body>
                            <div className="text-center">
                            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                ¿Quieres convertir a {empleadoSeleccionado.NombreEmp} en el encargado de la sucursal?
                            </h3>
                            <div className="flex justify-center gap-4">
                                <Button color="failure" onClick={() => setOpenModal(false)}>
                                {"Si, Confirmar"}
                                </Button>
                                <Button color="gray" onClick={() => setOpenModal(false)}>
                                No, Cancelar
                                </Button>
                            </div>
                            </div>
                        </Modal.Body>
                    </Modal>
                )}
            </div>
        </div>
        <p>{empleados.message}</p>
      </div>
    );
  }
  return (
    <div className="p-6">
      <h1>Mi sucursal: {empleados.data.CIEncargado}</h1>
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
                    <option>Eliminar</option>
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
          <fetcher.Form method="post">
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
          <fetcher.Form method="post">
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
    </div>
  );
}

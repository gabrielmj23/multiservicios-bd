import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button, Modal, Table } from "flowbite-react";
import { useState } from "react";
import { getSession } from "~/session";
import { getEmpleados } from "~/utils/empleados.server";
import { editarSucursal, getSucursal } from "~/utils/sucursales.server";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import {
  getTiposNoS,
  getTiposSucursal,
  agregarSucursalesAtiendenVehiculos,
  eliminarSucursalesAtiendenVehiculos,
} from "~/utils/tipos.server";
import toast from "react-hot-toast";

type Empleado = {
  RIFSuc: string;
  CIEmpleado: string;
  NombreEmp: string;
  DireccionEmp: string;
  TlfEmp: string;
  SalarioEmp: number;
};

type TipoV = {
  CodTipo: number;
  NombreTipo: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session || session.has("error")) {
    return redirect("/");
  }
  const RIFSuc = session.get("RIFSuc");
  if (!RIFSuc) {
    return redirect("/");
  }
  const [sucursal, empleados, tipos, tiposSucursal] = await Promise.all([
    getSucursal(RIFSuc),
    getEmpleados(RIFSuc),
    getTiposNoS(RIFSuc),
    getTiposSucursal(RIFSuc), // Asumiendo que getTiposSucursal necesita RIFSuc como argumento
  ]);

  return { sucursal, empleados, tipos, tiposSucursal };
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
    case "editarSucursal":
      return await editarSucursal(formData);
    case "eliminarSucursalesAtiendenVehiculos":
      return await eliminarSucursalesAtiendenVehiculos(formData);
    case "agregarSucursalesAtiendenVehiculos":
      return await agregarSucursalesAtiendenVehiculos(formData);
    default:
      // Manejar acciones no reconocidas o mostrar un mensaje de error
      return { type: "error" as const, message: "Acción no reconocida" };
  }
}

export default function DashboardSucursal() {
  const { sucursal, empleados, tipos, tiposSucursal } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [openModal, setOpenModal] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] =
    useState<Empleado | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoV | null>(null);
  const [mostrarTabla, setMostrarTabla] = useState(false);

  // Si se encuentra un error, mostrar el mensaje de error
  if (
    sucursal.type === "error" ||
    empleados.type === "error" ||
    tipos.type === "error" ||
    tiposSucursal.type === "error"
  ) {
    return (
      <div className="p-6">
        <h1>Mi sucursal</h1>
        <p>{sucursal.type === "error" ? sucursal.message : null}</p>
        <p>{empleados.type === "error" ? empleados.message : null}</p>
        <p>{tipos.type === "error" ? tipos.message : null}</p>
        <p>{tiposSucursal.type === "error" ? tiposSucursal.message : null}</p>
      </div>
    );
  }

  const toggleMostrarTabla = () => {
    setMostrarTabla(!mostrarTabla);
  };

  // Función para manejar el clic en "Seleccionar", que actualiza el empleado seleccionado y abre el modal
  const handleSeleccionarClickEmpleado = (empleado: Empleado) => {
    setEmpleadoSeleccionado(empleado);
    setOpenModal(true);
  };

  const handleSeleccionarClickTipo = (tipo: TipoV) => {
    setTipoSeleccionado(tipo);
    setOpenModal(true);
  };

  if (fetcher.data?.type === "error") {
    toast.error(fetcher.data.message, {
      id: "error-toast",
    });
  }

  return (
    <div className="p-6">
      <h1>Mi sucursal: {sucursal.data.NombreSuc}</h1>
      <div className="mb-6">
        <h2 className="mb-6">Ciudad: {sucursal.data.CiudadSuc}</h2>
        <h2 className="mb-2">Encargado:</h2>
        {sucursal.data.CIEncargado ? (
          <p>
            CI: {sucursal.data.CIEncargado} -{" "}
            {
              empleados.data.empleados.find(
                (emp) => emp.CIEmpleado === sucursal.data.CIEncargado
              )?.NombreEmp
            }
          </p>
        ) : (
          <p>
            No hay encargado asignado. Seleccione un empleado para que sea el
            encargado de la sucursal.
          </p>
        )}
        <Button
          onClick={toggleMostrarTabla}
          type="button"
          className="mt-4 mb-2"
        >
          Mostrar/Ocultar Tabla
        </Button>
        {mostrarTabla && (
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
                  <Table.Row
                    key={empleado.CIEmpleado}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {empleado.CIEmpleado}
                    </Table.Cell>
                    <Table.Cell>{empleado.NombreEmp}</Table.Cell>
                    <Table.Cell>{empleado.TlfEmp}</Table.Cell>
                    <Table.Cell>
                      <button
                        onClick={() => handleSeleccionarClickEmpleado(empleado)}
                        className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                      >
                        Seleccionar
                      </button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            {empleadoSeleccionado && (
              <Modal
                show={openModal}
                size="md"
                onClose={() => setOpenModal(false)}
                popup
              >
                <Modal.Header />
                <Modal.Body>
                  <div className="text-center">
                    <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                      ¿Desea convertir a {empleadoSeleccionado.NombreEmp} en el
                      encargado de la sucursal?
                    </h3>
                    <div className="flex justify-center gap-4">
                      <fetcher.Form method="post" onSubmit={() => setOpenModal(false)}>
                        <input
                          type="hidden"
                          name="RIFSuc"
                          value={sucursal.data.RIFSuc}
                        />
                        <input
                          type="hidden"
                          name="CIEncargado"
                          value={empleadoSeleccionado.CIEmpleado}
                        />
                        <Button
                          color="success"
                          type="submit"
                          name="_action"
                          value="editarSucursal"
                        >
                          Si, Confirmar
                        </Button>
                      </fetcher.Form>
                      <Button color="gray" onClick={() => setOpenModal(false)}>
                        No, Cancelar
                      </Button>
                    </div>
                  </div>
                </Modal.Body>
              </Modal>
            )}
          </div>
        )}
      </div>
      {sucursal.data.CIEncargado ? (
        <div>
          <h2 className="mb-2">Tipos de vehículo que atendemos:</h2>
          <div className="flex justify-evenly">
            <div className="overflow-x-auto">
              <h3 className="font-semibold">Atendidos</h3>
              <Table>
                <Table.Head>
                  <Table.HeadCell>Nombre</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {tiposSucursal.data.map((tipo) => (
                    <Table.Row
                      key={tipo.CodTipo}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {tipo.NombreTipo}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
                {tipoSeleccionado && (
                  <Modal
                    show={openModal}
                    size="md"
                    onClose={() => setOpenModal(false)}
                    popup
                  >
                    <Modal.Header />
                    <Modal.Body>
                      <div className="text-center">
                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                          ¿Quieres agregar el tipo de vehiculo{" "}
                          {tipoSeleccionado.NombreTipo} en la sucursal?
                        </h3>
                        <div className="flex justify-center gap-4">
                          <Button
                            color="failure"
                            onClick={() => {
                              fetcher.submit(
                                {
                                  _action:
                                    "eliminarSucursalesAtiendenVehiculos",
                                  RIFSuc: sucursal.data.RIFSuc,
                                  CodTipo: tipoSeleccionado.CodTipo,
                                },
                                { method: "post" }
                              );
                              setOpenModal(false);
                            }}
                          >
                            {"Si, Confirmar"}
                          </Button>
                          <Button
                            color="gray"
                            onClick={() => setOpenModal(false)}
                          >
                            No, Cancelar
                          </Button>
                        </div>
                      </div>
                    </Modal.Body>
                  </Modal>
                )}
              </Table>
            </div>

            <div className="overflow-x-auto">
              <h3 className="font-semibold">Disponibles</h3>
              <Table>
                <Table.Head>
                  <Table.HeadCell>Nombre</Table.HeadCell>
                  <Table.HeadCell>
                    <span className="sr-only">Agregar</span>
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {tipos.data.map((tipo) => (
                    <Table.Row
                      key={tipo.CodTipo}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {tipo.NombreTipo}
                      </Table.Cell>
                      <Table.Cell>
                        <button
                          onClick={() => handleSeleccionarClickTipo(tipo)}
                          className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                        >
                          Agregar
                        </button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
                {tipoSeleccionado && (
                  <Modal
                    show={openModal}
                    size="md"
                    onClose={() => setOpenModal(false)}
                    popup
                  >
                    <Modal.Header />
                    <Modal.Body>
                      <div className="text-center">
                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                          ¿Desea agregar el tipo de vehiculo{" "}
                          {tipoSeleccionado.NombreTipo} en la sucursal?
                        </h3>
                        <div className="flex justify-center gap-4">
                          <fetcher.Form method="post" onSubmit={() => setOpenModal(false)}>
                            <input
                              type="hidden"
                              name="RIFSuc"
                              value={sucursal.data.RIFSuc}
                            />
                            <input
                              type="hidden"
                              name="CodTipo"
                              value={tipoSeleccionado.CodTipo}
                            />
                            <Button
                              color="success"
                              type="submit"
                              name="_action"
                              value="agregarSucursalesAtiendenVehiculos"
                            >
                              Si, Confirmar
                            </Button>
                          </fetcher.Form>

                          <Button
                            color="gray"
                            onClick={() => setOpenModal(false)}
                          >
                            No, Cancelar
                          </Button>
                        </div>
                      </div>
                    </Modal.Body>
                  </Modal>
                )}
              </Table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

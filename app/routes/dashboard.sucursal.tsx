import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button, Label, Modal, Select, Table, TextInput, Checkbox } from "flowbite-react";
import { useState } from "react";
import { set, z } from "zod";
import { getSession } from "~/session";
import {
  addEmpleado,
  editarEmpleado,
  getEmpleados,
  hacerEncargado,
} from "~/utils/empleados.server";
import { editarSucursal, getSucursal } from "~/utils/sucursales.server";
import { empleadoSchema } from "~/utils/schemas";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { getTiposNoS, getTiposSucursal, agregarSucursalesAtiendenVehiculos, eliminarSucursalesAtiendenVehiculos } from "~/utils/tipos.server";

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

  return json({ sucursal, empleados, tipos, tiposSucursal });
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
      return { error: "Acción no reconocida" };
  }
}

export default function DashboardSucursal() {
  const datos = useLoaderData<typeof loader>();

  // Si se encuentra un error, mostrar el mensaje de error
  if (datos.sucursal.type === "error") {
    return <div className="p-6">{datos.sucursal.message}</div>;
  }
  if (datos.empleados.type === "error") {
    return <div className="p-6">{datos.empleados.message}</div>;
  }
  if (datos.tipos.type === "error") {
    return <div className="p-6">{datos.tipos.message}</div>;
  }
  if (datos.tiposSucursal.type === "error") {
    return <div className="p-6">{datos.tiposSucursal.message}</div>;
  }
  
  const sucursal = datos.sucursal;
  const empleados = datos.empleados;
  const tiposNoSucursal = datos.tipos;
  const tiposSucursal = datos.tiposSucursal;


  

  const fetcher = useFetcher();
  const [openModal, setOpenModal] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);  
  const [mostrarTabla, setMostrarTabla] = useState(false);
  const toggleMostrarTabla = () => {
      setMostrarTabla(!mostrarTabla);
  };
  
  // Función para manejar el clic en "Seleccionar", que actualiza el empleado seleccionado y abre el modal
  const handleSeleccionarClickEmpleado = (empleado: any) => {
    setEmpleadoSeleccionado(empleado);
    setOpenModal(true);
  };

  const handleSeleccionarClickTipo = (tipo: any) => {
    setTipoSeleccionado(tipo);
    setOpenModal(true);
  };

  const [isAllSelected, setIsAllSelected] = useState(false);

  const handleSelectAll = (event) => {
    setIsAllSelected(event.target.checked);
  };


  if (sucursal.data.CIEncargado === null) {
    return (
      <div className="p-6">
        <h1>Mi sucursal: {sucursal.data.CIEncargado}</h1>
        <div className="mb-6">
            <h2 className="mb-6">Ciudad: {sucursal.data.CiudadSuc}</h2>
            <h2 className="mb-2">Encargado:</h2>
            <p>No hay encargado asignado. Seleccione un empleado de la siguiente tabla para que sea el encargado de la sucursal.</p>
            <Button onClick={toggleMostrarTabla} type="button" className="mt-4 mb-2">
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
                      {empleados.data.map((empleado) => (
                          <Table.Row key={empleado.CIEmpleado} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                              {empleado.CIEmpleado}
                          </Table.Cell>
                          <Table.Cell>{empleado.NombreEmp}</Table.Cell>
                          <Table.Cell>{empleado.TlfEmp}</Table.Cell>
                          <Table.Cell>
                              <a href="#" onClick={(e) => {
                              e.preventDefault(); // Previene la navegación
                              handleSeleccionarClickEmpleado(empleado);
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
                                  <Button color="failure" onClick={() => 
                                    {fetcher.submit(
                                        {
                                          _action: "editarSucursal",
                                          RIFSuc: sucursal.data.RIFSuc,
                                          CIEmpleado: empleadoSeleccionado.CIEmpleado
                                        },
                                        { method: "post" }
                                      );setOpenModal(false)}}>
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
            )}
        </div>
      </div>
    );
  }
  return (
    <div className="p-6">
      <h1>Mi sucursal: {sucursal.data.NombreSuc}</h1>
      <div className="mb-6">
        <h2 className="mb-6">Ciudad: {sucursal.data.CiudadSuc}</h2>
        <h2 className="mb-2">Encargado:</h2>
        {sucursal.data.CIEncargado && sucursal.data.FechaInicioEncargado ? (
          <p>
            {
              empleados.data.find(
                (emp) => emp.CIEmpleado === sucursal.data.CIEncargado
              )?.NombreEmp
            }
            , desde:{" "}
            {new Date(sucursal.data.FechaInicioEncargado).toLocaleDateString()}
          </p>
        ) : (
          <p>No hay encargado asignado</p>
        )}
      </div>
      <Button onClick={toggleMostrarTabla} type="button" className="mt-4 mb-2">
              Cambiar encargado a
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
                {empleados.data.map((empleado) => (
                    <Table.Row key={empleado.CIEmpleado} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {empleado.CIEmpleado}
                    </Table.Cell>
                    <Table.Cell>{empleado.NombreEmp}</Table.Cell>
                    <Table.Cell>{empleado.TlfEmp}</Table.Cell>
                    <Table.Cell>
                        <a href="#" onClick={(e) => {
                        e.preventDefault(); // Previene la navegación
                        handleSeleccionarClickEmpleado(empleado);
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
                            <Button color="failure" onClick={() => 
                              {fetcher.submit(
                                  {
                                    _action: "editarSucursal",
                                    RIFSuc: sucursal.data.RIFSuc,
                                    CIEmpleado: empleadoSeleccionado.CIEmpleado
                                  },
                                  { method: "post" }
                                );setOpenModal(false)}}>
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
      )}


      <div>
        <h2 className="mb-2">Tipos de Vehiculos:</h2>
        <div className="flex space-x-4">
          <div className="overflow-x-auto">
          <Table>
                <Table.Head>
                <Table.HeadCell>Nombre</Table.HeadCell>
                <Table.HeadCell>
                    <span className="sr-only">Agregar</span>
                </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                    {tiposSucursal.data.map((tipo) => (
                      <Table.Row key={tipo.CodTipo} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          {tipo.nombre}
                      </Table.Cell>
                      <Table.Cell>
                          <a href="#" onClick={(e) => {
                          e.preventDefault(); // Previene la navegación
                          handleSeleccionarClickTipo(tipo);
                          }} className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                          Agregar
                          </a>
                      </Table.Cell>
                      </Table.Row>
                    ))}           
                </Table.Body>
                {tipoSeleccionado && (
                  <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
                  <Modal.Header />
                    <Modal.Body>
                        <div className="text-center">
                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            ¿Quieres agregar el tipo de vehiculo {tipoSeleccionado.nombre} en la sucursal?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button color="failure" onClick={() => 
                              {fetcher.submit(
                                  {
                                    _action: "eliminarSucursalesAtiendenVehiculos",
                                    RIFSuc: sucursal.data.RIFSuc,
                                    CodTipo: tipoSeleccionado.CodTipo
                                  },
                                  { method: "post" }
                                );setOpenModal(false)}}>
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
            </Table>
        </div>


        <div className="overflow-x-auto">
          <Table>
                <Table.Head>
                <Table.HeadCell>Nombre</Table.HeadCell>
                <Table.HeadCell>
                    <span className="sr-only">Agregar</span>
                </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                    {tiposNoSucursal.data.tipoVehiculo.map((tipo) => (
                      <Table.Row key={tipo.CodTipo} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          {tipo.nombre}
                      </Table.Cell>
                      <Table.Cell>
                          <a href="#" onClick={(e) => {
                          e.preventDefault(); // Previene la navegación
                          handleSeleccionarClickTipo(tipo);
                          }} className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                          Agregar
                          </a>
                      </Table.Cell>
                      </Table.Row>
                    ))}           
                </Table.Body>
                {tipoSeleccionado && (
                  <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
                  <Modal.Header />
                    <Modal.Body>
                        <div className="text-center">
                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            ¿Quieres agregar el tipo de vehiculo {tipoSeleccionado.nombre} en la sucursal?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button color="failure" onClick={() => 
                              {fetcher.submit(
                                  {
                                    _action: "agregarSucursalesAtiendenVehiculos",
                                    RIFSuc: sucursal.data.RIFSuc,
                                    CIEmpleado: tipoSeleccionado.CodTipo
                                  },
                                  { method: "post" }
                                );setOpenModal(false)}}>
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
            </Table>
        </div>
      </div>
      </div>
    </div>
  );
}

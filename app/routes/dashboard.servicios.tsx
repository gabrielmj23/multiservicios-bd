import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Accordion,
  Button,
  Label,
  Modal,
  Select,
  Table,
  Tabs,
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { getSession } from "~/session";
import { getEmpleados } from "~/utils/empleados.server";
import { addFicha, getFichas } from "~/utils/fichas.server";
import { addReserva, getReservas } from "~/utils/reservas.server";
import {
  addActividad,
  addServicio,
  getServicios,
  getServiciosDeSucursal,
  ofrecerServicio,
} from "~/utils/servicios.server";
import { getVehiculoParaFicha } from "~/utils/vehiculos.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session || session.has("error")) {
    return redirect("/");
  }
  const RIFSuc = session.get("RIFSuc");
  if (!RIFSuc) {
    return redirect("/");
  }
  return {
    serviciosSuc: await getServiciosDeSucursal(RIFSuc),
    servicios: await getServicios(),
    empleados: await getEmpleados(RIFSuc),
    fichas: await getFichas(RIFSuc),
    vehiculos: await getVehiculoParaFicha(RIFSuc),
    reservas: await getReservas(RIFSuc),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session || session.has("error")) {
    return redirect("/");
  }
  const RIFSuc = session.get("RIFSuc");
  if (!RIFSuc) {
    return redirect("/");
  }
  const formData = await request.formData();
  const action = String(formData.get("_action"));
  switch (action) {
    case "nuevoServ":
      return await addServicio(formData, RIFSuc);
    case "nuevaAct":
      return await addActividad(formData);
    case "ofrecerServ":
      return await ofrecerServicio(formData, RIFSuc);
    case "crearFicha":
      return await addFicha(formData, RIFSuc);
    case "crearReserva":
      return await addReserva(formData, RIFSuc);
  }
}

export default function DashboardServicios() {
  const { serviciosSuc, servicios, empleados, fichas, vehiculos, reservas } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [codServicioAgg, setCodServicioAgg] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingAct, setIsCreatingAct] = useState(false);
  const [isOffering, setIsOffering] = useState(false);
  const [isCreatingFicha, setIsCreatingFicha] = useState(false);
  const [isCreatingReserva, setIsCreatingReserva] = useState(false);
  const [montoServicioAct, setMontoServicioAct] = useState(0);

  if (
    servicios.type === "error" ||
    serviciosSuc.type === "error" ||
    empleados.type === "error" ||
    fichas.type === "error" ||
    vehiculos.type === "error" ||
    reservas.type === "error"
  ) {
    return (
      <div className="p-6">
        <h1>Servicios</h1>
        <p>{serviciosSuc.type === "error" ? serviciosSuc.message : null}</p>
        <p>{servicios.type === "error" ? servicios.message : null}</p>
        <p>{empleados.type === "error" ? empleados.message : null}</p>
        <p>{fichas.type === "error" ? fichas.message : null}</p>
        <p>{vehiculos.type === "error" ? vehiculos.message : null}</p>
        <p>{reservas.type === "error" ? reservas.message : null}</p>
      </div>
    );
  }

  return (
    <div className="p-6 w-4/5">
      <h1>Servicios</h1>
      <Tabs>
        <Tabs.Item title="Ver servicios">
          <div className="flex justify-start gap-4 mb-6">
            <Button
              className="max-w-xs"
              type="button"
              onClick={() => setIsCreating(true)}
            >
              Nuevo servicio
            </Button>
            <Button
              className="max-w-xs"
              type="button"
              color="success"
              onClick={() => setIsOffering(true)}
            >
              Ofrecer servicio de M&M
            </Button>
          </div>
          <Accordion>
            {serviciosSuc.data.map((servicio) => (
              <Accordion.Panel key={servicio.CodServicio}>
                <Accordion.Title>{servicio.NombreServ}</Accordion.Title>
                <Accordion.Content className="bg-white">
                  <p>
                    <b>Cédula del coordinador:</b> {servicio.CICoordinador}
                  </p>
                  <p>
                    <b>Cédula del encargado:</b> {servicio.CIEncargado}
                  </p>
                  <p>
                    <b>Monto por hora:</b> $
                    {servicio.MontoServ.toLocaleString()}
                  </p>
                  <br></br>
                  <h3 className="text-lg font-semibold mb-2">Actividades</h3>
                  <ul className="ps-6">
                    {servicio.Actividades.map((actividad) =>
                      actividad.CodActividad === null ? (
                        <li key={servicio.CodServicio + "-1"}>
                          No hay actividades por ahora
                        </li>
                      ) : (
                        <li
                          key={
                            servicio.CodServicio + "-" + actividad.CodActividad
                          }
                          className="list-decimal"
                        >
                          {actividad.DescActividad} - $
                          {actividad.CostoHora?.toLocaleString()} por hora
                        </li>
                      )
                    )}
                  </ul>
                  <Button
                    type="button"
                    className="mt-3"
                    onClick={() => {
                      setCodServicioAgg(servicio.CodServicio);
                      setIsCreatingAct(true);
                    }}
                  >
                    Nueva actividad
                  </Button>
                </Accordion.Content>
              </Accordion.Panel>
            ))}
          </Accordion>
        </Tabs.Item>
        <Tabs.Item title="Fichas de servicio">
          <Button
            type="button"
            className="mb-2"
            onClick={() => setIsCreatingFicha(true)}
          >
            Solicitar servicio
          </Button>
          <Table>
            <Table.Head>
              <Table.HeadCell>Código de ficha</Table.HeadCell>
              <Table.HeadCell>Código de vehículo</Table.HeadCell>
              <Table.HeadCell>CI de propietario</Table.HeadCell>
              <Table.HeadCell>Autorizado para el retiro</Table.HeadCell>
              <Table.HeadCell>Fecha de entrada</Table.HeadCell>
              <Table.HeadCell>Fecha estimada de salida</Table.HeadCell>
              <Table.HeadCell>Fecha de salida</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {fichas.data.map((ficha) => (
                <Table.Row
                  key={ficha.CodFicha}
                  className="bg-white hover:cursor-pointer"
                  onClick={() => navigate(`/dashboard/fichas/${ficha.CodFicha}`)}
                >
                  <Table.Cell>{ficha.CodFicha}</Table.Cell>
                  <Table.Cell>{ficha.CodVehiculo}</Table.Cell>
                  <Table.Cell>{ficha.CIPropietario}</Table.Cell>
                  <Table.Cell>{ficha.Autorizado}</Table.Cell>
                  <Table.Cell>
                    {new Date(ficha.TiempoEnt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(ficha.TiempoSalEst).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    {ficha.TiempoSalReal
                      ? new Date(ficha.TiempoSalReal).toLocaleDateString()
                      : null}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tabs.Item>
        <Tabs.Item title="Reservas">
          <Button
            type="button"
            className="mb-2"
            onClick={() => setIsCreatingReserva(true)}
          >
            Hacer reserva
          </Button>
          <Table>
            <Table.Head>
              <Table.HeadCell>Número de reserva</Table.HeadCell>
              <Table.HeadCell>Fecha de reserva</Table.HeadCell>
              <Table.HeadCell>Fecha a atender</Table.HeadCell>
              <Table.HeadCell>Abono</Table.HeadCell>
              <Table.HeadCell>Código de vehículo</Table.HeadCell>
              <Table.HeadCell>Servicio</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {reservas.data.map((reserva) => (
                <Table.Row key={reserva.NumReserva}>
                  <Table.Cell>{reserva.NumReserva}</Table.Cell>
                  <Table.Cell>
                    {new Date(reserva.FechaReserva).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(reserva.FechaServicio).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>${reserva.Abono.toLocaleString()}</Table.Cell>
                  <Table.Cell>{reserva.CodVehiculo}</Table.Cell>
                  <Table.Cell>{reserva.NombreServ}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tabs.Item>
      </Tabs>
      <Modal show={isOffering} onClose={() => setIsOffering(false)}>
        <Modal.Header>Ofrecer servicios</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsOffering(false)}>
            <fieldset>
              <Label htmlFor="CodServicio">Servicio</Label>
              <Select id="CodServicio" name="CodServicio" required>
                {servicios.data
                  .filter(
                    (servicio) =>
                      !serviciosSuc.data.some(
                        (servicioSuc) =>
                          servicioSuc.CodServicio === servicio.CodServicio
                      )
                  )
                  .map((servicio) => (
                    <option
                      key={servicio.CodServicio}
                      value={servicio.CodServicio}
                    >
                      {servicio.NombreServ}
                    </option>
                  ))}
              </Select>
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="Capacidad">Capacidad</Label>
                <TextInput
                  id="Capacidad"
                  name="Capacidad"
                  type="number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="TiempoReserva">Tiempo de reserva (días)</Label>
                <TextInput
                  id="TiempoReserva"
                  name="TiempoReserva"
                  type="number"
                  required
                />
              </div>
            </fieldset>
            <Button type="submit" name="_action" value="ofrecerServ">
              Ofrecer
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal show={isCreating} onClose={() => setIsCreating(false)}>
        <Modal.Header>Nuevo servicio</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post"  onSubmit={() => setIsCreating(false)}>
            <fieldset>
              <Label htmlFor="NombreServ">Nombre del servicio</Label>
              <TextInput
                id="NombreServ"
                name="NombreServ"
                type="text"
                required
              />
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="CICoordinador">Coordinador</Label>
                <Select id="CICoordinador" name="CICoordinador" required>
                  {empleados.data.empleados.map((emp) => (
                    <option key={emp.CIEmpleado} value={emp.CIEmpleado}>
                      {emp.CIEmpleado} - {emp.NombreEmp}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="CIEncargado">Encargado</Label>
                <Select id="CIEncargado" name="CIEncargado" required>
                  {empleados.data.empleados.map((emp) => (
                    <option key={emp.CIEmpleado} value={emp.CIEmpleado}>
                      {emp.CIEmpleado} - {emp.NombreEmp}
                    </option>
                  ))}
                </Select>
              </div>
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="Capacidad">Capacidad</Label>
                <TextInput
                  id="Capacidad"
                  name="Capacidad"
                  type="number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="TiempoReserva">
                  Tiempo mínimo de reserva (días)
                </Label>
                <TextInput
                  id="TiempoReserva"
                  name="TiempoReserva"
                  type="number"
                  required
                />
              </div>
            </fieldset>
            <Button
              type="submit"
              name="_action"
              value="nuevoServ"
              disabled={fetcher.state !== "idle"}
            >
              Agregar
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal show={isCreatingAct} onClose={() => setIsCreatingAct(false)}>
        <Modal.Header>Agregar actividad</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsCreatingAct(false)}>
            <fieldset>
              <Label htmlFor="DescActividad">Descripción de la actividad</Label>
              <TextInput
                id="DescActividad"
                name="DescActividad"
                type="text"
                required
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="CostoHora">Costo por hora</Label>
              <TextInput
                id="CostoHora"
                name="CostoHora"
                type="number"
                required
              />
            </fieldset>
            <input type="hidden" name="CodServicio" value={codServicioAgg} />
            <Button
              type="submit"
              name="_action"
              value="nuevaAct"
              disabled={fetcher.state !== "idle"}
            >
              Agregar
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal show={isCreatingFicha} onClose={() => setIsCreatingFicha(false)}>
        <Modal.Header>Solicitar servicio</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsCreatingFicha(false)}>
            <fieldset>
              <Label htmlFor="CodVehiculo">Vehículo</Label>
              <Select id="CodVehiculo" name="CodVehiculo" required>
                {vehiculos.data.map((vehiculo) => (
                  <option
                    key={vehiculo.CodVehiculo}
                    value={vehiculo.CodVehiculo}
                  >
                    {vehiculo.CodVehiculo} - Placa: {vehiculo.PlacaVehic}
                  </option>
                ))}
              </Select>
            </fieldset>
            <fieldset>
              <Label htmlFor="Autorizado">Autorizado para el retiro</Label>
              <TextInput id="Autorizado" name="Autorizado" />
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="TiempoEnt">Fecha de entrada</Label>
                <TextInput
                  id="TiempoEnt"
                  name="TiempoEnt"
                  type="datetime-local"
                  required
                />
              </div>
              <div>
                <Label htmlFor="TiempoSalEst">Fecha de salida estimada</Label>
                <TextInput
                  id="TiempoSalEst"
                  name="TiempoSalEst"
                  type="datetime-local"
                  required
                />
              </div>
            </fieldset>
            <Button
              type="submit"
              name="_action"
              value="crearFicha"
              disabled={fetcher.state !== "idle"}
            >
              Solicitar
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal
        show={isCreatingReserva}
        onClose={() => setIsCreatingReserva(false)}
      >
        <Modal.Header>Crear reserva</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsCreatingReserva(false)}>
            <fieldset>
              <Label htmlFor="CodVehiculo">Vehículo</Label>
              <Select id="CodVehiculo" name="CodVehiculo" required>
                {vehiculos.data.map((vehiculo) => (
                  <option
                    key={vehiculo.CodVehiculo}
                    value={vehiculo.CodVehiculo}
                  >
                    {vehiculo.CodVehiculo} - Placa: {vehiculo.PlacaVehic}
                  </option>
                ))}
              </Select>
            </fieldset>
            <fieldset>
              <Label htmlFor="CodServicio">Servicio</Label>
              <Select id="CodServicio" name="CodServicio" required>
                <option disabled selected>
                  Seleccionar...
                </option>
                {serviciosSuc.data.map((servicio) => (
                  <option
                    key={servicio.CodServicio}
                    value={servicio.CodServicio}
                    onClick={() => setMontoServicioAct(servicio.MontoServ)}
                  >
                    {servicio.NombreServ}
                  </option>
                ))}
              </Select>
            </fieldset>
            <fieldset>
              <Label htmlFor="FechaServicio">Fecha a atender</Label>
              <TextInput
                id="FechaServicio"
                name="FechaServicio"
                type="datetime-local"
                required
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="Abono">
                Abono (monto del servicio actual: $
                {montoServicioAct.toLocaleString()})
              </Label>
              <TextInput id="Abono" name="Abono" type="number" required />
            </fieldset>
            <Button
              type="submit"
              name="_action"
              value="crearReserva"
              disabled={fetcher.state !== "idle"}
            >
              Crear
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

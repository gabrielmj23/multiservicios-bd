import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Accordion,
  Button,
  Label,
  Modal,
  Select,
  Tabs,
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { getSession } from "~/session";
import { getEmpleados } from "~/utils/empleados.server";
import {
  addActividad,
  addServicio,
  getServicios,
  getServiciosDeSucursal,
  ofrecerServicio,
} from "~/utils/servicios.server";

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
  }
}

export default function DashboardServicios() {
  const { serviciosSuc, servicios, empleados } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [codServicioAgg, setCodServicioAgg] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingAct, setIsCreatingAct] = useState(false);
  const [isOffering, setIsOffering] = useState(false);

  if (
    servicios.type === "error" ||
    serviciosSuc.type === "error" ||
    empleados.type === "error"
  ) {
    return (
      <div className="p-6">
        <h1>Servicios</h1>
        <p>{serviciosSuc.type === "error" ? serviciosSuc.message : null}</p>
        <p>{servicios.type === "error" ? servicios.message : null}</p>
        <p>{empleados.type === "error" ? empleados.message : null}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1>Servicios</h1>
      <Tabs>
        <Tabs.Item title="Ver servicios">
          <div className="grid grid-cols-2 gap-6 pb-6">
            <Button type="button" onClick={() => setIsCreating(true)}>
              Nuevo servicio
            </Button>
            <Button
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
        <Tabs.Item title="Fichas de servicio"></Tabs.Item>
      </Tabs>
      <Modal show={isOffering} onClose={() => setIsOffering(false)}>
        <Modal.Header>Ofrecer servicios</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post">
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
          <fetcher.Form method="post">
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
          <fetcher.Form method="post">
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
    </div>
  );
}

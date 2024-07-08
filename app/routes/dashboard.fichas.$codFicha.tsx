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
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { getSession } from "~/session";
import { getEmpleados } from "~/utils/empleados.server";
import {
  consumirInsumo,
  getDatosFicha,
  hacerActividad,
  iniciarRegistroFicha,
  tieneFactura,
} from "~/utils/fichas.server";
import { getInsumos } from "~/utils/inventario.server";
import { getServiciosDeSucursal } from "~/utils/servicios.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Obtener RIF de la sucursal
  const session = await getSession(request.headers.get("Cookie"));
  if (!session || session.has("error")) {
    return redirect("/");
  }
  const RIFSuc = session.get("RIFSuc");
  if (!RIFSuc) {
    return redirect("/");
  }

  const codFicha = Number(params.codFicha);
  return {
    tieneFactura: await tieneFactura(codFicha),
    datosFicha: await getDatosFicha(codFicha),
    servicios: await getServiciosDeSucursal(RIFSuc),
    insumos: await getInsumos(),
    empleados: await getEmpleados(RIFSuc),
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (String(formData.get("_action"))) {
    case "crearFact":
      return await iniciarRegistroFicha(
        Number(params.codFicha),
        String(formData.get("TiempoSalReal")).split("T").join(" ")
      );
    case "hacerAct":
      return await hacerActividad(Number(params.codFicha), formData);
    case "consumir":
      return await consumirInsumo(Number(params.codFicha), formData);
  }
}

export default function DashboardFicha() {
  const { tieneFactura, datosFicha, servicios, insumos, empleados } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [empezarModal, setEmpezarModal] = useState(false);
  const [realizarAct, setRealizarAct] = useState(false);
  const [codServicioAct, setCodServicioAct] = useState(0);
  const [consumir, setConsumir] = useState(false);
  const [codServicioCons, setCodServicioCons] = useState(0);
  const [codActividadCons, setCodActividadCons] = useState(0);
  const [codNumRealizadaCons, setCodNumRealizadaCons] = useState(0);

  if (
    tieneFactura.type === "error" ||
    datosFicha.type === "error" ||
    servicios.type === "error" ||
    insumos.type === "error" ||
    empleados.type === "error"
  ) {
    return (
      <div className="p-6">
        <h1>Ficha de servicio</h1>
        <p>{tieneFactura.type === "error" ? tieneFactura.message : null}</p>
        <p>{datosFicha.type === "error" ? datosFicha.message : null}</p>
        <p>{servicios.type === "error" ? servicios.message : null}</p>
        <p>{insumos.type === "error" ? insumos.message : null}</p>
        <p>{empleados.type === "error" ? empleados.message : null}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1>Ficha de servicio #{datosFicha.data.CodFicha}</h1>
      <p>
        <b>Código de vehículo:</b> {datosFicha.data.CodVehiculo}
      </p>
      <p>
        <b>CI del cliente:</b> {datosFicha.data.CIPropietario}
      </p>
      <p>
        <b>Fecha de entrada:</b>{" "}
        {new Date(datosFicha.data.TiempoEnt).toLocaleString()}
      </p>
      <p>
        <b>Fecha de salida estimada:</b>{" "}
        {new Date(datosFicha.data.TiempoSalEst).toLocaleString()}
      </p>
      {tieneFactura.data ? (
        <div className="mt-4">
          <Button
            type="button"
            className="mb-2"
            onClick={() => setRealizarAct(true)}
          >
            Realizar actividad
          </Button>
          <Accordion>
            {datosFicha.data.actividadesRealizadas.map((actividad) => (
              <Accordion.Panel key={actividad.CodAct}>
                <Accordion.Title>
                  Actividad: {actividad.DescAct}
                </Accordion.Title>
                <Accordion.Content className="bg-white">
                  <p>${actividad.PrecioHora} por hora</p>
                  <p>Duración: {actividad.Tiempo} horas</p>
                  <div>
                    <p className="font-semibold">Recursos utilizados:</p>
                    <ol className="ps-6">
                      {actividad.RecursosUsados.map((recurso) =>
                        recurso.CodInsumo === null ? null : (
                          <li key={recurso.CodInsumo} className="list-decimal">
                            <p>
                              {recurso.NombreIns} - {recurso.Cantidad} unidades
                            </p>
                            <p>${recurso.Precio} por unidad</p>
                            <p>Utilizado por CI: {recurso.CIEmpleado}</p>
                          </li>
                        )
                      )}
                    </ol>
                    <Button
                      type="button"
                      className="mt-2"
                      onClick={() => {
                        setConsumir(true);
                        setCodServicioCons(actividad.CodServicio);
                        setCodActividadCons(actividad.CodAct);
                        setCodNumRealizadaCons(actividad.NumRealizada);
                      }}
                    >
                      Consumir recurso
                    </Button>
                  </div>
                </Accordion.Content>
              </Accordion.Panel>
            ))}
          </Accordion>
          <Modal show={realizarAct} onClose={() => setRealizarAct(false)}>
            <Modal.Header>Realizar actividad</Modal.Header>
            <Modal.Body>
              <fetcher.Form method="post" onSubmit={() => setRealizarAct(false)}>
                <fieldset className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="CodServicio">Servicio</Label>
                    <Select id="CodServicio" name="CodServicio">
                      <option disabled selected>
                        Seleccionar...
                      </option>
                      {servicios.data.map((servicio) => (
                        <option
                          key={servicio.CodServicio}
                          value={servicio.CodServicio}
                          onClick={() =>
                            setCodServicioAct(servicio.CodServicio)
                          }
                        >
                          {servicio.NombreServ}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="CodActividad">Actividad</Label>
                    <Select id="CodActividad" name="CodActividad">
                      {servicios.data
                        .find(
                          (servicio) => servicio.CodServicio === codServicioAct
                        )
                        ?.Actividades.map((actividad) =>
                          actividad.CodActividad === null ? null : (
                            <option
                              key={actividad.CodActividad}
                              value={actividad.CodActividad}
                            >
                              {actividad.DescActividad}
                            </option>
                          )
                        )}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="PrecioHora">
                      Precio por hora de mano de obra
                    </Label>
                    <TextInput
                      id="PrecioHora"
                      name="PrecioHora"
                      type="number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="Tiempo">Horas de mano de obra</Label>
                    <TextInput
                      id="Tiempo"
                      name="Tiempo"
                      type="number"
                      required
                    />
                  </div>
                </fieldset>
                <Button
                  type="submit"
                  name="_action"
                  value="hacerAct"
                  disabled={fetcher.state !== "idle"}
                >
                  Registrar
                </Button>
              </fetcher.Form>
            </Modal.Body>
          </Modal>
          <Modal show={consumir} onClose={() => setConsumir(false)}>
            <Modal.Header>Consumir insumo</Modal.Header>
            <Modal.Body>
              <fetcher.Form method="post" onSubmit={() => setConsumir(false)}>
                <fieldset className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="CodInsumo">Insumo</Label>
                    <Select id="CodInsumo" name="CodInsumo" required>
                      {insumos.data.map((insumo) => (
                        <option key={insumo.CodIns} value={insumo.CodIns}>
                          {insumo.NombreIns}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="CIEmpleado">Consumido por</Label>
                    <Select id="CIEmpleado" name="CIEmpleado" required>
                      {empleados.data.empleados.map((empleado) => (
                        <option
                          key={empleado.CIEmpleado}
                          value={empleado.CIEmpleado}
                        >
                          {empleado.CIEmpleado} - {empleado.NombreEmp}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="Cantidad">Cantidad</Label>
                    <TextInput
                      id="Cantidad"
                      name="Cantidad"
                      type="number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="Precio">Precio por unidad</Label>
                    <TextInput
                      id="Precio"
                      name="Precio"
                      type="number"
                      required
                    />
                  </div>
                  <input
                    type="hidden"
                    name="CodServicio"
                    value={codServicioCons}
                  />
                  <input type="hidden" name="CodAct" value={codActividadCons} />
                  <input
                    type="hidden"
                    name="NumRealizada"
                    value={codNumRealizadaCons}
                  />
                </fieldset>
                <Button
                  type="submit"
                  name="_action"
                  value="consumir"
                  disabled={fetcher.state !== "idle"}
                >
                  Registrar
                </Button>
              </fetcher.Form>
            </Modal.Body>
          </Modal>
        </div>
      ) : (
        <div className="mt-4">
          <p>No se ha empezado a atender</p>
          <Button
            type="button"
            className="mt-2"
            onClick={() => setEmpezarModal(true)}
          >
            Empezar a atender
          </Button>
          <Modal
            show={empezarModal}
            onClose={() => setEmpezarModal(false)}
            size="md"
          >
            <Modal.Header>Atender cliente</Modal.Header>
            <Modal.Body>
              <fetcher.Form method="post" onSubmit={() => setEmpezarModal(false)}>
                <fieldset>
                  <Label htmlFor="TiempoSalReal">Fecha de salida real</Label>
                  <TextInput
                    id="TiempoSalReal"
                    name="TiempoSalReal"
                    type="datetime-local"
                    required
                  />
                </fieldset>
                <Button type="submit" name="_action" value="crearFact">
                  Empezar
                </Button>
              </fetcher.Form>
            </Modal.Body>
          </Modal>
        </div>
      )}
    </div>
  );
}

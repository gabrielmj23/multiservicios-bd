import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Label, Select, Table, Tabs } from "flowbite-react";
import { getSession } from "~/session";
import {
  articulosPorVentas,
  clientesPorFrecuencia,
  clientesSuspenden,
  comparacionSuc,
  historialServicios,
  insumosAjustados,
  marcasAtendidasPorServicio,
  personalMasAtiende,
  proveedoresMasSuministros,
  serviciosMasSolicitados,
} from "~/utils/estadisticas.server";
import { getVehiculoParaFicha } from "~/utils/vehiculos.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Obtener RIF de sucursal de las cookies
  const session = await getSession(request.headers.get("Cookie"));
  if (!session || session.has("error")) {
    return redirect("/");
  }
  const RIFSuc = session.get("RIFSuc");
  if (!RIFSuc) {
    return redirect("/");
  }
  // Obtener código de vehículo para el historial de los params
  const url = new URL(request.url);
  const CodVehiculo = url.searchParams.get("vehicHistorial");
  // Obtener tipo de factura para la comparación
  const tipoFact = url.searchParams.get("tipoFact");

  return {
    marcasAtendidasPorServicio: await marcasAtendidasPorServicio(),
    personalMasAtiende: await personalMasAtiende(RIFSuc),
    clientesPorFrecuencia: await clientesPorFrecuencia(RIFSuc),
    articulosPorVentas: await articulosPorVentas(RIFSuc),
    serviciosMasSolicitados: await serviciosMasSolicitados(),
    vehiculosCompatibles: await getVehiculoParaFicha(RIFSuc),
    historialServicios: await historialServicios(CodVehiculo),
    comparacionSuc: await comparacionSuc(tipoFact),
    clientesSuspenden: await clientesSuspenden(),
    proveedoresMasSuministros: await proveedoresMasSuministros(),
    insumosAjustados: await insumosAjustados(),
  };
}

export default function DashboardEstadisticas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    marcasAtendidasPorServicio,
    personalMasAtiende,
    clientesPorFrecuencia,
    articulosPorVentas,
    serviciosMasSolicitados,
    vehiculosCompatibles,
    historialServicios,
    comparacionSuc,
    clientesSuspenden,
    proveedoresMasSuministros,
    insumosAjustados,
  } = useLoaderData<typeof loader>();
  if (
    marcasAtendidasPorServicio.type === "error" ||
    personalMasAtiende.type === "error" ||
    clientesPorFrecuencia.type === "error" ||
    articulosPorVentas.type === "error" ||
    serviciosMasSolicitados.type === "error" ||
    vehiculosCompatibles.type === "error" ||
    historialServicios.type === "error" ||
    comparacionSuc.type === "error" ||
    clientesSuspenden.type === "error" ||
    proveedoresMasSuministros.type === "error" ||
    insumosAjustados.type === "error"
  ) {
    return (
      <div className="p-6">
        <h1>Estadísticas</h1>
        <p>
          {marcasAtendidasPorServicio.type === "error"
            ? marcasAtendidasPorServicio.message
            : null}
        </p>
        <p>
          {personalMasAtiende.type === "error"
            ? personalMasAtiende.message
            : null}
        </p>
        <p>
          {clientesPorFrecuencia.type === "error"
            ? clientesPorFrecuencia.message
            : null}
        </p>
        <p>
          {articulosPorVentas.type === "error"
            ? articulosPorVentas.message
            : null}
        </p>
        <p>
          {serviciosMasSolicitados.type === "error"
            ? serviciosMasSolicitados.message
            : null}
        </p>
        <p>
          {vehiculosCompatibles.type === "error"
            ? vehiculosCompatibles.message
            : null}
        </p>
        <p>
          {historialServicios.type === "error"
            ? historialServicios.message
            : null}
        </p>
        <p>{comparacionSuc.type === "error" ? comparacionSuc.message : null}</p>
        <p>
          {clientesSuspenden.type === "error"
            ? clientesSuspenden.message
            : null}
        </p>
        <p>
          {proveedoresMasSuministros.type === "error"
            ? proveedoresMasSuministros.message
            : null}
        </p>
        <p>
          {insumosAjustados.type === "error" ? insumosAjustados.message : null}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 w-4/5">
      <h1>Estadísticas</h1>
      <Tabs>
        <Tabs.Item title="Marcas más atendidas por servicio">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Servicio</Table.HeadCell>
              <Table.HeadCell>Marca</Table.HeadCell>
              <Table.HeadCell>Veces atendida</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {marcasAtendidasPorServicio.data.map((marca) => (
                <Table.Row key={`${marca.NombreMarca}${marca.NombreServ}`}>
                  <Table.Cell>{marca.NombreServ}</Table.Cell>
                  <Table.Cell>{marca.NombreMarca}</Table.Cell>
                  <Table.Cell>{marca.TotalServicios}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tabs.Item>
        <Tabs.Item title="Personal por servicios atendidos por mes">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Cédula</Table.HeadCell>
              <Table.HeadCell>Nombre</Table.HeadCell>
              <Table.HeadCell>Servicios realizados</Table.HeadCell>
              <Table.HeadCell>Mes y año</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {personalMasAtiende.data.map((persona) => (
                <Table.Row
                  key={`${persona.CIEmpleado}${persona.MesServ}${persona.AnioServ}`}
                >
                  <Table.Cell>{persona.CIEmpleado}</Table.Cell>
                  <Table.Cell>{persona.NombreEmp}</Table.Cell>
                  <Table.Cell>{persona.TotalServicios}</Table.Cell>
                  <Table.Cell>
                    {persona.MesServ}/{persona.AnioServ}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tabs.Item>
        <Tabs.Item title="Clientes por frecuencia">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Cédula</Table.HeadCell>
              <Table.HeadCell>Nombre</Table.HeadCell>
              <Table.HeadCell>Servicios solicitados</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {clientesPorFrecuencia.data.map((cliente) => (
                <Table.Row key={cliente.CICliente}>
                  <Table.Cell>{cliente.CICliente}</Table.Cell>
                  <Table.Cell>{cliente.NombreCliente}</Table.Cell>
                  <Table.Cell>{cliente.TotalServicios}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tabs.Item>
        <Tabs.Item title="Artículos por ventas">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Código de artículo</Table.HeadCell>
              <Table.HeadCell>Nombre</Table.HeadCell>
              <Table.HeadCell>Ventas</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {articulosPorVentas.data.map((articulo) => (
                <Table.Row key={articulo.CodArticuloT}>
                  <Table.Cell>{articulo.CodArticuloT}</Table.Cell>
                  <Table.Cell>{articulo.NombreArticuloT}</Table.Cell>
                  <Table.Cell>{articulo.TotalVentas}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tabs.Item>
        <Tabs.Item title="Servicios más solicitados">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Servicio</Table.HeadCell>
              <Table.HeadCell>Veces solicitado</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {serviciosMasSolicitados.data.map((servicio) => (
                <Table.Row key={servicio.NombreServ}>
                  <Table.Cell>{servicio.NombreServ}</Table.Cell>
                  <Table.Cell>{servicio.TotalSolicitudes}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tabs.Item>
        <Tabs.Item title="Histórico de servicios">
          <Label htmlFor="CodVehiculo">Seleccione un vehículo:</Label>
          <Select id="CodVehiculo" className="max-w-sm">
            <option
              disabled
              selected={searchParams.get("vehicHistorial") === null}
            >
              Seleccionar...
            </option>
            {vehiculosCompatibles.data.map((vehiculo) => (
              <option
                key={vehiculo.CodVehiculo}
                selected={
                  searchParams.get("vehicHistorial") ===
                  String(vehiculo.CodVehiculo)
                }
                onClick={() =>
                  setSearchParams((prev) => {
                    prev.set("vehicHistorial", String(vehiculo.CodVehiculo));
                    return prev;
                  })
                }
              >
                {vehiculo.CodVehiculo} - Placa: {vehiculo.PlacaVehic}
              </option>
            ))}
          </Select>
          <Table hoverable className="mt-4">
            <Table.Head>
              <Table.HeadCell>Código de ficha</Table.HeadCell>
              <Table.HeadCell>Fecha de entrada</Table.HeadCell>
              <Table.HeadCell>Servicio</Table.HeadCell>
              <Table.HeadCell>Actividad</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {historialServicios.data.map((servicio) => (
                <Table.Row key={servicio.CodFicha}>
                  <Table.Cell>{servicio.CodFicha}</Table.Cell>
                  <Table.Cell>
                    {new Date(servicio.TiempoEnt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>{servicio.NombreServ}</Table.Cell>
                  <Table.Cell>{servicio.DescActividad}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tabs.Item>
        <Tabs.Item title="Comparación entre sucursales">
          <Label htmlFor="tipoFact">Tipo de factura</Label>
          <Select id="tipoFact" className="max-w-sm mb-4">
            <option disabled selected={searchParams.get("tipoFact") === null}>
              Seleccionar...
            </option>
            <option
              selected={searchParams.get("tipoFact") === "servicios"}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set("tipoFact", "servicios");
                  return prev;
                })
              }
            >
              De servicios
            </option>
            <option
              selected={searchParams.get("tipoFact") === "tienda"}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set("tipoFact", "tienda");
                  return prev;
                })
              }
            >
              De tienda
            </option>
          </Select>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>RIF</Table.HeadCell>
              <Table.HeadCell>Nombre</Table.HeadCell>
              <Table.HeadCell>Total de facturas</Table.HeadCell>
              <Table.HeadCell>Monto total facturado</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {comparacionSuc.data.map((sucursal) => (
                <Table.Row key={sucursal.RIFSuc}>
                  <Table.Cell>{sucursal.RIFSuc}</Table.Cell>
                  <Table.Cell>{sucursal.NombreSuc}</Table.Cell>
                  <Table.Cell>{sucursal.TotalFacturas}</Table.Cell>
                  <Table.Cell>
                    ${sucursal.TotalFacturado.toLocaleString()}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tabs.Item>
        <Tabs.Item title="Clientes que suspenden reservas">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Cédula</Table.HeadCell>
              <Table.HeadCell>Nombre</Table.HeadCell>
              <Table.HeadCell>Reservas suspendidas</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {clientesSuspenden.data.map((cliente) => (
                <Table.Row key={cliente.CICliente}>
                  <Table.Cell>{cliente.CICliente}</Table.Cell>
                  <Table.Cell>{cliente.NombreCliente}</Table.Cell>
                  <Table.Cell>{cliente.ReservasSuspendidas}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tabs.Item>
        <Tabs.Item title="Proveedores que más suministran">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>RIF</Table.HeadCell>
              <Table.HeadCell>Razón social</Table.HeadCell>
              <Table.HeadCell>Total de insumos suministrados</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {proveedoresMasSuministros.data.map((proveedor) => (
                <Table.Row key={proveedor.RIFProv}>
                  <Table.Cell>{proveedor.RIFProv}</Table.Cell>
                  <Table.Cell>{proveedor.RazonProv}</Table.Cell>
                  <Table.Cell>{proveedor.TotalSuministrado}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tabs.Item>
        <Tabs.Item title="Insumos con ajustes">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Código de insumo</Table.HeadCell>
              <Table.HeadCell>Nombre</Table.HeadCell>
              <Table.HeadCell>Código de ajuste</Table.HeadCell>
              <Table.HeadCell>Fecha de ajuste</Table.HeadCell>
              <Table.HeadCell>Tipo de ajuste</Table.HeadCell>
              <Table.HeadCell>Comentario</Table.HeadCell>
              <Table.HeadCell>Diferencia</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {insumosAjustados.data.map((insumo) => (
                <Table.Row key={`${insumo.CodIns}-${insumo.CodAjuste}`}>
                  <Table.Cell>{insumo.CodIns}</Table.Cell>
                  <Table.Cell>{insumo.NombreIns}</Table.Cell>
                  <Table.Cell>{insumo.CodAjuste}</Table.Cell>
                  <Table.Cell>
                    {new Date(insumo.FechaAjuste).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    {insumo.TipoAjuste === "F" ? "Faltante" : "Sobrante"}
                  </Table.Cell>
                  <Table.Cell>{insumo.ComentarioAjuste}</Table.Cell>
                  <Table.Cell>{insumo.Diferencia}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tabs.Item>
      </Tabs>
    </div>
  );
}

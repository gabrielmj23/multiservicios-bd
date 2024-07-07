import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Table } from "flowbite-react";
import { getDetalleFactura } from "~/utils/facturasServicio.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const CodFServ = Number(params.CodFServ);
  return await getDetalleFactura(CodFServ);
}

export default function DetalleFactura() {
  const detalles = useLoaderData<typeof loader>();
  if (detalles.type === "error") {
    return (
      <div className="p-6">
        <h1>Detalle de factura</h1>
        <p>{detalles.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1>Detalle de la factura #{detalles.data.datosBasicos.CodFServ}</h1>
      <p>
        <b>Fecha: </b>
        {new Date(detalles.data.datosBasicos.FechaFServ).toLocaleString()}
      </p>
      <p>
        <b>Vehículo: </b>VEHIC{detalles.data.datosBasicos.CodVehiculo} - Placa{" "}
        {detalles.data.datosBasicos.PlacaVehic}
      </p>
      <p>
        <b>Cliente: </b>CI: {detalles.data.datosBasicos.CICliente} -{" "}
        {detalles.data.datosBasicos.NombreCliente}
      </p>
      <hr className="my-4 border-slate-500"></hr>
      <h2>Mano de obra</h2>
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Actividad</Table.HeadCell>
          <Table.HeadCell>Costo por hora</Table.HeadCell>
          <Table.HeadCell>Horas</Table.HeadCell>
          <Table.HeadCell>Monto</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {detalles.data.manoDeObra.map((actividad) => (
            <Table.Row key={actividad.NumRealizada}>
              <Table.Cell>{actividad.DescActividad}</Table.Cell>
              <Table.Cell>${actividad.PrecioHora.toFixed(2)}</Table.Cell>
              <Table.Cell>{actividad.Tiempo}</Table.Cell>
              <Table.Cell>${actividad.TotalActividad.toFixed(2)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <hr className="my-4 border-slate-500"></hr>
      <h2>Insumos y repuestos</h2>
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Insumo</Table.HeadCell>
          <Table.HeadCell>Cantidad</Table.HeadCell>
          <Table.HeadCell>Costo por unidad</Table.HeadCell>
          <Table.HeadCell>Monto</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {detalles.data.insumosRepuestos.map((insumo) => (
            <Table.Row key={insumo.NombreIns}>
              <Table.Cell>{insumo.NombreIns}</Table.Cell>
              <Table.Cell>{insumo.Cantidad}</Table.Cell>
              <Table.Cell>${insumo.Precio.toFixed(2)}</Table.Cell>
              <Table.Cell>${insumo.TotalInsumo.toFixed(2)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <hr className="my-4 border-slate-500"></hr>
      <div className="text-end">
        <p className="text-lg">
          Subtotal:{" "}
          {detalles.data.datosBasicos.PorcDcto
            ? detalles.data.datosBasicos.MontoFServ /
              (1 + detalles.data.datosBasicos.PorcDcto)
            : detalles.data.datosBasicos.MontoFServ}
        </p>
        <p className="text-lg">
          Descuento por cliente frecuente:{" "}
          {detalles.data.datosBasicos.PorcDcto
            ? detalles.data.datosBasicos.PorcDcto * 100
            : 0}
          %
        </p>
        <p className="text-lg">
          Total: ${detalles.data.datosBasicos.MontoFServ.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

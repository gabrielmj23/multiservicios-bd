import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getSession } from "~/session";
import { useLoaderData } from "@remix-run/react";
import { Table } from "flowbite-react";
import { getFacturasTiendaIncluyen, getFacturaTienda, getArticulosTienda } from "~/utils/tienda.server";


export async function loader({ params, request }: LoaderFunctionArgs) {
const session = await getSession(request.headers.get("Cookie"));
  if (!session || session.has("error")) {
    return redirect("/");
  }
  const RIFSuc = session.get("RIFSuc");
  if (!RIFSuc) {
    return redirect("/");
  }
  const codFTien = Number(params.CodFTien);
  const detalles = await getFacturasTiendaIncluyen(codFTien);
  const factura = await getFacturaTienda(codFTien);
  const articulos = await getArticulosTienda(RIFSuc);
  return { detalles, codFTien, factura, articulos };
}

export default function DashboardDetalleFactura() {
  const{ detalles, codFTien, factura, articulos} = useLoaderData<typeof loader>();
   
  const fecha = new Date(factura.data.FechaFTien);
  
  const formattedDate = fecha.toLocaleDateString('en-GB');

  const hours = fecha.getUTCHours().toString().padStart(2, '0'); 
  const minutes = fecha.getUTCMinutes().toString().padStart(2, '0'); 
  const formattedTime = `${hours}:${minutes}`;
  console.log(factura)
     return (
    <div className="p-6">
      <h1>Detalle Factura #{codFTien}</h1>
      <div>
        <p>Cédula cliente: {factura.data.CICliente}</p>
        <p>Fecha: {formattedDate}</p>
        <p>Hora: {formattedTime}</p>
        <p className="font-bold">Total:  ${factura.data.MontoFTien}</p>
      </div>
      <Table hoverable className="min-w-fit">
        <Table.Head>
          <Table.HeadCell>Código Artículo</Table.HeadCell>
          <Table.HeadCell>Descripción</Table.HeadCell>
          <Table.HeadCell>Cantidad</Table.HeadCell>
          <Table.HeadCell>Precio</Table.HeadCell>
          <Table.HeadCell>Subtotal</Table.HeadCell>
        </Table.Head>
        <Table.Body className="bg-gray-100">
          {detalles.data.map((detalle) => {
         
         const articulo =  articulos.data.find(art => art.CodArticuloT == detalle.CodArticuloT);
        
          return (
            <Table.Row key={detalle.CodArticuloT}>
              <Table.Cell>{detalle.CodArticuloT}</Table.Cell>
              <Table.Cell>{articulo ? articulo.NombreArticuloT : 'N/A'}</Table.Cell>
              <Table.Cell>{detalle.Cantidad}</Table.Cell>
              <Table.Cell>${detalle.Precio.toLocaleString()}</Table.Cell>
            <Table.Cell>${(detalle.Precio * detalle.Cantidad).toLocaleString()}</Table.Cell>
            </Table.Row>
          )})}
        </Table.Body>
      </Table>
    </div>
  );
  

}

import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getSession } from "~/session";
import {Link, useFetcher, useLoaderData, } from "@remix-run/react";
import { Button,Label,  Modal, Select, Table, TextInput } from "flowbite-react";
import { useState } from "react";
import { getCedulas } from "~/utils/clientes.server";
import { getArticulosTienda, crearFacturaYArticulos, getFacturasTienda } from "~/utils/tienda.server";

interface FacturaDetalles {
  CICliente: string;
  Articulos: { CodArticuloT: number; Cantidad: number }[];
}

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
    articulos: await getArticulosTienda(RIFSuc),
    cedulas: await getCedulas(),
    facturas: await getFacturasTienda(RIFSuc),
    }; 
}

export async function action({ request }: ActionFunctionArgs) {
    console.log("hola")
    const session = await getSession(request.headers.get("Cookie"));
  if (!session || session.has("error")) {
    return redirect("/");
  }
  const RIFSuc = session.get("RIFSuc");
  if (!RIFSuc) {
    return redirect("/");
  }

  const formData = await request.formData();
  console.log(formData);
  const CICliente = formData.get("CICliente") as string;

  const Articulos: { CodArticuloT: number; Cantidad: number}[] = [];

  formData.forEach((value, key) => {
  const match = key.match(/^CodArticuloT:\s*(\d+)$/);
  if (match) {
    Articulos.push({
      CodArticuloT: parseInt(match[1], 10),
      Cantidad: parseInt(value as string, 10),
    });
  }
});

   const facturaDetalles: FacturaDetalles = { CICliente, Articulos };
    console.log(facturaDetalles);
  switch (String(formData.get("_action"))) {
    case "nueva":
      return await crearFacturaYArticulos(facturaDetalles, RIFSuc);
  }
}

export default function DashboardArticulosTiendaFactura() {
  const  {articulos, cedulas, facturas}  = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [isCreating, setIsCreating] = useState(false);
 
  const handleCloseModal = () => setIsCreating(false);

  const [cantidades, setCantidades] = useState({});

const handleCantidadChange = (CodArticuloT, value) => {
  setCantidades(prev => ({ ...prev, [CodArticuloT]: Number(value) }));
};
console.log(facturas)
const generateHiddenInputsForCantidades = () => {
  return Object.entries(cantidades).map(([key, value]) => {
    if (value !== 0) {
      return (
        <input
          type="hidden"
          name={`CodArticuloT: ${key}`}
          value={value}
          key={key}
        />
      );
    }
    return null;
  });
};

  return (
    <div className="p-6 w-1/2">
      <h1>Facturas de la Tienda</h1>
      <div className="flex items-center mb-2"> 
      <Button
        className="mr-2" 
        type="button"
        onClick={() => setIsCreating(true)}
      >
        Nueva factura
      </Button>
      <Link to="/dashboard/tienda" className="inline-block">
        <Button type="button">
          Volver a Tienda
        </Button>
      </Link>
    </div>
    { facturas && facturas.data.length > 0 ? (
      <Table hoverable className="min-w-fit">
  <Table.Head>
    <Table.HeadCell>Factura</Table.HeadCell>
    <Table.HeadCell>Fecha</Table.HeadCell>
    <Table.HeadCell>Hora</Table.HeadCell>
    <Table.HeadCell>Cédula</Table.HeadCell>
    <Table.HeadCell>Monto total</Table.HeadCell>
  </Table.Head>
  <Table.Body className="bg-gray-100">
    {facturas && facturas.data && facturas.data.map((factura) => (
        
      <Table.Row key={factura.CodFTien}>
        <Table.Cell><Link to={`/dashboard/tienda/facturas/${factura.CodFTien}`}><div>
          {factura.CodFTien}</div>
        </Link></Table.Cell>
        <Table.Cell><Link to={`${factura.CodFTien}`}><div>
          {`${new Date(factura.FechaFTien).getFullYear()}-${('0' + (new Date(factura.FechaFTien).getMonth() + 1)).slice(-2)}-${('0' + new Date(factura.FechaFTien).getDate()).slice(-2)}`}
        </div>
        </Link></Table.Cell>
        <Table.Cell><Link to={`${factura.CodFTien}`}><div>
          {`${('0' + new Date(factura.FechaFTien).getUTCHours()).slice(-2)}:${('0' + new Date(factura.FechaFTien).getUTCMinutes()).slice(-2)}`}
        </div>
        </Link></Table.Cell>
        <Table.Cell><Link to={`${factura.CodFTien}`}><div>
          {factura.CICliente}</div>
        </Link></Table.Cell>
        <Table.Cell><Link to={`${factura.CodFTien}`}><div>
          ${factura.MontoFTien.toLocaleString()}</div>
        </Link></Table.Cell>
      </Table.Row>

    ))}
  </Table.Body>
</Table> ) : (
  <p>No hay artículos en la tienda</p>)
}
    {isCreating && (
        <Modal show={isCreating} onClose={handleCloseModal}>
          <Modal.Header>
            Crear Nueva Factura
          </Modal.Header>
          <Modal.Body>
            <fetcher.Form method="post">
                <Button type="submit" name="_action" value="nueva">
                      Crear
                </Button>
            {generateHiddenInputsForCantidades()}
            <fieldset>
              <Label htmlFor="CICliente">Cédula del cliente</Label>
              <Select id="CICliente" name="CICliente">
                {cedulas.data.map((cedula) => (
                  <option key={cedula} value={cedula}>
                    {cedula}
                  </option>
                ))}
              </Select>
            </fieldset>
</fetcher.Form>
<Table hoverable className="min-w-fit">
  <Table.Head>
    <Table.HeadCell>Código</Table.HeadCell>
    <Table.HeadCell>Nombre</Table.HeadCell>
    <Table.HeadCell>Precio</Table.HeadCell>
    <Table.HeadCell>Cantidad</Table.HeadCell>
  </Table.Head>
  <Table.Body className="bg-gray-100">
    {articulos && articulos.data && articulos.data.map((articulo) => (
      <Table.Row key={articulo.CodArticuloT}>
        <Table.Cell>{articulo.CodArticuloT}</Table.Cell>
        <Table.Cell>{articulo.NombreArticuloT}</Table.Cell>
        <Table.Cell>${articulo.Precio.toLocaleString()}</Table.Cell>
        <Table.Cell>
          <TextInput
                id={`Cantidad-${articulo.CodArticuloT}`}
                name={`Cantidad-${articulo.CodArticuloT}`}
                type="number"
                defaultValue="0"
                min="0"
                onChange={(e) => handleCantidadChange(articulo.CodArticuloT, e.target.value)}
              />
        </Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
          </Modal.Body>
          <Modal.Footer>
          </Modal.Footer>
        </Modal>
      )}
     
      
    </div>
  );
}
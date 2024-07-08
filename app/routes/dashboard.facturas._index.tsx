import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import {
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
import { getCedulas } from "~/utils/clientes.server";
import { getFacturasServicio } from "~/utils/facturasServicio.server";
import {
  crearFacturaYArticulos,
  getArticulosTienda,
  getFacturasTienda,
} from "~/utils/tienda.server";

type FacturaDetalles = {
  CICliente: string;
  Articulos: { CodArticuloT: number; Cantidad: number }[];
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
  return {
    articulos: await getArticulosTienda(RIFSuc),
    cedulas: await getCedulas(),
    facturasTienda: await getFacturasTienda(RIFSuc),
    facturasServicio: await getFacturasServicio(RIFSuc),
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
  switch (String(formData.get("_action"))) {
    case "nuevaFTienda": {
      const CICliente = formData.get("CICliente") as string;
      const Articulos: { CodArticuloT: number; Cantidad: number }[] = [];
      formData.forEach((value, key) => {
        const match = key.match(/^CodArticuloT-*(\d+)$/);
        if (match) {
          Articulos.push({
            CodArticuloT: Number(match[1]),
            Cantidad: Number(String(value)),
          });
        }
      });
      const facturaDetalles = {
        CICliente,
        Articulos,
      } satisfies FacturaDetalles;
      console.log(facturaDetalles);
      return await crearFacturaYArticulos(facturaDetalles, RIFSuc);
    }
  }
}

export default function DashboardFacturas() {
  const { articulos, cedulas, facturasTienda, facturasServicio } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [isCreatingFTienda, setIsCreatingFTienda] = useState(false);
  const [cantidades, setCantidades] = useState({});

  if (
    articulos.type === "error" ||
    cedulas.type === "error" ||
    facturasTienda.type === "error" ||
    facturasServicio.type === "error"
  ) {
    return (
      <div className="p-6">
        <h1>Facturas de la Tienda</h1>
        <p>{articulos.type === "error" ? articulos.message : null}</p>
        <p>{cedulas.type === "error" ? cedulas.message : null}</p>
        <p>{facturasTienda.type === "error" ? facturasTienda.message : null}</p>
        <p>
          {facturasServicio.type === "error" ? facturasServicio.message : null}
        </p>
      </div>
    );
  }

 const handleCantidadChange = (CodArticuloT, value) => {
  setCantidades(prev => ({ ...prev, [CodArticuloT]: Number(value) }));
  console.log(cantidades);
};
const generateHiddenInputsForCantidades = () => {
  return Object.entries(cantidades).map(([key, value]) => {
    if (value !== 0) {
      return (
        <input
          type="hidden"
          name={`CodArticuloT-${key}`}
          value={value}
          key={key}
        />
      );
    }
    return null;
  });
};
  return (
    <div className="p-6">
      <h1>Facturas</h1>
      <Tabs>
        <Tabs.Item title="De servicios">
          {facturasServicio.data.length > 0 ? (
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Código</Table.HeadCell>
                <Table.HeadCell>Fecha</Table.HeadCell>
                <Table.HeadCell>Hora</Table.HeadCell>
                <Table.HeadCell>Monto</Table.HeadCell>
                <Table.HeadCell>Descuento aplicado</Table.HeadCell>
                <Table.HeadCell># ficha de servicio</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {facturasServicio.data.map((factura) => (
                  <Table.Row
                    key={factura.CodFServ}
                    className="hover:cursor-pointer"
                    onClick={() => navigate(`servicios/${factura.CodFServ}`)}
                  >
                    <Table.Cell>{factura.CodFServ}</Table.Cell>
                    <Table.Cell>
                      {new Date(factura.FechaFServ).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(factura.FechaFServ).toLocaleTimeString()}
                    </Table.Cell>
                    <Table.Cell>
                      ${factura.MontoFServ.toLocaleString()}
                    </Table.Cell>
                    <Table.Cell>{factura.PorcDcto || 0}%</Table.Cell>
                    <Table.Cell>{factura.CodFicha}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p>No se han solicitado servicios</p>
          )}
        </Tabs.Item>
        <Tabs.Item title="De la tienda">
          <div className="flex items-center mb-2">
            <Button
              className="mr-2"
              type="button"
              onClick={() => setIsCreatingFTienda(true)}
            >
              Nueva factura
            </Button>
          </div>
          {facturasTienda.data.length > 0 ? (
            <Table hoverable className="min-w-fit">
              <Table.Head>
                <Table.HeadCell>Factura</Table.HeadCell>
                <Table.HeadCell>Fecha</Table.HeadCell>
                <Table.HeadCell>Hora</Table.HeadCell>
                <Table.HeadCell>Cédula</Table.HeadCell>
                <Table.HeadCell>Monto total</Table.HeadCell>
              </Table.Head>
              <Table.Body className="bg-gray-100">
                {facturasTienda.data.map((factura) => (
                  <Table.Row
                    key={factura.CodFTien}
                    className="bg-white hover:cursor-pointer"
                    onClick={() => navigate(`tienda/${factura.CodFTien}`)}
                  >
                    <Table.Cell>{factura.CodFTien}</Table.Cell>
                    <Table.Cell>
                      {new Date(factura.FechaFTien).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(factura.FechaFTien).toLocaleTimeString()}
                    </Table.Cell>
                    <Table.Cell>{factura.CICliente}</Table.Cell>
                    <Table.Cell>
                      ${factura.MontoFTien.toLocaleString()}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p>No se han realizado compras</p>
          )}
          <Modal
            show={isCreatingFTienda}
            onClose={() => setIsCreatingFTienda(false)}
          >
            <Modal.Header>Crear Nueva Factura</Modal.Header>
            <Modal.Body>
              <fetcher.Form method="post" onSubmit={() => setIsCreatingFTienda(false)}>
                <Button
                  type="submit"
                  name="_action"
                  value="nuevaFTienda"
                  className="mb-2"
                  disabled={fetcher.state !== "idle"}
                >
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
                  {articulos.data.map((articulo) => (
                    <Table.Row key={articulo.CodArticuloT}>
                      <Table.Cell>{articulo.CodArticuloT}</Table.Cell>
                      <Table.Cell>{articulo.NombreArticuloT}</Table.Cell>
                      <Table.Cell>
                        ${articulo.Precio.toLocaleString()}
                      </Table.Cell>
                      <Table.Cell>
                        <TextInput
                          id={`Cantidad-${articulo.CodArticuloT}`}
                          name={`Cantidad-${articulo.CodArticuloT}`}
                          type="number"
                          defaultValue="0"
                          min="0"
                          onChange={(e) =>
                            handleCantidadChange(
                              articulo.CodArticuloT,
                              Number(e.target.value)
                            )
                          }
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Modal.Body>
          </Modal>
        </Tabs.Item>
      </Tabs>
    </div>
  );
}

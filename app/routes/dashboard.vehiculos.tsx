import { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { useState } from "react";
import { z } from "zod";
import { getCedulas } from "~/utils/clientes.server";
import { getMarcasSoloConModelos } from "~/utils/marcas.server";
import { vehiculoConForaneosSchema } from "~/utils/schemas";
import {
  addVehiculo,
  editVehiculo,
  getVehiculosConModelo,
} from "~/utils/vehiculos.server";

export async function loader() {
  return {
    vehiculos: await getVehiculosConModelo(),
    marcas: await getMarcasSoloConModelos(),
    cedulas: await getCedulas(),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "nuevo":
      return await addVehiculo(formData);
    case "editar":
      return await editVehiculo(formData);
  }
}

export default function DashboardVehiculos() {
  const { vehiculos, marcas, cedulas } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [marcaSelec, setMarcaSelec] = useState<number | null>(null);
  const [nuevoVehiculoModalOpen, setNuevoVehiculoModalOpen] = useState(false);
  const [editVehiculoModalOpen, setEditVehiculoModalOpen] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState<z.infer<
    typeof vehiculoConForaneosSchema
  > | null>(null);

  if (
    vehiculos.type === "error" ||
    marcas.type === "error" ||
    cedulas.type === "error"
  ) {
    return (
      <div className="p-6">
        <h1>Vehículos</h1>
        <p>{vehiculos.type === "error" ? vehiculos.message : null}</p>
        <p>{marcas.type === "error" ? marcas.message : null}</p>
        <p>{cedulas.type === "error" ? cedulas.message : null}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {vehiculos.data.length === 0 ? (
        <>
          <h1>Vehículos</h1>
          <p>No hay datos todavía</p>
          <Button
            type="button"
            className="mt-2"
            onClick={() => setNuevoVehiculoModalOpen(true)}
          >
            Registra al primer vehículo
          </Button>
        </>
      ) : (
        <>
          <h1>Vehículos</h1>
          <Button
            type="button"
            className="my-2"
            onClick={() => setNuevoVehiculoModalOpen(true)}
          >
            Nuevo vehículo
          </Button>
          <Table hoverable className="min-w-fit">
            <Table.Head>
              <Table.HeadCell>Placa</Table.HeadCell>
              <Table.HeadCell>Fecha de adquisición</Table.HeadCell>
              <Table.HeadCell>Tipo de aceite</Table.HeadCell>
              <Table.HeadCell>Marca</Table.HeadCell>
              <Table.HeadCell>Modelo</Table.HeadCell>
              <Table.HeadCell>Propietario</Table.HeadCell>
              <Table.HeadCell>Acciones</Table.HeadCell>
            </Table.Head>
            <Table.Body className="bg-white">
              {vehiculos.data.map((vehiculo) => (
                <Table.Row key={vehiculo.CodVehiculo}>
                  <Table.Cell>{vehiculo.PlacaVehic}</Table.Cell>
                  <Table.Cell>
                    {new Date(vehiculo.FechaAdq).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>{vehiculo.TipoAceite}</Table.Cell>
                  <Table.Cell>{vehiculo.NombreMarca}</Table.Cell>
                  <Table.Cell>{vehiculo.DescModelo}</Table.Cell>
                  <Table.Cell>{vehiculo.NombreCliente}</Table.Cell>
                  <Table.Cell>
                    <Select>
                      <option disabled selected>
                        Seleccionar...
                      </option>
                      <option
                        onClick={() => {
                          const fecha = new Date(vehiculo.FechaAdq);
                          setMarcaSelec(vehiculo.CodMarca);
                          setVehiculoEditando({ ...vehiculo, FechaAdq: fecha });
                          setEditVehiculoModalOpen(true);
                        }}
                      >
                        Editar
                      </option>
                      <option>Eliminar</option>
                    </Select>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </>
      )}
      <Modal
        show={nuevoVehiculoModalOpen}
        onClose={() => setNuevoVehiculoModalOpen(false)}
      >
        <Modal.Header>Nuevo vehículo</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setNuevoVehiculoModalOpen(false)}>
            <fieldset>
              <Label htmlFor="PlacaVehic">Número de placa</Label>
              <TextInput type="text" id="PlacaVehic" name="PlacaVehic" />
            </fieldset>
            <fieldset>
              <Label htmlFor="FechaAdq">Fecha de adquisición</Label>
              <TextInput type="date" id="FechaAdq" name="FechaAdq" />
            </fieldset>
            <fieldset>
              <Label htmlFor="TipoAceite">Tipo de aceite</Label>
              <TextInput type="text" id="TipoAceite" name="TipoAceite" />
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-8">
              <div>
                <Label htmlFor="CodMarca">Marca</Label>
                <Select id="CodMarca" name="CodMarca">
                  <option disabled selected>
                    Seleccionar...
                  </option>
                  {marcas.data.map((marca) => (
                    <option
                      key={marca.CodMarca}
                      value={marca.CodMarca}
                      selected={marcaSelec === marca.CodMarca}
                      onClick={() => setMarcaSelec(marca.CodMarca)}
                    >
                      {marca.NombreMarca}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="CodModelo">Modelo</Label>
                <Select id="CodModelo" name="CodModelo">
                  <option disabled selected>
                    Seleccionar...
                  </option>
                  {marcas.data
                    .find((marca) => marca.CodMarca === marcaSelec)
                    ?.Modelos.map((modelo) => (
                      <option key={modelo.CodModelo} value={modelo.CodModelo}>
                        {modelo.DescModelo}
                      </option>
                    ))}
                </Select>
              </div>
            </fieldset>
            <fieldset>
              <Label htmlFor="CIPropietario">Cédula del propietario</Label>
              <Select id="CIPropietario" name="CIPropietario">
                <option disabled selected>
                  Seleccionar...
                </option>
                {cedulas.data.map((cedula) => (
                  <option key={cedula} value={cedula}>
                    {cedula}
                  </option>
                ))}
              </Select>
            </fieldset>
            <Button
              type="submit"
              name="_action"
              value="nuevo"
              disabled={fetcher.state !== "idle"}
            >
              Crear
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal
        show={editVehiculoModalOpen}
        onClose={() => setEditVehiculoModalOpen(false)}
      >
        <Modal.Header>Editar cliente</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setEditVehiculoModalOpen(false)}>
            <fieldset>
              <Label htmlFor="PlacaVehic">Número de placa</Label>
              <TextInput
                type="text"
                id="PlacaVehic"
                name="PlacaVehic"
                defaultValue={vehiculoEditando?.PlacaVehic}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="FechaAdq">Fecha de adquisición</Label>
              <TextInput
                type="date"
                id="FechaAdq"
                name="FechaAdq"
                defaultValue={
                  vehiculoEditando?.FechaAdq.toISOString().split("T")[0]
                }
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="TipoAceite">Tipo de aceite</Label>
              <TextInput
                type="text"
                id="TipoAceite"
                name="TipoAceite"
                defaultValue={vehiculoEditando?.TipoAceite}
              />
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-8">
              <div>
                <Label htmlFor="CodMarca">Marca</Label>
                <Select id="CodMarca" name="CodMarca">
                  {marcas.data.map((marca) => (
                    <option
                      key={marca.CodMarca}
                      value={marca.CodMarca}
                      selected={marcaSelec === marca.CodMarca}
                      onClick={() => setMarcaSelec(marca.CodMarca)}
                    >
                      {marca.NombreMarca}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="CodModelo">Modelo</Label>
                <Select id="CodModelo" name="CodModelo">
                  <option disabled selected>
                    Seleccionar...
                  </option>
                  {marcas.data
                    .find((marca) => marca.CodMarca === marcaSelec)
                    ?.Modelos.map((modelo) => (
                      <option key={modelo.CodModelo} value={modelo.CodModelo}>
                        {modelo.DescModelo}
                      </option>
                    ))}
                </Select>
              </div>
            </fieldset>
            <fieldset>
              <Label htmlFor="CIPropietario">Cédula del propietario</Label>
              <Select id="CIPropietario" name="CIPropietario">
                {cedulas.data.map((cedula) => (
                  <option key={cedula} value={cedula}>
                    {cedula}
                  </option>
                ))}
              </Select>
            </fieldset>
            <input type="hidden" name="CodVehiculo" value={vehiculoEditando?.CodVehiculo} />
            <Button
              type="submit"
              name="_action"
              value="editar"
              disabled={fetcher.state !== "idle"}
            >
              Actualizar
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

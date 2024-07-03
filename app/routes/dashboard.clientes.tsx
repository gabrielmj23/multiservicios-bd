import { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { useState } from "react";
import { addCliente, editCliente, getClientes } from "~/utils/clientes.server";

export async function loader() {
  return getClientes();
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "nuevo":
      return await addCliente(formData);
    case "editar":
      return await editCliente(formData);
  }
}

export default function DashboardClientes() {
  const clientes = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [nuevoClienteModalOpen, setNuevoClienteModalOpen] = useState(false);
  const [editClienteModalOpen, setEditClienteModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<{
    CICliente: string;
    NombreCliente: string;
    Tlf1: string;
    Tlf2: string;
    EmailCliente: string;
  } | null>(null);

  if (clientes.type === "error") {
    return <div>{clientes.message}</div>;
  }

  return (
    <div className="p-6">
      {clientes.data.length === 0 ? (
        <>
          <p>No hay datos todavía</p>
          <Button
            type="button"
            className="mt-2"
            onClick={() => setNuevoClienteModalOpen(true)}
          >
            Registra al primer cliente
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            className="my-2"
            onClick={() => setNuevoClienteModalOpen(true)}
          >
            Nuevo cliente
          </Button>
          <Table hoverable className="min-w-fit">
            <Table.Head>
              <Table.HeadCell>Cédula</Table.HeadCell>
              <Table.HeadCell>Nombre</Table.HeadCell>
              <Table.HeadCell>Teléfono 1</Table.HeadCell>
              <Table.HeadCell>Teléfono 2</Table.HeadCell>
              <Table.HeadCell>Correo electrónico</Table.HeadCell>
              <Table.HeadCell>Acciones</Table.HeadCell>
            </Table.Head>
            <Table.Body className="bg-white">
              {clientes.data.map((cliente) => (
                <Table.Row key={cliente.CICliente}>
                  <Table.Cell>{cliente.CICliente}</Table.Cell>
                  <Table.Cell>{cliente.NombreCliente}</Table.Cell>
                  <Table.Cell>{cliente.Tlf1}</Table.Cell>
                  <Table.Cell>{cliente.Tlf2}</Table.Cell>
                  <Table.Cell>{cliente.EmailCliente}</Table.Cell>
                  <Table.Cell>
                    <Select>
                      <option disabled selected>
                        Seleccionar...
                      </option>
                      <option
                        onClick={() => {
                          setClienteEditando(cliente);
                          setEditClienteModalOpen(true);
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
        show={nuevoClienteModalOpen}
        onClose={() => setNuevoClienteModalOpen(false)}
      >
        <Modal.Header>Nuevo cliente</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post">
            <fieldset>
              <Label htmlFor="CICliente">Cédula</Label>
              <TextInput
                type="text"
                id="CICliente"
                name="CICliente"
                placeholder="V123456"
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="NombreCliente">Nombre</Label>
              <TextInput
                type="text"
                id="NombreCliente"
                name="NombreCliente"
                placeholder="Pedro Pérez"
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="Tlf1">Teléfono 1</Label>
              <TextInput
                type="tel"
                id="Tlf1"
                name="Tlf1"
                placeholder="0412-1234567"
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="Tlf2">Teléfono 2</Label>
              <TextInput
                type="tel"
                id="Tlf2"
                name="Tlf2"
                placeholder="0412-1234567"
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="EmailCliente">Correo electrónico</Label>
              <TextInput
                type="email"
                id="EmailCliente"
                name="EmailCliente"
                placeholder="pperez@gmail.com"
              />
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
        show={editClienteModalOpen}
        onClose={() => setEditClienteModalOpen(false)}
      >
        <Modal.Header>Editar cliente</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post">
            <fieldset>
              <Label htmlFor="CICliente">Cédula</Label>
              <TextInput
                readOnly
                type="text"
                id="CICliente"
                name="CICliente"
                value={clienteEditando?.CICliente}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="NombreCliente">Nombre</Label>
              <TextInput
                type="text"
                id="NombreCliente"
                name="NombreCliente"
                defaultValue={clienteEditando?.NombreCliente}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="Tlf1">Teléfono 1</Label>
              <TextInput
                type="tel"
                id="Tlf1"
                name="Tlf1"
                defaultValue={clienteEditando?.Tlf1}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="Tlf2">Teléfono 2</Label>
              <TextInput
                type="tel"
                id="Tlf2"
                name="Tlf2"
                defaultValue={clienteEditando?.Tlf2}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="EmailCliente">Correo electrónico</Label>
              <TextInput
                type="email"
                id="EmailCliente"
                name="EmailCliente"
                defaultValue={clienteEditando?.EmailCliente}
              />
            </fieldset>
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

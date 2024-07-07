import { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { getLineas } from "~/utils/inventario.server";
import {
  addProveedor,
  editProveedor,
  eliminarProveedor,
  getProveedores,
} from "~/utils/proveedores.server";
import { proveedorSchema } from "~/utils/schemas";

export async function loader() {
  return {
    proveedores: await getProveedores(),
    lineas: await getLineas(),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (String(formData.get("_action"))) {
    case "nuevoProv":
      return await addProveedor(formData);
    case "editarProv":
      return await editProveedor(formData);
    case "elimProv":
      return await eliminarProveedor(formData);
  }
}

export default function DashboardProveedores() {
  const { proveedores, lineas } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [provEditing, setProvEditing] = useState<z.infer<
    typeof proveedorSchema
  > | null>(null);
  const [rifElim, setRifElim] = useState("");

  if (proveedores.type === "error" || lineas.type === "error") {
    return (
      <div className="p-6">
        <h1>Proveedores</h1>
        <p>{proveedores.type === "error" ? proveedores.message : null}</p>
        <p>{lineas.type === "error" ? lineas.message : null}</p>
      </div>
    );
  }
  
  if (fetcher.data?.type === "error") {
    toast.error(fetcher.data.message, {
      id: "error-toast",
    });
  }

  return (
    <div className="p-6 w-4/5">
      <h1>Proveedores</h1>
      <Button
        type="button"
        className="mb-4"
        onClick={() => setIsCreating(true)}
      >
        Nuevo proveedor
      </Button>
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>RIF</Table.HeadCell>
          <Table.HeadCell>Razón social</Table.HeadCell>
          <Table.HeadCell>Dirección</Table.HeadCell>
          <Table.HeadCell>Teléfono de local</Table.HeadCell>
          <Table.HeadCell>Teléfono celular</Table.HeadCell>
          <Table.HeadCell>Persona de contacto</Table.HeadCell>
          <Table.HeadCell>Línea de suministro</Table.HeadCell>
          <Table.HeadCell>Acciones</Table.HeadCell>
        </Table.Head>
        <Table.Body className="bg-white">
          {proveedores.data.map((proveedor) => (
            <Table.Row key={proveedor.RIFProv}>
              <Table.Cell>{proveedor.RIFProv}</Table.Cell>
              <Table.Cell>{proveedor.RazonProv}</Table.Cell>
              <Table.Cell>{proveedor.DireccionProv}</Table.Cell>
              <Table.Cell>{proveedor.TlfLocal}</Table.Cell>
              <Table.Cell>{proveedor.TlfCelular}</Table.Cell>
              <Table.Cell>{proveedor.PersonaCont}</Table.Cell>
              <Table.Cell>
                {
                  lineas.data.find(
                    (linea) => linea.CodLinea === proveedor.CodLinea
                  )?.NombreLinea
                }
              </Table.Cell>
              <Table.Cell>
                <Select>
                  <option disabled selected>
                    Seleccionar...
                  </option>
                  <option
                    onClick={() => {
                      setProvEditing(proveedor);
                      setIsEditing(true);
                    }}
                  >
                    Editar
                  </option>
                  <option onClick={() => setRifElim(proveedor.RIFProv)}>
                    Eliminar
                  </option>
                </Select>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Modal show={isCreating} onClose={() => setIsCreating(false)}>
        <Modal.Header>Nuevo proveedor</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post">
            <fieldset className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="RIFProv">RIF</Label>
                <TextInput id="RIFProv" name="RIFProv" required />
              </div>
              <div>
                <Label htmlFor="RazonProv">Razón social</Label>
                <TextInput id="RazonProv" name="RazonProv" required />
              </div>
              <div>
                <Label htmlFor="TlfLocal">Teléfono de local</Label>
                <TextInput id="TlfLocal" name="TlfLocal" required type="tel" />
              </div>
              <div>
                <Label htmlFor="TlfCelular">Teléfono celular</Label>
                <TextInput
                  id="TlfCelular"
                  name="TlfCelular"
                  required
                  type="tel"
                />
              </div>
            </fieldset>
            <fieldset>
              <Label htmlFor="DireccionProv">Dirección</Label>
              <TextInput id="DireccionProv" name="DireccionProv" required />
            </fieldset>
            <fieldset>
              <Label htmlFor="PersonaCont">Persona de contacto</Label>
              <TextInput id="PersonaCont" name="PersonaCont" required />
            </fieldset>
            <fieldset>
              <Label htmlFor="CodLinea">Línea de suministro</Label>
              <Select id="CodLinea" name="CodLinea" required>
                <option disabled selected>
                  Seleccionar...
                </option>
                {lineas.data.map((linea) => (
                  <option key={linea.CodLinea} value={linea.CodLinea}>
                    {linea.NombreLinea}
                  </option>
                ))}
              </Select>
            </fieldset>
            <Button
              type="submit"
              name="_action"
              value="nuevoProv"
              disabled={fetcher.state !== "idle"}
            >
              Crear
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal show={isEditing} onClose={() => setIsEditing(false)}>
        <Modal.Header>Editar proveedor</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post">
            <fieldset className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="RIFProv">RIF</Label>
                <TextInput
                  id="RIFProv"
                  name="RIFProv"
                  value={provEditing?.RIFProv}
                  readOnly
                  required
                />
              </div>
              <div>
                <Label htmlFor="RazonProv">Razón social</Label>
                <TextInput
                  id="RazonProv"
                  name="RazonProv"
                  required
                  defaultValue={provEditing?.RazonProv}
                />
              </div>
              <div>
                <Label htmlFor="TlfLocal">Teléfono de local</Label>
                <TextInput
                  id="TlfLocal"
                  name="TlfLocal"
                  required
                  type="tel"
                  defaultValue={provEditing?.RazonProv}
                />
              </div>
              <div>
                <Label htmlFor="TlfCelular">Teléfono celular</Label>
                <TextInput
                  id="TlfCelular"
                  name="TlfCelular"
                  required
                  type="tel"
                  defaultValue={provEditing?.TlfCelular}
                />
              </div>
            </fieldset>
            <fieldset>
              <Label htmlFor="DireccionProv">Dirección</Label>
              <TextInput
                id="DireccionProv"
                name="DireccionProv"
                required
                defaultValue={provEditing?.DireccionProv}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="PersonaCont">Persona de contacto</Label>
              <TextInput
                id="PersonaCont"
                name="PersonaCont"
                required
                defaultValue={provEditing?.PersonaCont}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="CodLinea">Línea de suministro</Label>
              <Select id="CodLinea" name="CodLinea" required>
                {lineas.data.map((linea) => (
                  <option
                    key={linea.CodLinea}
                    value={linea.CodLinea}
                    selected={linea.CodLinea === provEditing?.CodLinea}
                  >
                    {linea.NombreLinea}
                  </option>
                ))}
              </Select>
            </fieldset>
            <Button
              type="submit"
              name="_action"
              value="editarProv"
              disabled={fetcher.state !== "idle"}
            >
              Editar
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal show={rifElim !== ""} onClose={() => setRifElim("")}>
        <Modal.Header>Eliminar proveedor</Modal.Header>
        <Modal.Body>
          <p className="mb-4">¿Está seguro que desea eliminar el proveedor?</p>
          <fetcher.Form method="post">
            <input type="hidden" name="RIFProv" value={rifElim} />
            <Button
              type="submit"
              color="failure"
              name="_action"
              value="elimProv"
              disabled={fetcher.state !== "idle"}
            >
              Eliminar
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

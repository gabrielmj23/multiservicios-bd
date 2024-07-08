import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { getSession } from "~/session";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { useState } from "react";
import {
  getArticulosTienda,
  addArticuloTienda,
  editarArticuloTienda,
  eliminarArticuloTienda,
} from "~/utils/tienda.server";
import toast from "react-hot-toast";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session || session.has("error")) {
    return redirect("/");
  }
  const RIFSuc = session.get("RIFSuc");
  if (!RIFSuc) {
    return redirect("/");
  }
  return getArticulosTienda(RIFSuc);
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
    case "nuevoArticulo":
      return await addArticuloTienda(formData, RIFSuc);
    case "editarArticulo":
      return await editarArticuloTienda(formData);
    case "eliminar":
      return await eliminarArticuloTienda(formData);
  }
}

export default function DashboardArticulosTienda() {
  const articulos = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingArticulo, setEditingArticulo] = useState<{
    RIFSuc: string;
    CodArticuloT: number;
    NombreArticuloT: string;
    Precio: number;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [codArtElim, setCodArtElim] = useState(0);
  const [isElim, setIsElim] = useState(false);

  if (articulos.type === "error") {
    return (
      <div className="p-6">
        <h1>Artículos</h1>
        <p>{articulos.message}</p>
      </div>
    );
  }

  if (fetcher.data?.type === "error") {
    toast.error(fetcher.data.message, {
      id: "error-toast",
    });
  }

  return (
    <div className="p-6 w-1/2">
      <h1>Artículos de la Tienda</h1>
      <div className="flex items-center mb-2">
        <Button
          className="mr-2"
          type="button"
          onClick={() => setIsCreating(true)}
        >
          Nuevo artículo
        </Button>
      </div>
      {articulos.data.length > 0 ? (
        <Table hoverable className="min-w-fit">
          <Table.Head>
            <Table.HeadCell>Código</Table.HeadCell>
            <Table.HeadCell>Nombre</Table.HeadCell>
            <Table.HeadCell>Precio</Table.HeadCell>
            <Table.HeadCell>Acciones</Table.HeadCell>
          </Table.Head>
          <Table.Body className="bg-gray-100">
            {articulos &&
              articulos.data &&
              articulos.data.map((articulo) => (
                <Table.Row key={articulo.CodArticuloT}>
                  <Table.Cell>{articulo.CodArticuloT}</Table.Cell>
                  <Table.Cell>{articulo.NombreArticuloT}</Table.Cell>
                  <Table.Cell>${articulo.Precio.toLocaleString()}</Table.Cell>
                  <Table.Cell>
                    <Select>
                      <option disabled selected>
                        Seleccionar...
                      </option>
                      <option
                        onClick={() => {
                          setEditingArticulo(articulo);
                          setIsEditing(true);
                        }}
                      >
                        Editar
                      </option>
                      <option
                        onClick={() => {
                          setCodArtElim(articulo.CodArticuloT);
                          setIsElim(true);
                        }}
                      >
                        Eliminar
                      </option>
                    </Select>
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      ) : (
        <p>No hay artículos en la tienda</p>
      )}
      <Modal show={isCreating} onClose={() => setIsCreating(false)}>
        <Modal.Header>Crear artículo</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsCreating(false)}>
            <fieldset>
              <Label htmlFor="NombreArticuloT">Nombre del artículo</Label>
              <TextInput
                id="NombreArticuloT"
                name="NombreArticuloT"
                type="text"
                placeholder="Nombre del artículo"
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="Precio">Precio</Label>
              <TextInput
                id="Precio"
                name="Precio"
                type="number"
                placeholder="Precio"
              />
            </fieldset>
            <Button type="submit" name="_action" value="nuevoArticulo">
              Crear
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal show={isEditing} onClose={() => setIsEditing(false)}>
        <Modal.Header>Editar artículo</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsEditing(false)}>
            <input
              type="hidden"
              name="CodArticuloT"
              value={editingArticulo?.CodArticuloT}
            />
            <fieldset>
              <Label htmlFor="NombreArticuloT">Nombre del artículo</Label>
              <TextInput
                id="NombreArticuloT"
                name="NombreArticuloT"
                type="text"
                defaultValue={editingArticulo?.NombreArticuloT}
                placeholder="Nombre del artículo"
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="Precio">Precio</Label>
              <TextInput
                id="Precio"
                name="Precio"
                type="number"
                defaultValue={editingArticulo?.Precio}
                placeholder="Precio"
              />
            </fieldset>
            <Button
              type="submit"
              name="_action"
              value="editarArticulo"
              disabled={fetcher.state !== "idle"}
            >
              Guardar cambios
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal show={isElim} onClose={() => setIsElim(false)} size="md">
        <Modal.Header>Eliminar artículo</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsElim(false)}>
            <input type="hidden" name="CodArticuloT" value={codArtElim} />
            <p>¿Está seguro que desea eliminar este artículo?</p>
            <div className="grid grid-cols-2 mt-2 gap-6">
              <Button
                type="submit"
                color="failure"
                name="_action"
                value="eliminar"
              >
                Si
              </Button>
              <Button
                type="button"
                color="gray"
                onClick={() => setIsElim(false)}
              >
                No
              </Button>
            </div>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

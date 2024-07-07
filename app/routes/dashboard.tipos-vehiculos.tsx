import { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button, Label, Modal, TextInput } from "flowbite-react";
import { useState } from "react";
import { addTipo, getTipos } from "~/utils/tipos.server";

export async function loader() {
  return await getTipos();
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  return await addTipo(formData);
}

export default function DashboardTipos() {
  const tipos = useLoaderData<typeof loader>();
  const [isCreating, setIsCreating] = useState(false);
  const fetcher = useFetcher();

  if (tipos.type === "error") {
    return <div className="p-6">{tipos.message}</div>;
  }
  return (
    <div className="p-6">
      <h1>Tipos de Vehículos</h1>
      {tipos.data.length === 0 ? (
        <>
          <p>No hay tipos registrados</p>
          <Button
            className="mt-2"
            type="button"
            onClick={() => setIsCreating(true)}
          >
            Crea el primero
          </Button>
        </>
      ) : (
        <>
          <Button
            className="my-2"
            type="button"
            onClick={() => setIsCreating(true)}
          >
            Agregar tipo
          </Button>
          <ul className="ps-6 pt-2">
            {tipos.data.map((tipo) => (
              <li key={tipo.CodTipo} className="list-disc text-lg">{tipo.NombreTipo}</li>
            ))}
          </ul>
        </>
      )}
      <Modal show={isCreating} onClose={() => setIsCreating(false)}>
        <Modal.Header>Nuevo tipo de vehículo</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post">
            <fieldset>
              <Label htmlFor="NombreTipo">Nombre del tipo</Label>
              <TextInput id="NombreTipo" name="NombreTipo" type="text" />
            </fieldset>
            <Button type="submit">Guardar</Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

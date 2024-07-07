import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, redirect, useFetcher, useLoaderData } from "@remix-run/react";
import { Button, Label, Modal, Select, TextInput } from "flowbite-react";
import { useState } from "react";
import { commitSession, getSession } from "~/session";
import { addSucursal, getSucursalesInicio } from "~/utils/sucursales.server";

export const meta: MetaFunction = () => {
  return [{ title: "Multiservicios Mundial | Inicio" }];
};

export async function loader() {
  return {
    sucursales: await getSucursalesInicio(),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = String(formData.get("_action"));
  switch (action) {
    case "nuevaSuc":
      return await addSucursal(formData);
    case "ingresar": {
      const session = await getSession(request.headers.get("Cookie"));
      session.set("RIFSuc", String(formData.get("RIFSuc")));
      return redirect("/dashboard", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  }
}

export default function Index() {
  const { sucursales } = useLoaderData<typeof loader>();
  const [isCreating, setIsCreating] = useState(false);
  const fetcher = useFetcher();
  return (
    <div
      id="login-container"
      className="min-w-full h-screen flex flex-col justify-center items-center"
    >
      <h1 className="text-4xl mb-6">Multiservicios Mundial</h1>
      {sucursales.type === "error" ? (
        <p>Error al cargar las sucursales</p>
      ) : (
        <>
          <Form className="flex flex-col gap-3 min-w-80" method="post">
            <h2 className="text-center">Seleccione una sucursal</h2>
            <fieldset>
              <Label htmlFor="RIFSuc">Sucursal</Label>
              <Select id="RIFSuc" name="RIFSuc" required>
                {sucursales.data.map((sucursal) => (
                  <option key={sucursal.RIFSuc} value={sucursal.RIFSuc}>
                    {sucursal.NombreSuc}
                  </option>
                ))}
              </Select>
            </fieldset>
            <Button type="submit" name="_action" value="ingresar">
              Ingresar
            </Button>
            <Button
              color="success"
              type="button"
              onClick={() => setIsCreating(true)}
            >
              Registrar sucursal
            </Button>
          </Form>
          <Modal show={isCreating} onClose={() => setIsCreating(false)}>
            <Modal.Header>Registrar sucursal</Modal.Header>
            <Modal.Body>
              <fetcher.Form method="post" onSubmit={() => setIsCreating(false)}>
                <fieldset>
                  <Label htmlFor="RIFSuc">RIF</Label>
                  <TextInput
                    type="text"
                    id="RIFSuc"
                    name="RIFSuc"
                    required
                    minLength={1}
                    maxLength={12}
                  />
                </fieldset>
                <fieldset>
                  <Label htmlFor="NombreSuc">Nombre</Label>
                  <TextInput
                    type="text"
                    id="NombreSuc"
                    name="NombreSuc"
                    required
                    minLength={1}
                    maxLength={20}
                  />
                </fieldset>
                <fieldset>
                  <Label htmlFor="CiudadSuc">Ciudad</Label>
                  <TextInput
                    type="text"
                    id="CiudadSuc"
                    name="CiudadSuc"
                    required
                    minLength={1}
                    maxLength={30}
                  />
                </fieldset>
                <Button
                  type="submit"
                  name="_action"
                  value="nuevaSuc"
                  disabled={fetcher.state !== "idle"}
                >
                  Registrar
                </Button>
              </fetcher.Form>
            </Modal.Body>
          </Modal>
        </>
      )}
    </div>
  );
}

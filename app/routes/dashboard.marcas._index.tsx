import { ActionFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  Accordion,
  Button,
  Label,
  Modal,
  Select,
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { addMarca, getMarcasConModelos } from "~/utils/marcas.server";
import { addModelo } from "~/utils/modelos.server";
import { getTipos } from "~/utils/tipos.server";

export async function loader() {
  return {
    marcas: await getMarcasConModelos(),
    tiposVehiculos: await getTipos(),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (String(formData.get("_action"))) {
    case "nuevaMarca":
      return await addMarca(formData);
    case "nuevoModelo":
      return await addModelo(formData);
  }
}

export default function DashboardMarcas() {
  const { marcas, tiposVehiculos } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingModelo, setIsCreatingModelo] = useState(false);
  const [codMarcaModelo, setCodMarcaModelo] = useState(0);
  if (marcas.type === "error" || tiposVehiculos.type === "error") {
    return (
      <div className="p-6">
        <h1>Marcas de vehículos</h1>
        <p>{marcas.message ?? tiposVehiculos.message}</p>
      </div>
    );
  }
  return (
    <div className="p-6 w-1/2">
      <h1>Marcas de vehículos</h1>
      {marcas.data.length === 0 ? (
        <>
          <p>No hay marcas todavía</p>
          <Button
            className="mt-2"
            type="button"
            onClick={() => setIsCreating(true)}
          >
            Agrega la primera marca
          </Button>
        </>
      ) : (
        <>
          <Button
            className="my-2"
            type="button"
            onClick={() => setIsCreating(true)}
          >
            Nueva marca
          </Button>
          <Accordion>
            {marcas.data.map((marca) => (
              <Accordion.Panel key={marca.CodMarca}>
                <Accordion.Title>{marca.NombreMarca}</Accordion.Title>
                <Accordion.Content className="bg-gray-50">
                  <ul>
                    {marca.Modelos.map((modelo, index) =>
                      modelo.CodModelo === null ? (
                        <li key={marca.CodMarca + "-" + index}>Sin modelos</li>
                      ) : (
                        <li
                          key={marca.CodMarca + "-" + index}
                          className="list-disc"
                        >
                          <Link
                            to={`${marca.CodMarca}/modelos/${modelo.CodModelo}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {modelo.DescModelo}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                  <Button
                    type="button"
                    className="mt-3"
                    onClick={() => {
                      setIsCreatingModelo(true);
                      setCodMarcaModelo(marca.CodMarca);
                    }}
                  >
                    Nuevo modelo
                  </Button>
                </Accordion.Content>
              </Accordion.Panel>
            ))}
          </Accordion>
        </>
      )}
      <Modal show={isCreating} onClose={() => setIsCreating(false)}>
        <Modal.Header>Nueva marca</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsCreating(false)}>
            <fieldset>
              <Label htmlFor="NombreMarca">Nombre de la marca</Label>
              <TextInput
                id="NombreMarca"
                name="NombreMarca"
                type="text"
              ></TextInput>
            </fieldset>
            <Button type="submit" name="_action" value="nuevaMarca">
              Crear
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal show={isCreatingModelo} onClose={() => setIsCreatingModelo(false)}>
        <Modal.Header>Nuevo modelo</Modal.Header>
        <Modal.Body>
          <fetcher.Form method="post" onSubmit={() => setIsCreatingModelo(false)}>
            <fieldset>
              <Label htmlFor="DescModelo">Descripción</Label>
              <TextInput
                id="DescModelo"
                name="DescModelo"
                type="text"
              ></TextInput>
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-8">
              <div>
                <Label htmlFor="NumPuestos">Número de puestos</Label>
                <TextInput
                  id="NumPuestos"
                  name="NumPuestos"
                  type="number"
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="Peso">Peso</Label>
                <TextInput id="Peso" name="Peso" type="number" min="1" />
              </div>
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-8">
              <div>
                <Label htmlFor="TipoAcMotor">Tipo de aceite de motor</Label>
                <TextInput id="TipoAcMotor" name="TipoAcMotor" type="text" />
              </div>
              <div>
                <Label htmlFor="TipoAcCaja">Tipo de aceite de caja</Label>
                <TextInput id="TipoAcCaja" name="TipoAcCaja" type="text" />
              </div>
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-8">
              <div>
                <Label htmlFor="Octan">Octanaje</Label>
                <TextInput
                  id="Octan"
                  name="Octan"
                  type="number"
                  min="87"
                  max="91"
                />
              </div>
              <div>
                <Label htmlFor="TipoRefri">Tipo de refrigerante</Label>
                <TextInput id="TipoRefri" name="TipoRefri" type="text" />
              </div>
            </fieldset>
            <fieldset>
              <Label htmlFor="CodTipo">Tipo de vehículo</Label>
              <Select id="CodTipo" name="CodTipo">
                {tiposVehiculos.data.map((tipo) => (
                  <option key={tipo.CodTipo} value={tipo.CodTipo}>
                    {tipo.NombreTipo}
                  </option>
                ))}
              </Select>
            </fieldset>
            <input type="hidden" name="CodMarca" value={codMarcaModelo} />
            <Button type="submit" name="_action" value="nuevoModelo">
              Crear
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

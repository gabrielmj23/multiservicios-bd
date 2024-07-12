import {
  getInsumos,
  addInsumo,
  editInsumo,
  getLineas,
  addLinea,
  editLinea,
  deleteInsumo,
  deleteLinea,
  getInventariosFisicos,
  addInventarioFisico,
} from "../utils/inventario.server";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import {
  Button,
  Label,
  Modal,
  Select,
  Table,
  Tabs,
  TextInput,
  ToggleSwitch,
} from "flowbite-react";
import { insumoSchema, lineaSchema } from "~/utils/schemas";
import { z } from "zod";
import { ActionFunctionArgs } from "@remix-run/node";
import toast from "react-hot-toast";

export async function loader() {
  return {
    insumos: await getInsumos(),
    lineas: await getLineas(),
    inventariosFisicos: await getInventariosFisicos(),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (String(formData.get("_action"))) {
    case "nuevo":
      return await addInsumo(formData);
    case "editar":
      return await editInsumo(formData);
    case "eliminarInsumo":
      return await deleteInsumo(formData);
    case "nuevoLinea":
      return await addLinea(formData);
    case "editarLinea":
      return await editLinea(formData);
    case "eliminarLinea":
      return await deleteLinea(formData);
    case "nuevoInventario":
      return await addInventarioFisico(formData);
  }
}

export default function DashboardInventario() {
  const { insumos, lineas, inventariosFisicos } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [nuevoInsumoModalOpen, setNuevoInsumoModalOpen] = useState(false);
  const [esEco, setEsEco] = useState(false);
  const [editInsumoModalOpen, setEditInsumoModalOpen] = useState(false);
  const [insumoEditando, setInsumoEditando] = useState<z.infer<
    typeof insumoSchema
  > | null>(null);
  const [eliminarInsumoModalOpen, setEliminarInsumoModalOpen] = useState(false);
  const [insumoEliminando, setInsumoEliminando] = useState<z.infer<
    typeof insumoSchema
  > | null>(null);

  const [nuevoLineaModalOpen, setNuevoLineaModalOpen] = useState(false);
  const [editLineaModalOpen, setEditLineaModalOpen] = useState(false);
  const [lineaEditando, setLineaEditando] = useState<z.infer<
    typeof lineaSchema
  > | null>(null);
  const [eliminarLineaModalOpen, setEliminarLineaModalOpen] = useState(false);
  const [lineaEliminando, setLineaEliminando] = useState<z.infer<
    typeof lineaSchema
  > | null>(null);

  const [nuevoInventarioModalOpen, setNuevoInventarioModalOpen] =
    useState(false);

  const handleSelectChange = (linea) => (e) => {
    const selectedAction = e.target.value;
    if (selectedAction === "editar") {
      setLineaEditando(linea);
      setEditLineaModalOpen(true);
      console.log(editLineaModalOpen);
    } else if (selectedAction === "eliminar") {
      setEliminarLineaModalOpen(true);
      setLineaEliminando(linea);
    }
  };

  const handleInsumoSelectChange = (insumo) => (e) => {
    const selectedAction = e.target.value;
    if (selectedAction === "editar") {
      setInsumoEditando(insumo);
      setEditInsumoModalOpen(true);
    } else if (selectedAction === "eliminar") {
      setInsumoEliminando(insumo);
      setEliminarInsumoModalOpen(true);
    }
  };

  if (
    insumos.type === "error" ||
    lineas.type === "error" ||
    inventariosFisicos.type === "error"
  ) {
    return (
      <div>
        <h1>Inventario</h1>
        <p>{insumos.type === "error" ? insumos.message : null}</p>
        <p>{lineas.type === "error" ? lineas.message : null}</p>
        <p>
          {inventariosFisicos.type === "error"
            ? inventariosFisicos.message
            : null}
        </p>
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
      <h1>Inventario</h1>
      <Tabs>
        <Tabs.Item title="Insumos">
          {insumos.data.length === 0 ? (
            <>
              <p>No hay insumos todavía</p>
              <Button
                type="button"
                className="mt-2"
                onClick={() => setNuevoInsumoModalOpen(true)}
              >
                Registra al primer insumo
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                className="my-2"
                onClick={() => setNuevoInsumoModalOpen(true)}
              >
                Nuevo insumo
              </Button>
              <div className="overflow-x-auto">
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Nombre</Table.HeadCell>
                    <Table.HeadCell>Descripcion</Table.HeadCell>
                    <Table.HeadCell>Fabricante</Table.HeadCell>
                    <Table.HeadCell>Es ecológico</Table.HeadCell>
                    <Table.HeadCell>Precio</Table.HeadCell>
                    <Table.HeadCell>Existencias</Table.HeadCell>
                    <Table.HeadCell>Mínimo</Table.HeadCell>
                    <Table.HeadCell>Máximo</Table.HeadCell>
                    <Table.HeadCell>Unidad de medida</Table.HeadCell>
                    <Table.HeadCell>Línea de suministro</Table.HeadCell>
                    <Table.HeadCell>Opción</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="bg-white">
                    {insumos.data.map((insumo) => (
                      <Table.Row key={insumo.CodIns}>
                        <Table.Cell>{insumo.NombreIns}</Table.Cell>
                        <Table.Cell>{insumo.DescripcionIns}</Table.Cell>
                        <Table.Cell>{insumo.FabricanteIns}</Table.Cell>
                        <Table.Cell>{insumo.EsEco ? "Sí" : "No"}</Table.Cell>
                        <Table.Cell>{insumo.PrecioIns}</Table.Cell>
                        <Table.Cell>{insumo.ExistIns}</Table.Cell>
                        <Table.Cell>{insumo.MinIns}</Table.Cell>
                        <Table.Cell>{insumo.MaxIns}</Table.Cell>
                        <Table.Cell>{insumo.UMedida}</Table.Cell>
                        <Table.Cell>
                          {
                            lineas.data.find(
                              (linea) => linea.CodLinea === insumo.CodLinea
                            )?.NombreLinea
                          }
                        </Table.Cell>
                        <Table.Cell>
                          <Select onChange={handleInsumoSelectChange(insumo)}>
                            <option value="" disabled selected>
                              Seleccionar...
                            </option>
                            <option value="editar">Editar</option>
                            <option value="eliminar">Eliminar</option>
                          </Select>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </>
          )}
        </Tabs.Item>
        <Tabs.Item title="Líneas de suministro">
          {lineas.data.length === 0 ? (
            <>
              <p>No hay líneas todavía</p>
              <Button
                type="button"
                className="mt-2"
                onClick={() => setNuevoLineaModalOpen(true)}
              >
                Registra la primera línea
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                className="my-2"
                onClick={() => setNuevoLineaModalOpen(true)}
              >
                Nueva línea
              </Button>
              <Table hoverable className="min-w-fit">
                <Table.Head>
                  <Table.HeadCell>Código</Table.HeadCell>
                  <Table.HeadCell>Nombre</Table.HeadCell>
                  <Table.HeadCell>Acción</Table.HeadCell>
                </Table.Head>
                <Table.Body className="bg-white">
                  {lineas.data.map((linea) => (
                    <Table.Row key={linea.CodLinea}>
                      <Table.Cell>{linea.CodLinea}</Table.Cell>
                      <Table.Cell>{linea.NombreLinea}</Table.Cell>
                      <Table.Cell>
                        <Select onChange={handleSelectChange(linea)}>
                          <option value="" disabled selected>
                            Seleccionar...
                          </option>
                          <option value="editar">Editar</option>
                          <option value="eliminar">Eliminar</option>
                        </Select>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </>
          )}
        </Tabs.Item>
      </Tabs>
      <Modal
        show={nuevoInsumoModalOpen}
        onClose={() => setNuevoInsumoModalOpen(false)}
      >
        <Modal.Header>Nuevo insumo</Modal.Header>
        <Modal.Body>
          <fetcher.Form
            method="post"
            onSubmit={() => setNuevoInsumoModalOpen(false)}
          >
            <fieldset>
              <Label htmlFor="NombreIns">Nombre</Label>
              <TextInput type="text" id="NombreIns" name="NombreIns" required />
            </fieldset>
            <fieldset>
              <Label htmlFor="DescripcionIns">Descripción</Label>
              <TextInput
                type="text"
                id="DescripcionIns"
                name="DescripcionIns"
                required
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="FabricanteIns">Fabricante</Label>
              <TextInput
                type="text"
                id="FabricanteIns"
                name="FabricanteIns"
                required
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="PrecioIns">Precio</Label>
              <TextInput
                type="number"
                id="PrecioIns"
                name="PrecioIns"
                step="0.01"
                required
              />
            </fieldset>
            <fieldset className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="ExistIns">Existencias</Label>
                <TextInput
                  type="number"
                  id="ExistIns"
                  name="ExistIns"
                  required
                />
              </div>
              <div>
                <Label htmlFor="MinIns">Mínimo</Label>
                <TextInput type="number" id="MinIns" name="MinIns" required />
              </div>
              <div>
                <Label htmlFor="MaxIns">Máximo</Label>
                <TextInput type="number" id="MaxIns" name="MaxIns" required />
              </div>
            </fieldset>
            <fieldset>
              <Label htmlFor="Umedida">Unidad de medida</Label>
              <TextInput type="text" id="Umedida" name="Umedida" required />
            </fieldset>
            <fieldset>
              <Label htmlFor="CodLinea">Línea de suministro</Label>
              <Select id="CodLinea" name="CodLinea" required>
                {lineas.data.map((linea) => (
                  <option key={linea.CodLinea} value={linea.CodLinea}>
                    {linea.NombreLinea}
                  </option>
                ))}
              </Select>
            </fieldset>
            <fieldset className="mb-6">
              <ToggleSwitch
                label="Es ecológico"
                checked={esEco}
                onChange={setEsEco}
              />
              <input type="hidden" name="EsEco" value={esEco ? "1" : "0"} />
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
        show={editInsumoModalOpen}
        onClose={() => setEditInsumoModalOpen(false)}
      >
        <Modal.Header>Editar insumo</Modal.Header>
        <Modal.Body>
          <fetcher.Form
            method="post"
            onSubmit={() => setEditInsumoModalOpen(false)}
          >
            <input
              type="hidden"
              id="CodIns"
              name="CodIns"
              value={insumoEditando?.CodIns}
            />
            <fieldset>
              <Label htmlFor="NombreIns">Nombre</Label>
              <TextInput
                type="text"
                id="NombreIns"
                name="NombreIns"
                defaultValue={insumoEditando?.NombreIns}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="DescripcionIns">Descripción</Label>
              <TextInput
                type="text"
                id="DescripcionIns"
                name="DescripcionIns"
                defaultValue={insumoEditando?.DescripcionIns}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="FabricanteIns">Fabricante</Label>
              <TextInput
                type="text"
                id="FabricanteIns"
                name="FabricanteIns"
                defaultValue={insumoEditando?.FabricanteIns}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="EsEco">Ecológico</Label>
              <TextInput
                type="number"
                id="EsEco"
                name="EsEco"
                defaultValue={insumoEditando?.EsEco ? 1 : 0}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="PrecioIns">Precio</Label>
              <TextInput
                type="number"
                id="PrecioIns"
                name="PrecioIns"
                defaultValue={insumoEditando?.PrecioIns}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="ExistIns">Existencias</Label>
              <TextInput
                type="number"
                id="ExistIns"
                name="ExistIns"
                defaultValue={insumoEditando?.ExistIns}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="MinIns">Mínimo</Label>
              <TextInput
                type="number"
                id="MinIns"
                name="MinIns"
                defaultValue={insumoEditando?.MinIns}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="MaxIns">Máximo</Label>
              <TextInput
                type="number"
                id="MaxIns"
                name="MaxIns"
                defaultValue={insumoEditando?.MaxIns}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="UMedida">UMedida</Label>
              <TextInput
                type="text"
                id="UMedida"
                name="UMedida"
                defaultValue={insumoEditando?.UMedida}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor="CodLinea">CodLinea</Label>
              <TextInput
                type="number"
                id="CodLinea"
                name="CodLinea"
                defaultValue={insumoEditando?.CodLinea}
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
      <Modal
        show={eliminarInsumoModalOpen}
        onClose={() => setEliminarInsumoModalOpen(false)}
        size="md"
      >
        <Modal.Header>Confirmar Eliminación</Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que quieres eliminar este insumo?</p>
          <fetcher.Form
            method="post"
            onSubmit={() => setEliminarInsumoModalOpen(false)}
          >
            <fieldset>
              <Label htmlFor="CodIns">Código de insumo</Label>
              <TextInput
                type="number"
                id="CodIns"
                name="CodIns"
                value={insumoEliminando?.CodIns}
                readOnly={true}
              />
            </fieldset>
            <div className="flex justify-between">
              <Button
                type="submit"
                name="_action"
                value="eliminarInsumo"
                color="failure"
                disabled={fetcher.state !== "idle"}
              >
                Eliminar
              </Button>
              <Button
                type="button"
                color="gray"
                onClick={() => setEliminarInsumoModalOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal
        show={nuevoLineaModalOpen}
        onClose={() => setNuevoLineaModalOpen(false)}
      >
        <Modal.Header>Nueva línea</Modal.Header>
        <Modal.Body>
          <fetcher.Form
            method="post"
            onSubmit={() => setNuevoLineaModalOpen(false)}
          >
            <fieldset>
              <Label htmlFor="NombreLinea">Nombre de línea</Label>
              <TextInput
                type="text"
                id="NombreLinea"
                name="NombreLinea"
                required
              />
            </fieldset>
            <Button
              type="submit"
              name="_action"
              value="nuevoLinea"
              disabled={fetcher.state !== "idle"}
            >
              Crear
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal
        show={editLineaModalOpen}
        onClose={() => setEditLineaModalOpen(false)}
      >
        <Modal.Header>Editar línea</Modal.Header>
        <Modal.Body>
          <fetcher.Form
            method="post"
            onSubmit={() => setEditLineaModalOpen(false)}
          >
            <input
              type="hidden"
              name="CodLinea"
              value={lineaEditando?.CodLinea}
            />
            <fieldset>
              <Label htmlFor="NombreLinea">Nombre de línea</Label>
              <TextInput
                type="text"
                id="NombreLinea"
                name="NombreLinea"
                defaultValue={lineaEditando?.NombreLinea}
              />
            </fieldset>
            <Button
              type="submit"
              name="_action"
              value="editarLinea"
              disabled={fetcher.state !== "idle"}
            >
              Actualizar
            </Button>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
      <Modal
        show={eliminarLineaModalOpen}
        onClose={() => setEliminarLineaModalOpen(false)}
      >
        <Modal.Header>Confirmar Eliminación</Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que quieres eliminar esta línea?</p>
          <fetcher.Form
            method="post"
            onSubmit={() => setEliminarLineaModalOpen(false)}
          >
            <fieldset>
              <Label htmlFor="CodLinea">Código de línea</Label>
              <TextInput
                type="number"
                id="CodLinea"
                name="CodLinea"
                value={lineaEliminando?.CodLinea}
                readOnly={true}
              />
            </fieldset>
            <div className="flex justify-between">
              <Button
                type="submit"
                name="_action"
                value="eliminarLinea"
                disabled={fetcher.state !== "idle"}
              >
                Eliminar
              </Button>
              <Button
                type="button"
                onClick={() => setEliminarLineaModalOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </fetcher.Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

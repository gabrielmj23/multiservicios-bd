import {getInsumos, addInsumo, editInsumo, getLineas, addLinea, editLinea, deleteInsumo, deleteLinea} from '../utils/inventario.server'
import {json} from '@remix-run/react';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { insumoSchema, lineaSchema } from '~/utils/schemas';
import { set, z } from 'zod';
import { ActionFunctionArgs } from '@remix-run/node';
export async function loader() {
    return {
        insumos: await getInsumos(),
        lineas: await getLineas(),
    }
}

export async function action( {request} : ActionFunctionArgs) {
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
        case "eliminarLinea":{console.log("Eliminando", formData.CodLinea)
            return await deleteLinea(formData);}
    }
}


export default function DashboardInventario() {
    const { insumos, lineas } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const [nuevoInsumoModalOpen, setNuevoInsumoModalOpen] = useState(false);
    const [editInsumoModalOpen, setEditInsumoModalOpen] = useState(false);
    const [insumoEditando, setInsumoEditando] = useState<z.infer<
        typeof insumoSchema
    > | null>(null);
    const [nuevoLineaModalOpen, setNuevoLineaModalOpen] = useState(false);
    const [editLineaModalOpen, setEditLineaModalOpen] = useState(false);
    const [lineaEditando, setLineaEditando] = useState<z.infer<
        typeof lineaSchema
    > | null>(null);
    const [eliminarInsumoModalOpen, setEliminarInsumoModalOpen] = useState(false);
    const [insumoEliminando, setInsumoEliminando] = useState<z.infer<
        typeof insumoSchema
    > | null>(null);
    const [eliminarLineaModalOpen, setEliminarLineaModalOpen] = useState(false);
    const [lineaEliminando, setLineaEliminando] = useState<z.infer<
        typeof lineaSchema
    > | null>(null);

    const handleSelectChange = (linea) => (e) => {
        const selectedAction = e.target.value;
        if (selectedAction === 'editar') {
            setLineaEditando(linea);
            setEditLineaModalOpen(true);
            console.log(editLineaModalOpen);
        } else if (selectedAction === 'eliminar') {
            setEliminarLineaModalOpen(true);
            setLineaEliminando(linea);
        }
    };

    const handleInsumoSelectChange = (insumo) => (e) => {
        const selectedAction = e.target.value;
        if (selectedAction === 'editar') {
            setInsumoEditando(insumo);
            setEditInsumoModalOpen(true); // Asegúrate de tener un estado `editInsumoModalOpen` para controlar la visibilidad del modal
        } else if (selectedAction === 'eliminar') {
            setInsumoEliminando(insumo);
            setEliminarInsumoModalOpen(true);
        }
    };

    if (insumos.type === "error" || lineas.type === "error") {
        return (
          <div>
            <h1>Inventario</h1>
            <p>{insumos.message ?? lineas.message}</p>
          </div>
        );
    }

    return (
      <div className="p-6">
        <h1>Inventario</h1>
        
        {(insumos.data as { CodIns: number; NombreIns: string; DescripcionIns: string; FabricanteIns: string; EsEco: number; PrecioIns: number; ExistIns: number; MinIns: number; MaxIns: number; UMedida: string; CodLinea: number; }[]).length === 0 ? (
            <>
                <p>No hay datos todavía</p>
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
            <Table hoverable className="min-w-fit">
                <Table.Head>
                    <Table.HeadCell>Código Insumo</Table.HeadCell>
                    <Table.HeadCell>Nombre</Table.HeadCell>
                    <Table.HeadCell>Descripcion</Table.HeadCell>
                    <Table.HeadCell>Fabricante</Table.HeadCell>
                    <Table.HeadCell>Es ecológico</Table.HeadCell>
                    <Table.HeadCell>Precio</Table.HeadCell>
                    <Table.HeadCell>Existencias</Table.HeadCell>
                    <Table.HeadCell>Mínimo</Table.HeadCell>
                    <Table.HeadCell>Máximo</Table.HeadCell>
                    <Table.HeadCell>UMedida</Table.HeadCell>
                    <Table.HeadCell>CodLinea</Table.HeadCell>
                    <Table.HeadCell>Opción</Table.HeadCell>
                </Table.Head>
                <Table.Body className="bg-white">
                    {insumos.data.map((insumo) => (
                        <Table.Row key = {insumo.CodIns}>
                            <Table.Cell>{insumo.CodIns}</Table.Cell>
                            <Table.Cell>{insumo.NombreIns}</Table.Cell>
                            <Table.Cell>{insumo.DescripcionIns}</Table.Cell>
                            <Table.Cell>{insumo.FabricanteIns}</Table.Cell>
                            <Table.Cell>{insumo.EsEco.toString()}</Table.Cell>
                            <Table.Cell>{insumo.PrecioIns}</Table.Cell>
                            <Table.Cell>{insumo.ExistIns}</Table.Cell>
                            <Table.Cell>{insumo.MinIns}</Table.Cell>
                            <Table.Cell>{insumo.MaxIns}</Table.Cell>
                            <Table.Cell>{insumo.UMedida}</Table.Cell>
                            <Table.Cell>{insumo.CodLinea}</Table.Cell>
                            <Table.Cell>
                                <Select onChange={handleInsumoSelectChange(insumo)}>
                                    <option value="" disabled selected>Seleccionar...</option>
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
        <Modal
            show={nuevoInsumoModalOpen}
            onClose={() => setNuevoInsumoModalOpen(false)}
        >
            <Modal.Header>Registrar nuevo insumo</Modal.Header>
            <Modal.Body>
                <fetcher.Form method="post">
                    
                    <fieldset>
                        <label htmlFor="NombreIns">Nombre</label>
                        <TextInput
                            type="text"
                            id="NombreIns"
                            name="NombreIns"
                            placeholder="nombre"
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="DescripcionIns">Descripción</label>
                        <TextInput
                            type="text"
                            id="DescripcionIns"
                            name="DescripcionIns"
                            placeholder="descripcion"
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="FabricanteIns">Fabricante</label>
                        <TextInput
                            type="text"
                            id="FabricanteIns"
                            name="FabricanteIns"
                            placeholder="fabricante"
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="EsEco">Ecológico</label>
                        <TextInput
                            type="boolean"
                            id="EsEco"
                            name="EsEco"
                            placeholder="1"
                        /> 
                    </fieldset>
                    <fieldset>
                        <label htmlFor="PrecioIns">Precio</label>
                        <TextInput
                            type="number"
                            id="PrecioIns"
                            name="PrecioIns"
                            placeholder="1"
                            step="0.01"
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="ExistIns">Existencias</label>
                        <TextInput
                            type="number"
                            id="ExistIns"
                            name="ExistIns"
                            placeholder="1"
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="MinIns">Mínimo</label>
                        <TextInput
                            type="number"
                            id="MinIns"
                            name="MinIns"
                            placeholder="1"
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="MaxIns">Máximo</label>
                        <TextInput
                            type="number"
                            id="MaxIns"
                            name="MaxIns"
                            placeholder="1"
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="Umedida">Unidad de medida</label>
                        <TextInput
                            type="text"
                            id="Umedida"
                            name="Umedida"
                            placeholder="umedida"
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="CodLinea">Código de línea</label>
                        <TextInput
                            type="number"
                            id="CodLinea"
                            name="CodLinea"
                            placeholder="1"
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
            show={editInsumoModalOpen}
            onClose={() => setEditInsumoModalOpen(false)}
        >
            <Modal.Header>Editar insumo</Modal.Header>
            <Modal.Body>
                <fetcher.Form method="post">
                    <fieldset>
                        <label htmlFor="CodIns">Código de insumo</label>
                        <TextInput
                            type="number"
                            id="CodIns"
                            name="CodIns"
                            defaultValue={insumoEditando?.CodIns}
                            readOnly={true}
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="NombreIns">Nombre</label>
                        <TextInput
                            type="text"
                            id="NombreIns"
                            name="NombreIns"
                            defaultValue={insumoEditando?.NombreIns}
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="DescripcionIns">Descripción</label>
                        <TextInput
                            type="text"
                            id="DescripcionIns"
                            name="DescripcionIns"
                            defaultValue={insumoEditando?.DescripcionIns}
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="FabricanteIns">Fabricante</label>
                        <TextInput
                            type="text"
                            id="FabricanteIns"
                            name="FabricanteIns"
                            defaultValue={insumoEditando?.FabricanteIns}
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="EsEco">Ecológico</label>
                        <TextInput
                            type="number"
                            id="EsEco"
                            name="EsEco"
                            defaultValue={insumoEditando?.EsEco}
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="PrecioIns">Precio</label>
                        <TextInput
                            type="number"
                            id="PrecioIns"
                            name="PrecioIns"
                            defaultValue={insumoEditando?.PrecioIns}
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="ExistIns">Existencias</label>
                        <TextInput
                            type="number"
                            id="ExistIns"
                            name="ExistIns"
                            defaultValue={insumoEditando?.ExistIns}
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="MinIns">Mínimo</label>
                        <TextInput
                            type="number"
                            id="MinIns"
                            name="MinIns"
                            defaultValue={insumoEditando?.MinIns}
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="MaxIns">Máximo</label>
                        <TextInput
                            type="number"
                            id="MaxIns"
                            name="MaxIns"
                            defaultValue={insumoEditando?.MaxIns}
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="UMedida">UMedida</label>
                        <TextInput
                            type="text"
                            id="UMedida"
                            name="UMedida"
                            defaultValue={insumoEditando?.UMedida}
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="CodLinea">CodLinea</label>
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
        >
    <Modal.Header>
        Confirmar Eliminación
    </Modal.Header>
    <Modal.Body>
        <p>¿Estás seguro de que quieres eliminar este insumo?</p>
        <fetcher.Form method="post">
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
                disabled={fetcher.state !== "idle"}
            >
                Eliminar
            </Button>
            <Button
                type="button"
                onClick={() => setEliminarInsumoModalOpen(false)}
            >
                Cancelar
            </Button>
            </div>
        </fetcher.Form>
    </Modal.Body>
    </Modal>
        {lineas.data.length === 0 ? (
            <> 
                <p>No hay lineas todavia</p>
                <Button
                    type="button"
                    className="mt-2"
                    onClick={() => setNuevoLineaModalOpen(true)}
                >
                    Registra la primera linea
                </Button>
            </>
        ) : (
            <>
                <Button
                    type="button"
                    className="my-2"
                    onClick = {() => setNuevoLineaModalOpen(true)}
                >
                    Nueva linea
                </Button>
                <Table hoverable className="min-w-fit">
                    <Table.Head>
                        <Table.HeadCell>Codigo de linea</Table.HeadCell>
                        <Table.HeadCell>Nombre de linea</Table.HeadCell>
                        <Table.HeadCell>Opción</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="bg-white">
                        {lineas.data.map((linea) => (
                            <Table.Row key = {linea.CodLinea}>
                                <Table.Cell>{linea.CodLinea}</Table.Cell>
                                <Table.Cell>{linea.NombreLinea}</Table.Cell>
                                <Table.Cell>
                                <Select onChange={handleSelectChange(linea)}>
                                    <option value="" disabled selected>Seleccionar...</option>
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
        <Modal
            show={nuevoLineaModalOpen}
            onClose={() => setNuevoLineaModalOpen(false)}
        >
            <Modal.Header>Nueva linea</Modal.Header>
            <Modal.Body>
                <fetcher.Form method="post">
                    <fieldset>
                        <label htmlFor="NombreLinea">Nombre de línea</label>
                        <TextInput
                            type="text"
                            id="NombreLinea"
                            name="NombreLinea"
                            placeholder="nombre"
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
                <fetcher.Form method="post">
                    <fieldset>
                        <label htmlFor="CodLinea">Código de línea</label>
                        <TextInput
                            type="number"
                            id="CodLinea"
                            name="CodLinea"
                            defaultValue={lineaEditando?.CodLinea}
                            readOnly={true}
                        />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="NombreLinea">Nombre de línea</label>
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
        <fetcher.Form method="post">
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
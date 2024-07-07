import { Link, MetaFunction, Outlet, useFetcher } from "@remix-run/react";
import { LuStore, LuShoppingCart } from "react-icons/lu";
import { FiTool, FiTruck } from "react-icons/fi";
import { FaRegUser, FaCar, FaChartLine } from "react-icons/fa";
import { HiOutlineIdentification } from "react-icons/hi2";
import { BsBoxSeam } from "react-icons/bs";
import { TfiReceipt } from "react-icons/tfi";
import { MdOutlineClass } from "react-icons/md";
import { GrUserWorker } from "react-icons/gr";
import { Select } from "flowbite-react";
import { ActionFunctionArgs } from "@remix-run/node";
import { setRol } from "~/utils/users.server";

export const meta: MetaFunction = () => {
  return [{ title: "Dashboard" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rol = String(formData.get("rol"));
  return await setRol(rol);
}

export default function Dashboard() {
  const fetcher = useFetcher();
  return (
    <div className="bg-orange-100">
      <header className="bg-[#A4D279] py-3 px-12 flex items-center gap-8">
        <img src="/logo.png" alt="logo" className="h-20" />
        <span className="text-4xl font-bold">Multiservicios Mundial</span>
        <Select className="absolute right-10">
          <option disabled selected>
            Seleccionar rol...
          </option>
          <option
            onClick={() => {
              fetcher.submit({ rol: "Enc1" }, { method: "post" });
            }}
          >
            Encargado
          </option>
          <option
            onClick={() => {
              fetcher.submit({ rol: "Emp1" }, { method: "post" });
            }}
          >
            Empleado
          </option>
        </Select>
      </header>
      <div className="flex min-h-screen">
        <nav className="flex flex-col gap-6 bg-gray-300 py-6 px-10 max-w-fit min-h-full sticky">
          <Link to="/dashboard">
            <span>
              <LuStore /> Mi Sucursal
            </span>
          </Link>
          <Link to="/dashboard/tipos-vehiculos">
            <span>
              <MdOutlineClass /> Tipos de vehículos
            </span>
          </Link>
          <Link to="/dashboard/marcas">
            <span>
              <HiOutlineIdentification /> Marcas y modelos
            </span>
          </Link>
          <Link to="/dashboard/empleados">
            <span>
              <GrUserWorker /> Empleados
            </span>
          </Link>
          <Link to="/dashboard/clientes">
            <span>
              <FaRegUser /> Clientes
            </span>
          </Link>
          <Link to="/dashboard/vehiculos">
            <span>
              <FaCar /> Vehículos
            </span>
          </Link>
          <Link to="/dashboard/servicios">
            <span>
              <FiTool /> Servicios
            </span>
          </Link>
          <Link to="/dashboard/proveedores">
            <span>
              <FiTruck /> Proveedores
            </span>
          </Link>
          <Link to="/dashboard/inventario">
            <span>
              <BsBoxSeam /> Inventario
            </span>
          </Link>
          <Link to="/dashboard/tienda">
            <span>
              <LuShoppingCart /> Tienda
            </span>
          </Link>
          <Link to="/dashboard/facturas">
            <span>
              <TfiReceipt /> Facturas
            </span>
          </Link>
          <Link to="/dashboard/estadisticas">
            <span>
              <FaChartLine /> Estadísticas
            </span>
          </Link>
        </nav>
        <Outlet />
      </div>
    </div>
  );
}

import { Link, MetaFunction, Outlet } from "@remix-run/react";
import { LuStore, LuShoppingCart } from "react-icons/lu";
import { FiTool } from "react-icons/fi";
import { FaRegUser, FaCar, FaChartLine } from "react-icons/fa";
import { HiOutlineIdentification } from "react-icons/hi2";
import { BsBoxSeam } from "react-icons/bs";
import { TfiReceipt } from "react-icons/tfi";
import { MdOutlineClass } from "react-icons/md";
import { GrUserWorker } from "react-icons/gr";

export const meta: MetaFunction = () => {
  return [{ title: "Dashboard" }];
};

export default function Dashboard() {
  return (
    <div className="bg-orange-100 h-screen">
      <header className="bg-[#A4D279] py-3 px-12 flex items-center gap-8">
        <img src="/logo.png" alt="logo" className="h-20" />
        <span className="text-4xl font-bold">Multiservicios Mundial</span>
      </header>
      <div className="flex">
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

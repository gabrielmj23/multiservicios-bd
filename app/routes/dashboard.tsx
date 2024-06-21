import { Link, MetaFunction, Outlet } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "Dashboard" }];
};

export default function Dashboard() {
  return (
    <div className="bg-[#E0DAA3] h-screen">
      <header className="bg-[#A4D279] py-3 px-12 flex items-center gap-8">
        <img src="/logo.png" alt="logo" className="h-28" />
        <span className="text-5xl font-bold">Multiservicios Mundial</span>
      </header>
      <nav className="flex justify-evenly bg-gray-300 py-2">
        <Link to="/dashboard">Inicio</Link>
        <Link to="/dashboard/servicios">Servicios</Link>
        <Link to="/dashboard/catalogo">Catálogo</Link>
        <Link to="/dashboard/inventario">Inventario</Link>
        <Link to="/dashboard/estadisticas">Estadísticas</Link>
      </nav>
      <Outlet />
    </div>
  );
}

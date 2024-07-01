import { Link } from "@remix-run/react";
import logo2 from "../imagenes/logo2.png";
import { Navbar } from "flowbite-react";


export default function Header(): JSX.Element {
  return (
    <Navbar style={{ backgroundColor: '#a8d47c' }} className=" fixed w-full z-50">
      <Navbar.Brand>
        <img
          src={logo2}
          alt="Logo 2"
          className="mr-2"
          style={{ width: "100px", height: "70px" }}
        />
      </Navbar.Brand>
      <Navbar.Toggle id="custom-navbar-toggler" />
      <Navbar.Collapse>
        <li>
          <button
            className="flowbite-navbar-link black-nav"
          >
            Inicio
          </button>
        </li>
        <li>
          <button
            className="flowbite-navbar-link black-nav "
          >
            Información servicios
          </button>
        </li>
        <li>
          <button
            className="flowbite-navbar-link black-nav"
          >
            Servicios activos
          </button>
        </li>
        <li>
          <button
            className="flowbite-navbar-link black-nav"
          >
            Catálogo
          </button>
        </li>
        <li>
          <button
            className="flowbite-navbar-link black-nav"
          >
            Inventario
          </button>
        </li>
        <li>
          <button
            className="flowbite-navbar-link black-nav"
          >
            Estadisticas
          </button>
        </li>
      </Navbar.Collapse>
    </Navbar>
  );
}

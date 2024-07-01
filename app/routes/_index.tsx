import type { MetaFunction } from "@remix-run/node";
import  Header from "../components/Header";
import Option from "../components/Option";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div  className="flex flex-col max-w-screen" style={{backgroundColor: '#e8dca4', minHeight: '100vh'}} >
      <Header  />
      <div style={{ textAlign: 'center', marginTop: '100px',}}>
        <h1 className="font-bold"  style={{ fontSize: '36px' }}>Bienvenido, Andrés Chacón</h1>
      </div>
      <div style={{
        marginTop: '200px', // Adjusts the top margin of the grid container
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)', // Creates three columns
        gap: '20px', // Adjusts the gap between items
        justifyContent: 'center', // Centers the items horizontally
        alignItems: 'center', // Centers the items vertically (optional)
        maxWidth: '600px', // Adjusts the maximum width of the grid container (optional)
        margin: '0 auto' // Centers the grid container in the parent div
      }}>
        <Option name="Clientes" imageSrc="https://via.placeholder.com/200" />
        <Option name="Personal" imageSrc="https://via.placeholder.com/150" />
        <Option name="Proveedores" imageSrc="https://via.placeholder.com/150" />
        <Option name="Facturas" imageSrc="https://via.placeholder.com/150" />
        <Option name="Productos" imageSrc="https://via.placeholder.com/150" />
        <Option name="Vehiculos" imageSrc="https://via.placeholder.com/150" />
        <Option name="Inventarios" imageSrc="https://via.placeholder.com/150" />
        <Option name="Servicios" imageSrc="https://via.placeholder.com/150" />
      </div>
    </div>
  );
}

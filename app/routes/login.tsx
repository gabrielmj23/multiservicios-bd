import { MetaFunction } from "@remix-run/node";
import { Label, Button, TextInput } from "flowbite-react";
import { Form } from "@remix-run/react";

export const meta: MetaFunction = () => [{ title: "M&M | Iniciar sesión" }];

export default function Login() {
  return (
    <div
      id="login-container"
      className="min-w-full h-screen flex flex-col justify-center items-center"
    >
      <h1 className="mb-6">Multiservicios Mundial</h1>
      <Form className="flex flex-col gap-3 min-w-80">
        <h2 className="text-center">Iniciar sesión</h2>
        <fieldset className="custom-field">
          <Label htmlFor="correo">Correo</Label>
          <TextInput
            id="correo"
            name="correo"
            type="email"
            placeholder="Correo Electrónico"
          />
        </fieldset>
        <fieldset className="custom-field">
          <Label htmlFor="password">Contraseña</Label>
          <TextInput
            id="password"
            name="password"
            type="password"
            placeholder="Contraseña"
          />
        </fieldset>
        <Button type="submit">Iniciar sesión</Button>
      </Form>
    </div>
  );
}

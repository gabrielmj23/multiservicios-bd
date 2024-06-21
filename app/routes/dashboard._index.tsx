import DashboardButton from "~/components/DashboardButton";

export default function DashboardIndex() {
  return (
    <div className="grid grid-cols-3 gap-4 px-64 py-12">
      <DashboardButton
        btnText="Clientes"
        btnImg="logo.png"
        btnLink="/dashboard/clientes"
      />
      <DashboardButton
        btnText="Servicios"
        btnImg="logo.png"
        btnLink="/dashboard/servicios"
      />
      <DashboardButton
        btnText="Servicios"
        btnImg="logo.png"
        btnLink="/dashboard/servicios"
      />
      <DashboardButton
        btnText="Clientes"
        btnImg="logo.png"
        btnLink="/dashboard/clientes"
      />
      <DashboardButton
        btnText="Servicios"
        btnImg="logo.png"
        btnLink="/dashboard/servicios"
      />
      <DashboardButton
        btnText="Servicios"
        btnImg="logo.png"
        btnLink="/dashboard/servicios"
      />
    </div>
  );
}

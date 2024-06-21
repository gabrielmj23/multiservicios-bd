import { Link } from "@remix-run/react";

type DashboardButtonProps = {
  btnText: string;
  btnImg: string;
  btnLink: string;
};

export default function DashboardButton({
  btnText,
  btnImg,
  btnLink,
}: DashboardButtonProps) {
  return (
    <Link to={btnLink} className="bg-gray-300 shadow-md w-fit p-4 text-center rounded-lg">
      <img src={btnImg} alt={btnText} className="h-28" />
      <span className="text-lg font-bold">{btnText}</span>
    </Link>
  );
}

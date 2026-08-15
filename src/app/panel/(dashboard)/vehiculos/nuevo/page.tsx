import { auth } from "@/lib/auth";
import { esAdministrador } from "@/lib/permisos";
import NuevoVehiculoForm from "./NuevoVehiculoForm";

export const dynamic = "force-dynamic";

export default async function NuevoVehiculoPage() {
  const session = await auth();
  return <NuevoVehiculoForm esAdmin={esAdministrador(session?.user?.role)} />;
}

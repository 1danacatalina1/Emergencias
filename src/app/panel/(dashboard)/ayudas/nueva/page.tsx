import { auth } from "@/lib/auth";
import { esAdministrador } from "@/lib/permisos";
import NuevaSolicitudAyudaForm from "./NuevaSolicitudAyudaForm";

export const dynamic = "force-dynamic";

export default async function NuevaSolicitudAyudaPage() {
  const session = await auth();
  return <NuevaSolicitudAyudaForm esAdmin={esAdministrador(session?.user?.role)} />;
}

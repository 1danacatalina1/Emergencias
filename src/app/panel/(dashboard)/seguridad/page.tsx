import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SeguridadPanel from "./SeguridadPanel";
import CambiarContrasenaPanel from "./CambiarContrasenaPanel";
import UbicacionPanel from "./UbicacionPanel";

export const dynamic = "force-dynamic";

export default async function SeguridadPage() {
  const session = await auth();
  if (!session?.user) redirect("/panel/login");

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true, email: true },
  });
  if (!usuario) redirect("/panel/login");

  return (
    <div>
      <h1 className="text-xl font-bold">Seguridad de la cuenta</h1>
      <p className="mt-1 text-sm text-muted">
        Protege el acceso al panel de gestión con verificación en dos pasos (MFA).
      </p>
      <CambiarContrasenaPanel />
      <SeguridadPanel totpEnabledInicial={usuario.totpEnabled} email={usuario.email} />
      <UbicacionPanel />
    </div>
  );
}

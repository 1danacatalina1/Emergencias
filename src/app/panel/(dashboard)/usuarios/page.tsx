import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeGestionarUsuarios } from "@/lib/permisos";
import { Tarjeta } from "@/components/ui/campos";
import UsuariosPanel from "./UsuariosPanel";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await auth();

  if (!puedeGestionarUsuarios(session?.user?.role)) {
    return (
      <div>
        <h1 className="text-xl font-bold">Usuarios del panel</h1>
        <Tarjeta className="mt-4 p-4">
          <p className="text-sm text-muted">
            Esta sección está restringida al Administrador de la plataforma.
          </p>
        </Tarjeta>
      </div>
    );
  }

  const usuarios = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      totpEnabled: true,
      createdAt: true,
      estadoCuenta: true,
      tipoColaborador: true,
      telefono: true,
      direccionFisica: true,
      contactoEmergenciaNombre: true,
      contactoEmergenciaTelefono: true,
      lugarAccionDireccion: true,
      lugarAccionMunicipio: true,
      lugarAccionDepartamento: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Usuarios del panel</h1>
      <p className="mt-1 text-sm text-muted">
        Crea una cuenta para cada rescatista o entidad que necesite ingresar por su cuenta, sin
        depender de que tú les compartas tu propia sesión. Quienes se registren por su cuenta
        aparecerán abajo como solicitudes pendientes de aprobación.
      </p>
      <UsuariosPanel
        usuariosIniciales={JSON.parse(JSON.stringify(usuarios))}
        usuarioActualId={session!.user.id}
      />
    </div>
  );
}

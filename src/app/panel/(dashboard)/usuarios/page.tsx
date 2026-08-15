import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeGestionarUsuarios, esAdministrador } from "@/lib/permisos";
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
            Esta sección está restringida al Administrador y a Coordinadores de la plataforma.
          </p>
        </Tarjeta>
      </div>
    );
  }

  const [usuarios, seguidos, coordinadores] = await Promise.all([
    prisma.user.findMany({
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
        disponibilidadTiempo: true,
        disponibilidadDesplazamiento: true,
        zonasDesplazamiento: true,
        experticia: true,
        comoPuedeAyudar: true,
        compartirUbicacion: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.seguimientoEquipo.findMany({
      where: { coordinadorId: session!.user.id },
      select: { voluntarioId: true },
    }),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "COORDINADOR"] }, active: true, estadoCuenta: "APROBADA" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold">Usuarios del panel</h1>
      <p className="mt-1 text-sm text-muted">
        Crea una cuenta para cada rescatista o entidad que necesite ingresar por su cuenta, sin
        depender de que tú les compartas tu propia sesión. Quienes se registren por su cuenta
        aparecerán abajo como solicitudes pendientes de aprobación. Marca la ⭐ de quienes prefieras
        seguir de cerca para filtrar tu lista y el mapa del equipo a &ldquo;mi equipo&rdquo;. Haz clic
        en cualquier usuario para ver su ficha completa.
      </p>
      <UsuariosPanel
        usuariosIniciales={JSON.parse(JSON.stringify(usuarios))}
        usuarioActualId={session!.user.id}
        esAdmin={esAdministrador(session!.user.role)}
        seguidosIniciales={seguidos.map((s) => s.voluntarioId)}
        coordinadores={coordinadores}
      />
    </div>
  );
}

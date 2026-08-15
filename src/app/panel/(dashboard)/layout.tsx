import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NavPanel from "./NavPanel";
import { UbicacionProvider } from "@/components/ubicacion/UbicacionContext";
import BannerSOSActivo from "@/components/sos/BannerSOSActivo";
import { puedeVerEquipoDeCampo } from "@/lib/permisos";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/panel/login");
  }

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { compartirUbicacion: true, ubicacionLat: true, ubicacionLng: true },
  });
  const posicionInicial =
    usuario?.ubicacionLat != null && usuario?.ubicacionLng != null
      ? { lat: usuario.ubicacionLat, lng: usuario.ubicacionLng }
      : null;

  return (
    <UbicacionProvider compartiendoInicial={usuario?.compartirUbicacion ?? false} posicionInicial={posicionInicial}>
      <div className="flex min-h-full flex-1 flex-col bg-background md:flex-row">
        <NavPanel usuario={{ name: session.user.name ?? "", role: session.user.role }} />
        <div className="flex flex-1 flex-col">
          {puedeVerEquipoDeCampo(session.user.role) && <BannerSOSActivo />}
          <main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6">{children}</main>
        </div>
      </div>
    </UbicacionProvider>
  );
}

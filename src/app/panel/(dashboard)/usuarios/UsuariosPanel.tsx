"use client";

import { useState } from "react";
import { Boton, Campo, Etiqueta, Seleccion, Tarjeta } from "@/components/ui/campos";
import { formatearFechaHora } from "@/lib/fecha";
import { TIPOS_COLABORADOR } from "@/lib/catalogos";

const ROLES = [
  { value: "OPERADOR", label: "Operador (rescatista) — crea y gestiona reportes" },
  { value: "COORDINADOR", label: "Coordinador — además elimina, exporta y ve auditoría" },
  { value: "CONSULTA", label: "Consulta — solo puede ver, sin editar" },
  { value: "ADMIN", label: "Administrador — control total, incluida esta sección" },
];

function etiquetaColaborador(tipo: string | null) {
  return TIPOS_COLABORADOR.find((t) => t.value === tipo)?.label ?? tipo ?? "—";
}

const ETIQUETAS_ROL: Record<string, string> = {
  ADMIN: "Administrador",
  COORDINADOR: "Coordinador",
  OPERADOR: "Operador",
  CONSULTA: "Consulta",
};

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  totpEnabled: boolean;
  createdAt: string;
  estadoCuenta: string;
  tipoColaborador: string | null;
  telefono: string | null;
  direccionFisica: string | null;
  contactoEmergenciaNombre: string | null;
  contactoEmergenciaTelefono: string | null;
  lugarAccionDireccion: string | null;
  lugarAccionMunicipio: string | null;
  lugarAccionDepartamento: string | null;
  disponibilidadTiempo: string | null;
  disponibilidadDesplazamiento: boolean | null;
  zonasDesplazamiento: string | null;
  experticia: string | null;
  comoPuedeAyudar: string | null;
  compartirUbicacion: boolean;
}

interface Coordinador {
  id: string;
  name: string;
}

function CredencialTemporal({ etiqueta, valor, onCerrar }: { etiqueta: string; valor: string; onCerrar: () => void }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="mt-3 rounded-xl border border-warning/40 bg-amber-50 p-3">
      <p className="text-sm font-semibold text-amber-900">{etiqueta} — no se volverá a mostrar.</p>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 overflow-x-auto rounded-lg bg-white p-2 text-sm">{valor}</code>
        <Boton
          type="button"
          variante="secundario"
          className="w-auto px-3 py-2 text-xs"
          onClick={() => navigator.clipboard.writeText(valor).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2000); })}
        >
          {copiado ? "Copiado ✓" : "Copiar"}
        </Boton>
      </div>
      <Boton type="button" variante="fantasma" className="mt-2 w-auto px-3 py-1.5 text-xs" onClick={onCerrar}>
        Ya la anoté
      </Boton>
    </div>
  );
}

function FichaCompleta({ usuario }: { usuario: Usuario }) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 rounded-xl bg-black/[.02] p-3 text-xs sm:grid-cols-2">
      <p><span className="font-semibold">Rol:</span> {ETIQUETAS_ROL[usuario.role] ?? usuario.role}</p>
      <p><span className="font-semibold">Tipo de colaborador:</span> {etiquetaColaborador(usuario.tipoColaborador)}</p>
      <p><span className="font-semibold">Correo:</span> {usuario.email}</p>
      <p><span className="font-semibold">Teléfono:</span> {usuario.telefono || "—"}</p>
      <p className="sm:col-span-2"><span className="font-semibold">Dirección física:</span> {usuario.direccionFisica || "—"}</p>
      <p><span className="font-semibold">Contacto de emergencia:</span> {usuario.contactoEmergenciaNombre || "—"}</p>
      <p><span className="font-semibold">Teléfono del contacto:</span> {usuario.contactoEmergenciaTelefono || "—"}</p>
      <p className="sm:col-span-2">
        <span className="font-semibold">Lugar de acción:</span>{" "}
        {[usuario.lugarAccionDireccion, usuario.lugarAccionMunicipio, usuario.lugarAccionDepartamento].filter(Boolean).join(", ") || "—"}
      </p>
      <p><span className="font-semibold">Disponibilidad de tiempo:</span> {usuario.disponibilidadTiempo || "—"}</p>
      <p>
        <span className="font-semibold">¿Puede desplazarse?</span>{" "}
        {usuario.disponibilidadDesplazamiento == null ? "—" : usuario.disponibilidadDesplazamiento ? "Sí" : "No"}
        {usuario.disponibilidadDesplazamiento && usuario.zonasDesplazamiento ? ` — ${usuario.zonasDesplazamiento}` : ""}
      </p>
      <p className="sm:col-span-2"><span className="font-semibold">Experticia:</span> {usuario.experticia || "—"}</p>
      <p className="sm:col-span-2"><span className="font-semibold">Cómo puede ayudar:</span> {usuario.comoPuedeAyudar || "—"}</p>
      <p><span className="font-semibold">Comparte ubicación en vivo:</span> {usuario.compartirUbicacion ? "Sí" : "No"}</p>
      <p><span className="font-semibold">Registrado:</span> {formatearFechaHora(usuario.createdAt)}</p>
    </div>
  );
}

function SolicitudPendiente({
  usuario,
  rolesDisponibles,
  onAprobar,
  onRechazar,
}: {
  usuario: Usuario;
  rolesDisponibles: typeof ROLES;
  onAprobar: (id: string, role: string) => void;
  onRechazar: (id: string) => void;
}) {
  const [role, setRole] = useState("OPERADOR");
  const [procesando, setProcesando] = useState(false);

  return (
    <Tarjeta className="border-warning/40 bg-amber-50/40 p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold">{usuario.name}</p>
          <p className="text-xs text-muted">{usuario.email} · {usuario.telefono}</p>
          <p className="mt-1 text-xs font-semibold text-primary">{etiquetaColaborador(usuario.tipoColaborador)}</p>
          <p className="mt-1 text-xs text-muted">
            Lugar de acción: {usuario.lugarAccionDireccion}, {usuario.lugarAccionMunicipio}, {usuario.lugarAccionDepartamento}
          </p>
          <p className="mt-1 text-xs text-muted">Dirección física: {usuario.direccionFisica}</p>
          <p className="mt-1 text-xs text-muted">
            Contacto de emergencia: {usuario.contactoEmergenciaNombre} · {usuario.contactoEmergenciaTelefono}
          </p>
          {usuario.disponibilidadTiempo && (
            <p className="mt-1 text-xs text-muted">⏱️ Disponibilidad: {usuario.disponibilidadTiempo}</p>
          )}
          {usuario.disponibilidadDesplazamiento && (
            <p className="mt-1 text-xs text-muted">
              🚗 Puede desplazarse{usuario.zonasDesplazamiento ? ` a: ${usuario.zonasDesplazamiento}` : ""}
            </p>
          )}
          {usuario.experticia && <p className="mt-1 text-xs text-muted">🎓 Experticia: {usuario.experticia}</p>}
          {usuario.comoPuedeAyudar && <p className="mt-1 text-xs text-muted">🤝 Cómo puede ayudar: {usuario.comoPuedeAyudar}</p>}
          <p className="mt-1 text-xs text-muted">Solicitado {formatearFechaHora(usuario.createdAt)}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Seleccion value={role} onChange={(e) => setRole(e.target.value)} className="w-auto py-1.5 text-xs">
          {rolesDisponibles.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </Seleccion>
        <Boton
          type="button"
          className="w-auto px-4 py-1.5 text-xs"
          disabled={procesando}
          onClick={async () => { setProcesando(true); await onAprobar(usuario.id, role); setProcesando(false); }}
        >
          Aprobar
        </Boton>
        <Boton
          type="button"
          variante="secundario"
          className="w-auto px-4 py-1.5 text-xs text-emergency"
          disabled={procesando}
          onClick={async () => {
            if (!window.confirm(`¿Rechazar la solicitud de ${usuario.name}?`)) return;
            setProcesando(true);
            await onRechazar(usuario.id);
            setProcesando(false);
          }}
        >
          Rechazar
        </Boton>
      </div>
    </Tarjeta>
  );
}

export default function UsuariosPanel({
  usuariosIniciales,
  usuarioActualId,
  esAdmin,
  seguidosIniciales,
  coordinadores,
}: {
  usuariosIniciales: Usuario[];
  usuarioActualId: string;
  esAdmin: boolean;
  seguidosIniciales: string[];
  coordinadores: Coordinador[];
}) {
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("OPERADOR");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nuevaCredencial, setNuevaCredencial] = useState<{ email: string; password: string } | null>(null);
  const [reseteos, setReseteos] = useState<Record<string, string>>({});
  const [seguidos, setSeguidos] = useState(new Set(seguidosIniciales));
  const [soloMiEquipo, setSoloMiEquipo] = useState(false);
  const [expandidos, setExpandidos] = useState(new Set<string>());
  const [coordinadorExportar, setCoordinadorExportar] = useState("");

  const rolesDisponibles = esAdmin ? ROLES : ROLES.filter((r) => r.value !== "ADMIN");

  const pendientes = usuarios.filter((u) => u.estadoCuenta === "PENDIENTE");
  let resto = usuarios.filter((u) => u.estadoCuenta !== "PENDIENTE");
  if (soloMiEquipo) resto = resto.filter((u) => seguidos.has(u.id));

  const urlExportar = coordinadorExportar
    ? `/api/export/usuarios?coordinadorId=${coordinadorExportar}`
    : "/api/export/usuarios";

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault();
    setCreando(true);
    setError(null);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });
    const data = await res.json();
    setCreando(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el usuario");
      return;
    }
    setNuevaCredencial({ email: data.email, password: data.contrasenaTemporal });
    setUsuarios((prev) => [
      {
        id: data.id, name: data.name, email: data.email, role: data.role, active: true, totpEnabled: false,
        createdAt: new Date().toISOString(), estadoCuenta: "APROBADA", tipoColaborador: null, telefono: null,
        direccionFisica: null, contactoEmergenciaNombre: null, contactoEmergenciaTelefono: null,
        lugarAccionDireccion: null, lugarAccionMunicipio: null, lugarAccionDepartamento: null,
        disponibilidadTiempo: null, disponibilidadDesplazamiento: null, zonasDesplazamiento: null,
        experticia: null, comoPuedeAyudar: null, compartirUbicacion: false,
      },
      ...prev,
    ]);
    setName("");
    setEmail("");
    setRole("OPERADOR");
  }

  async function cambiarRol(id: string, nuevoRol: string) {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, role: nuevoRol } : u)));
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nuevoRol }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error ?? "No se pudo cambiar el rol");
    }
  }

  async function cambiarActivo(id: string, active: boolean) {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, active } : u)));
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error ?? "No se pudo actualizar el estado");
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, active: !active } : u)));
    }
  }

  async function restablecerContrasena(id: string) {
    if (!window.confirm("¿Restablecer la contraseña de este usuario? La contraseña actual dejará de funcionar de inmediato.")) return;
    const res = await fetch(`/api/users/${id}/reset-password`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      window.alert(data.error ?? "No se pudo restablecer la contraseña");
      return;
    }
    setReseteos((prev) => ({ ...prev, [id]: data.contrasenaTemporal }));
  }

  async function aprobar(id: string, roleElegido: string) {
    const res = await fetch(`/api/users/${id}/aprobar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: roleElegido }),
    });
    const data = await res.json();
    if (!res.ok) {
      window.alert(data.error ?? "No se pudo aprobar la solicitud");
      return;
    }
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, estadoCuenta: "APROBADA", active: true, role: roleElegido } : u)));
  }

  async function rechazar(id: string) {
    const res = await fetch(`/api/users/${id}/rechazar`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      window.alert(data.error ?? "No se pudo rechazar la solicitud");
      return;
    }
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, estadoCuenta: "RECHAZADA", active: false } : u)));
  }

  async function alternarSeguido(id: string) {
    const yaSeguido = seguidos.has(id);
    setSeguidos((prev) => {
      const copia = new Set(prev);
      if (yaSeguido) copia.delete(id); else copia.add(id);
      return copia;
    });
    const res = await fetch("/api/equipo/seguidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: id }),
    });
    if (!res.ok) {
      setSeguidos((prev) => {
        const copia = new Set(prev);
        if (yaSeguido) copia.add(id); else copia.delete(id);
        return copia;
      });
    }
  }

  function alternarExpandido(id: string) {
    setExpandidos((prev) => {
      const copia = new Set(prev);
      if (copia.has(id)) copia.delete(id); else copia.add(id);
      return copia;
    });
  }

  return (
    <div className="mt-5 flex flex-col gap-6">
      {pendientes.length > 0 && (
        <div>
          <h2 className="font-bold text-warning">Solicitudes pendientes ({pendientes.length})</h2>
          <div className="mt-3 flex flex-col gap-2">
            {pendientes.map((u) => (
              <SolicitudPendiente key={u.id} usuario={u} rolesDisponibles={rolesDisponibles} onAprobar={aprobar} onRechazar={rechazar} />
            ))}
          </div>
        </div>
      )}

      <Tarjeta className="p-4">
        <h2 className="font-bold">Crear nueva cuenta</h2>
        {error && <div className="mt-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-emergency">{error}</div>}

        {nuevaCredencial ? (
          <CredencialTemporal
            etiqueta={`Contraseña temporal para ${nuevaCredencial.email}`}
            valor={nuevaCredencial.password}
            onCerrar={() => setNuevaCredencial(null)}
          />
        ) : (
          <form onSubmit={crearUsuario} className="mt-3 flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Etiqueta htmlFor="nombre-usuario">Nombre completo</Etiqueta>
                <Campo id="nombre-usuario" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Etiqueta htmlFor="email-usuario">Correo electrónico</Etiqueta>
                <Campo id="email-usuario" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <Etiqueta htmlFor="rol-usuario">Rol</Etiqueta>
              <Seleccion id="rol-usuario" value={role} onChange={(e) => setRole(e.target.value)}>
                {rolesDisponibles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Seleccion>
            </div>
            <Boton type="submit" className="w-auto px-5" disabled={creando}>
              {creando ? "Creando…" : "Crear cuenta"}
            </Boton>
            <p className="text-xs text-muted">
              Se genera una contraseña temporal que solo verás una vez — compártesela a la persona por
              un medio seguro (llamada, WhatsApp) y pídele que la cambie en su primer ingreso, desde{" "}
              <span className="font-medium">Seguridad → Cambiar contraseña</span>. Si prefieres que la
              persona se registre por su cuenta, compártele el enlace{" "}
              <span className="font-mono">/panel/registro</span>.
            </p>
          </form>
        )}
      </Tarjeta>

      <Tarjeta className="p-4">
        <h2 className="font-bold">Exportar a Excel</h2>
        <p className="mt-1 text-xs text-muted">
          Descarga toda la información de registro de los usuarios. Puedes filtrar por el equipo que
          cada coordinador haya marcado con ⭐.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Seleccion value={coordinadorExportar} onChange={(e) => setCoordinadorExportar(e.target.value)} className="sm:w-72">
            <option value="">Todos los usuarios</option>
            {coordinadores.map((c) => (
              <option key={c.id} value={c.id}>Equipo de {c.name}{c.id === usuarioActualId ? " (tú)" : ""}</option>
            ))}
          </Seleccion>
          <a href={urlExportar}>
            <Boton type="button" variante="secundario" className="w-auto px-4">
              ⬇️ Exportar a Excel
            </Boton>
          </a>
        </div>
      </Tarjeta>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">Cuentas existentes ({resto.length})</h2>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <input type="checkbox" checked={soloMiEquipo} onChange={(e) => setSoloMiEquipo(e.target.checked)} />
            Ver solo mi equipo ⭐
          </label>
        </div>
        {soloMiEquipo && resto.length === 0 && (
          <p className="mt-2 text-xs text-muted">Aún no marcaste a nadie con ⭐. Desmarca el filtro y toca la estrella de quienes quieras seguir.</p>
        )}
        <div className="mt-3 flex flex-col gap-2">
          {resto.map((u) => {
            const esUno = u.id === usuarioActualId;
            const esAdminBloqueado = u.role === "ADMIN" && !esAdmin;
            const expandido = expandidos.has(u.id);
            return (
              <Tarjeta key={u.id} className="p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2">
                    {!esUno && (
                      <button
                        type="button"
                        onClick={() => alternarSeguido(u.id)}
                        title={seguidos.has(u.id) ? "Quitar de mi equipo" : "Agregar a mi equipo"}
                        className={`mt-0.5 shrink-0 text-lg ${seguidos.has(u.id) ? "text-warning" : "text-black/20"}`}
                      >
                        {seguidos.has(u.id) ? "★" : "☆"}
                      </button>
                    )}
                    <button type="button" onClick={() => alternarExpandido(u.id)} className="min-w-0 text-left">
                      <p className="text-sm font-bold">
                        {u.name} {esUno && <span className="font-normal text-muted">(tú)</span>}
                      </p>
                      <p className="text-xs text-muted">{u.email}</p>
                      {u.tipoColaborador && <p className="text-xs font-semibold text-primary">{etiquetaColaborador(u.tipoColaborador)}</p>}
                      <p className="mt-1 text-xs text-muted">
                        Creada {formatearFechaHora(u.createdAt)}
                        {u.totpEnabled && " · MFA activado"}
                        {u.estadoCuenta === "RECHAZADA" && " · Solicitud rechazada"}
                        {!u.active && u.estadoCuenta !== "RECHAZADA" && " · Cuenta desactivada"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-primary underline">
                        {expandido ? "▴ Ocultar ficha completa" : "▾ Ver ficha completa"}
                      </p>
                    </button>
                  </div>
                  {esAdminBloqueado ? (
                    <p className="text-xs font-medium text-muted">🔒 Solo el Administrador gestiona esta cuenta</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Seleccion
                        value={u.role}
                        onChange={(e) => cambiarRol(u.id, e.target.value)}
                        disabled={esUno}
                        className="w-auto py-1.5 text-xs"
                      >
                        {rolesDisponibles.map((r) => (
                          <option key={r.value} value={r.value}>{r.value}</option>
                        ))}
                      </Seleccion>
                      <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <input
                          type="checkbox"
                          checked={u.active}
                          disabled={esUno}
                          onChange={(e) => cambiarActivo(u.id, e.target.checked)}
                        />
                        Activa
                      </label>
                      <Boton
                        type="button"
                        variante="secundario"
                        className="w-auto px-3 py-1.5 text-xs"
                        onClick={() => restablecerContrasena(u.id)}
                      >
                        Restablecer contraseña
                      </Boton>
                    </div>
                  )}
                </div>
                {expandido && <FichaCompleta usuario={u} />}
                {reseteos[u.id] && (
                  <CredencialTemporal
                    etiqueta={`Nueva contraseña temporal para ${u.email}`}
                    valor={reseteos[u.id]!}
                    onCerrar={() => setReseteos((prev) => {
                      const resto = { ...prev };
                      delete resto[u.id];
                      return resto;
                    })}
                  />
                )}
              </Tarjeta>
            );
          })}
        </div>
      </div>
    </div>
  );
}

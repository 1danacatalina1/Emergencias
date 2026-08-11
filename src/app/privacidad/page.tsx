import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de privacidad — Sistema de Gestión de Emergencias",
  description: "Política de tratamiento de datos personales (Habeas Data) — Ley 1581 de 2012.",
};

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-base font-bold text-foreground">{titulo}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

export default function PrivacidadPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background pb-16">
      <header className="bg-primary px-5 pb-6 pt-8 text-white">
        <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-white/80">
          ← Volver al inicio
        </Link>
        <h1 className="text-xl font-bold">Aviso de privacidad</h1>
        <p className="mt-1 text-sm text-white/80">Tratamiento de datos personales — Habeas Data (Ley 1581 de 2012)</p>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-5 pt-6">
        <p className="text-sm text-muted">Última actualización: 11 de agosto de 2026.</p>

        <p className="mt-4 text-sm leading-relaxed">
          El <strong>Sistema de Gestión de Emergencias</strong> (&ldquo;la Plataforma&rdquo;) recolecta datos personales para
          coordinar la atención de emergencias, la búsqueda de personas y mascotas, los traslados médicos y la
          ayuda humanitaria durante una emergencia o desastre. Este aviso explica, de forma clara, qué datos
          recogemos, para qué los usamos, con quién los compartimos y cuáles son tus derechos, en cumplimiento de
          la Ley 1581 de 2012 y el Decreto 1377 de 2013 de la República de Colombia.
        </p>

        <Seccion titulo="1. Responsable del tratamiento">
          <p>
            Esta plataforma es una iniciativa ciudadana de gestión de emergencias, actualmente administrada de
            forma independiente mientras se formaliza su adopción por una entidad de gestión del riesgo.
          </p>
          <p>
            Contacto para asuntos relacionados con datos personales:{" "}
            <a href="mailto:catica.rojas.l@gmail.com" className="font-semibold text-primary underline">
              catica.rojas.l@gmail.com
            </a>
            .
          </p>
        </Seccion>

        <Seccion titulo="2. Qué datos recogemos">
          <ul className="list-disc space-y-1 pl-5">
            <li>Datos de identificación: nombre completo, tipo y número de documento, edad, sexo.</li>
            <li>Datos de contacto: teléfono, dirección.</li>
            <li>Datos de ubicación: dirección, municipio, departamento y coordenadas geográficas del reporte.</li>
            <li>
              Datos sensibles cuando aplica: condición de salud, descripción física y, en los reportes de personas
              desaparecidas o traslados, información sobre el estado de la persona.
            </li>
            <li>Fotografías que la persona reportante decida adjuntar de forma voluntaria (nunca obligatoria).</li>
          </ul>
          <p>
            Cuando el reporte es sobre otra persona (por ejemplo, una persona desaparecida, herida o fallecida),
            quien diligencia el formulario declara contar con un motivo legítimo para hacerlo —ser familiar,
            allegado, testigo o personal de atención— con el único fin de ayudar a localizar o asistir a esa
            persona. Si el reporte involucra a un menor de edad, se trata con el mismo propósito exclusivo de
            protección y búsqueda, priorizando en todo momento su interés superior.
          </p>
        </Seccion>

        <Seccion titulo="3. Para qué usamos tus datos">
          <ul className="list-disc space-y-1 pl-5">
            <li>Registrar y dar seguimiento a incidentes, personas afectadas, traslados y solicitudes de ayuda.</li>
            <li>Facilitar la búsqueda y reunificación de personas y mascotas desaparecidas.</li>
            <li>Coordinar la entrega de ayuda humanitaria y donaciones.</li>
            <li>Generar reportes y estadísticas agregadas para la toma de decisiones durante la emergencia.</li>
            <li>Contactar a la persona reportante para verificar o actualizar información, si es necesario.</li>
          </ul>
        </Seccion>

        <Seccion titulo="4. Con quién compartimos tus datos">
          <p>
            Los datos son visibles para el personal autorizado del panel de gestión (autoridades, organismos de
            socorro y voluntarios habilitados) y pueden compartirse con entidades del Sistema Nacional de Gestión
            del Riesgo de Desastres (UNGRD, CDGRD, CMGRD), Cruz Roja Colombiana, Defensa Civil, Bomberos, y
            autoridades de salud o de policía, cuando sea necesario para la atención de la emergencia o la
            búsqueda de una persona.
          </p>
          <p>
            La información pública de los módulos de personas desaparecidas, mascotas y puntos de acopio (nombre,
            descripción, última ubicación y datos de contacto de quien reporta) se muestra abiertamente en la
            plataforma, ya que su propósito es que la comunidad ayude a identificar o encontrar a la persona o
            mascota. No se comparte ni se vende información a terceros con fines comerciales o publicitarios.
          </p>
        </Seccion>

        <Seccion titulo="5. Cómo protegemos tus datos">
          <ul className="list-disc space-y-1 pl-5">
            <li>La información se almacena en una base de datos cifrada y con acceso restringido por contraseña.</li>
            <li>El panel de gestión solo es accesible para usuarios autenticados con roles definidos.</li>
            <li>Cada creación, modificación o eliminación de datos queda registrada en una bitácora de auditoría.</li>
            <li>Las contraseñas de los usuarios del panel se almacenan cifradas, nunca en texto plano.</li>
          </ul>
        </Seccion>

        <Seccion titulo="6. Tus derechos (Habeas Data)">
          <p>Como titular de tus datos personales, tienes derecho a:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Conocer, actualizar y rectificar tus datos personales.</li>
            <li>Solicitar prueba de la autorización otorgada para el tratamiento de tus datos.</li>
            <li>Ser informado sobre el uso que se le ha dado a tus datos.</li>
            <li>Revocar tu autorización y/o solicitar la supresión de tus datos, cuando no exista un deber legal u obligación de conservarlos.</li>
            <li>Acceder de forma gratuita a tus datos personales.</li>
            <li>Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley.</li>
          </ul>
          <p>
            Para ejercer cualquiera de estos derechos, escribe a{" "}
            <a href="mailto:catica.rojas.l@gmail.com" className="font-semibold text-primary underline">
              catica.rojas.l@gmail.com
            </a>{" "}
            indicando tu nombre, el reporte al que hace referencia (código de seguimiento si lo tienes) y tu
            solicitud.
          </p>
        </Seccion>

        <Seccion titulo="7. Tiempo de conservación">
          <p>
            Los datos se conservan mientras sean necesarios para la atención de la emergencia y con fines
            históricos y estadísticos de gestión del riesgo, o hasta que ejerzas tu derecho de supresión conforme
            a la sección anterior, salvo que exista una obligación legal de conservarlos por más tiempo.
          </p>
        </Seccion>

        <Seccion titulo="8. Aceptación">
          <p>
            Al enviar cualquier formulario de esta plataforma, confirmas que has leído este aviso y autorizas el
            tratamiento de los datos personales incluidos en tu reporte para los fines aquí descritos.
          </p>
        </Seccion>

        <p className="mt-8 text-xs text-muted">
          Este aviso podrá actualizarse para reflejar cambios en la plataforma o en la normativa aplicable. Te
          recomendamos revisarlo periódicamente.
        </p>
      </main>
    </div>
  );
}

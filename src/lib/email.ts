/**
 * Envío de correo mediante la API REST de Resend. Si no hay RESEND_API_KEY
 * configurada, se omite el envío silenciosamente — la alerta dentro de la
 * plataforma sigue funcionando de todas formas.
 */
export async function enviarCorreo({
  destinatarios,
  asunto,
  html,
}: {
  destinatarios: string[];
  asunto: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || destinatarios.length === 0) return false;

  const remitente = process.env.RESEND_FROM_EMAIL || "Emergencias <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remitente,
        to: destinatarios,
        subject: asunto,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

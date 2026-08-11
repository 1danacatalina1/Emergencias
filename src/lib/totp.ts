import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";

const EMISOR = "Emergencias Colombia";

export function generarSecretoTotp(): string {
  return generateSecret();
}

export function generarUriTotp(email: string, secret: string): string {
  return generateURI({ issuer: EMISOR, label: email, secret });
}

export async function generarQrDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, { margin: 1, width: 240 });
}

export async function verificarCodigoTotp(secret: string, token: string): Promise<boolean> {
  if (!/^\d{6}$/.test(token)) return false;
  const resultado = await verify({ secret, token });
  return resultado.valid;
}

export function generarCodigosRespaldo(cantidad = 8): string[] {
  const codigos: string[] = [];
  for (let i = 0; i < cantidad; i++) {
    const crudo = crypto.randomBytes(5).toString("hex").toUpperCase();
    codigos.push(`${crudo.slice(0, 5)}-${crudo.slice(5)}`);
  }
  return codigos;
}

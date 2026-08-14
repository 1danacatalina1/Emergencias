import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { after } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { authConfig } from "@/lib/auth.config";
import { verificarCodigoTotp } from "@/lib/totp";
import { registrarAuditoria } from "@/lib/audit";

class MfaRequerido extends CredentialsSignin {
  code = "mfa_requerido";
}

class MfaInvalido extends CredentialsSignin {
  code = "mfa_invalido";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
        totpCode: { label: "Código de verificación", type: "text" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user || !user.active) return null;

        const valido = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valido) return null;

        if (user.totpEnabled) {
          const codigo = parsed.data.totpCode?.trim();
          if (!codigo) throw new MfaRequerido();

          let autenticado2FA = false;

          if (/^\d{6}$/.test(codigo)) {
            autenticado2FA = user.totpSecret ? await verificarCodigoTotp(user.totpSecret, codigo) : false;
          } else {
            const normalizado = codigo.toUpperCase();
            for (const hash of user.totpBackupCodes) {
              if (await bcrypt.compare(normalizado, hash)) {
                autenticado2FA = true;
                await prisma.user.update({
                  where: { id: user.id },
                  data: { totpBackupCodes: user.totpBackupCodes.filter((h) => h !== hash) },
                });
                break;
              }
            }
          }

          if (!autenticado2FA) throw new MfaInvalido();
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    signIn: async ({ user }) => {
      if (!user.id) return;
      // No se espera esta escritura: registrar el inicio de sesión en la bitácora
      // no debe demorar la respuesta al usuario que está entrando al panel.
      after(() =>
        registrarAuditoria({
          entidad: "User",
          entidadId: user.id!,
          accion: "LOGIN",
          usuarioId: user.id,
          usuarioNombre: user.name,
        }).catch((error) => console.error("No se pudo registrar el inicio de sesión en la auditoría", error)),
      );
    },
  },
});

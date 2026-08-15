import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, LabelHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export function Etiqueta({ className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={twMerge("mb-1.5 block text-sm font-semibold text-foreground", className)} {...props} />;
}

export function Campo({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={twMerge(
        "w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
}

export function AreaTexto({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={twMerge(
        "w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
        className,
      )}
      rows={4}
      {...props}
    />
  );
}

export function Seleccion({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={twMerge(
        "w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function ErrorCampo({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return <p className="mt-1 text-sm font-medium text-emergency">{mensaje}</p>;
}

export function Boton({
  className = "",
  variante = "primario",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "primario" | "emergencia" | "secundario" | "fantasma" }) {
  const base = "inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-base font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  const variantes = {
    primario: "bg-primary text-white hover:bg-primary-dark",
    emergencia: "bg-emergency text-white hover:bg-emergency-dark",
    secundario: "bg-surface text-foreground border border-border hover:bg-black/[.03]",
    fantasma: "text-primary hover:bg-primary/5",
  };
  return <button className={twMerge(base, variantes[variante], className)} {...props} />;
}

export function Tarjeta({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("rounded-2xl border border-border bg-surface shadow-sm", className)} {...props} />;
}

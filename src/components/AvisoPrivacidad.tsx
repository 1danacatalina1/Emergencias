import Link from "next/link";

export function CheckboxPrivacidad({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (valor: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-xs leading-relaxed text-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
      />
      <span>
        He leído y acepto el{" "}
        <Link href="/privacidad" target="_blank" className="font-semibold text-primary underline">
          Aviso de privacidad y tratamiento de datos personales
        </Link>
        . Entiendo que esta información puede compartirse con autoridades y organismos de atención de
        emergencias para coordinar la respuesta.
      </span>
    </label>
  );
}

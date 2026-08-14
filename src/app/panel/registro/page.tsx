import FormularioRegistro from "./FormularioRegistro";

export const dynamic = "force-static";

export default function RegistroColaboradorPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-primary px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 text-center text-white">
          <p className="text-3xl">🧑‍🚒</p>
          <h1 className="mt-2 text-xl font-bold">Registro de colaboradores</h1>
          <p className="mt-1 text-sm text-white/70">
            Rescatistas, voluntarios, coordinadores, centros de acopio y entidades
          </p>
        </div>
        <FormularioRegistro />
      </div>
    </div>
  );
}

export function HelloWorldPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-mist via-white to-sand p-6">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-panel backdrop-blur">
        <span className="mb-4 inline-flex rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-800">
          hello_world
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          Hello world
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          O teste inicial garante que a base React, Vite, Tailwind e Vitest está pronta antes
          do fluxo completo de upload.
        </p>
      </section>
    </main>
  );
}


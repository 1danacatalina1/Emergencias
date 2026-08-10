"use client";

import dynamic from "next/dynamic";

const SelectorUbicacion = dynamic(() => import("./SelectorUbicacion"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl border border-border bg-black/[.03]" />,
});

export default SelectorUbicacion;

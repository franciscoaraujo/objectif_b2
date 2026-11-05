"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/layout-parts";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <ErrorState message="Ocorreu um erro ao carregar esta tela. Verifique sua conexão e tente novamente." onRetry={reset} />;
}


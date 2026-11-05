"use client";

import { useEffect, useOptimistic, useRef, useTransition } from "react";
import { toggleBlock } from "@/app/actions";

export function BlockCheck({
  blockId,
  weekStart,
  done,
  label,
}: {
  blockId: string;
  weekStart: string;
  done: boolean;
  label: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(done);
  const [pending, start] = useTransition();
  const ref = useRef<(HTMLElement & { checked: boolean }) | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      const next = el.checked;
      start(async () => {
        setOptimistic(next);
        await toggleBlock(blockId, weekStart, next);
      });
    };
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [blockId, weekStart, setOptimistic]);

  return (
    <md-checkbox
      ref={ref}
      checked={optimistic}
      aria-label={label}
      disabled={pending}
      touch-target="wrapper"
    />
  );
}


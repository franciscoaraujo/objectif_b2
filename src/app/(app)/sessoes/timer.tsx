"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui";
import { Icon } from "@/components/icon";

const KEY = "objectif-b2:timer";
type TimerState = { running: boolean; startedAt: number | null; accumulatedMs: number };
const IDLE: TimerState = { running: false, startedAt: null, accumulatedMs: 0 };

function elapsed(s: TimerState, now: number) {
  return s.accumulatedMs + (s.running && s.startedAt ? now - s.startedAt : 0);
}
function fmt(ms: number) {
  const t = Math.floor(ms / 1000);
  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const listeners = new Set<() => void>();
const IDLE_RAW = JSON.stringify(IDLE);
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function readRaw() {
  return localStorage.getItem(KEY) ?? IDLE_RAW;
}
function write(s: TimerState) {
  localStorage.setItem(KEY, JSON.stringify(s));
  listeners.forEach((l) => l());
}

/** Cronômetro persistido em localStorage (sobrevive a recarregamentos). */
export function StudyTimer({ onFinish }: { onFinish: (minutes: number) => void }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => IDLE_RAW);
  const state = useMemo<TimerState>(() => {
    try {
      return JSON.parse(raw) as TimerState;
    } catch {
      return IDLE;
    }
  }, [raw]);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!state.running) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 500);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [state.running]);

  const ms = Math.max(0, elapsed(state, state.running ? now : 0));
  const active = state.running || state.accumulatedMs > 0;

  const start = () => write({ ...state, running: true, startedAt: Date.now() });
  const pause = () => write({ running: false, startedAt: null, accumulatedMs: elapsed(state, Date.now()) });
  const finish = () => {
    const total = elapsed(state, Date.now());
    write(IDLE);
    onFinish(Math.max(1, Math.round(total / 60000)));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-surface-container-lowest p-5 ring-1 ring-outline-variant/60">
      <div className="flex items-center gap-3">
        <Icon name="timer" className={state.running ? "text-primary" : "text-on-surface-variant"} />
        <div>
          <p className="text-on-surface-variant type-label-medium">
            {state.running ? "Cronômetro em andamento" : active ? "Cronômetro pausado" : "Cronômetro"}
          </p>
          <p className="type-headline-medium tabular" role="timer" aria-live="off">
            {fmt(ms)}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {state.running ? (
          <Button variant="tonal" icon="pause" onClick={pause}>
            Pausar
          </Button>
        ) : (
          <Button variant={active ? "tonal" : "filled"} icon="play_arrow" onClick={start}>
            {active ? "Retomar" : "Iniciar"}
          </Button>
        )}
        {active && (
          <Button icon="stop" onClick={finish}>
            Finalizar
          </Button>
        )}
      </div>
    </div>
  );
}


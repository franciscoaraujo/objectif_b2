/**
 * SM-2 simplificado. Qualidade (q):
 *  0 = errei (Errei), 3 = difícil, 4 = bom, 5 = fácil.
 */
export type Sm2State = { ease: number; repetitions: number; interval_days: number };
export type Sm2Quality = 0 | 3 | 4 | 5;

export function sm2(state: Sm2State, q: Sm2Quality): Sm2State & { next_review_at: string } {
  let { ease, repetitions, interval_days } = state;

  if (q < 3) {
    repetitions = 0;
    interval_days = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval_days = 1;
    else if (repetitions === 2) interval_days = 6;
    else interval_days = Math.round(interval_days * ease);
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  ease = Math.round(ease * 100) / 100;

  const next = new Date(Date.now() + interval_days * 86_400_000);
  return { ease, repetitions, interval_days, next_review_at: next.toISOString() };
}


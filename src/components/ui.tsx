"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { Icon } from "./icon";

/* ───────── Botões ───────── */
type ButtonProps = {
  variant?: "filled" | "tonal" | "outlined" | "text";
  icon?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  form?: string;
};

export function Button({ variant = "filled", icon, children, ...rest }: ButtonProps) {
  // Ícone no slot nativo do Material Web
  const withIcon = icon ? (
    <>
      <span slot="icon" className="msym" aria-hidden="true">
        {icon}
      </span>
      {children}
    </>
  ) : (
    children
  );
  switch (variant) {
    case "tonal":
      return <md-filled-tonal-button {...rest}>{withIcon}</md-filled-tonal-button>;
    case "outlined":
      return <md-outlined-button {...rest}>{withIcon}</md-outlined-button>;
    case "text":
      return <md-text-button {...rest}>{withIcon}</md-text-button>;
    default:
      return <md-filled-button {...rest}>{withIcon}</md-filled-button>;
  }
}

export function IconButton({
  icon,
  label,
  onClick,
  disabled,
  type = "button",
  tonal,
  form,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  tonal?: boolean;
  form?: string;
}) {
  const Tag = tonal ? "md-filled-tonal-icon-button" : "md-icon-button";
  return (
    <Tag aria-label={label} title={label} onClick={onClick} disabled={disabled} type={type} form={form}>
      <span className="msym" aria-hidden="true">
        {icon}
      </span>
    </Tag>
  );
}

/* ───────── Campos ───────── */
export function TextField({
  name,
  label,
  type = "text",
  defaultValue,
  required,
  rows,
  min,
  max,
  step,
  suffix,
  supporting,
  placeholder,
  maxLength,
}: {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "email" | "password" | "textarea";
  defaultValue?: string | number | null;
  required?: boolean;
  rows?: number;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  suffix?: string;
  supporting?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <md-outlined-text-field
      name={name}
      label={label}
      type={type}
      value={defaultValue ?? ""}
      required={required}
      rows={type === "textarea" ? (rows ?? 3) : undefined}
      min={min}
      max={max}
      step={step}
      suffix-text={suffix}
      supporting-text={supporting}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
}

export function SelectField({
  name,
  label,
  options,
  defaultValue,
  required,
  allowEmpty,
  onChange,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  required?: boolean;
  allowEmpty?: string;
  onChange?: (value: string) => void;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !onChange) return;
    const h = () => onChange((el as unknown as { value: string }).value);
    el.addEventListener("change", h);
    return () => el.removeEventListener("change", h);
  }, [onChange]);
  return (
    <md-outlined-select ref={ref} name={name} label={label} value={defaultValue ?? ""} required={required}>
      {allowEmpty && (
        <md-select-option value="">
          <div slot="headline">{allowEmpty}</div>
        </md-select-option>
      )}
      {options.map((o) => (
        <md-select-option key={o.value} value={o.value}>
          <div slot="headline">{o.label}</div>
        </md-select-option>
      ))}
    </md-outlined-select>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 type-body-large">
      <md-checkbox name={name} value="on" checked={defaultChecked} touch-target="wrapper" />
      {label}
    </label>
  );
}

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <md-linear-progress
      aria-label={label ?? "Progresso"}
      value={Math.min(1, Math.max(0, value))}
      style={{ width: "100%", ["--md-linear-progress-track-height" as string]: "6px", ["--md-linear-progress-active-indicator-height" as string]: "6px" }}
    />
  );
}

/* ───────── Diálogo ───────── */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = () => onClose();
    el.addEventListener("closed", h);
    return () => el.removeEventListener("closed", h);
  }, [onClose]);
  return (
    <md-dialog ref={ref} open={open}>
      <div slot="headline">{title}</div>
      <div slot="content" className="min-w-0 sm:min-w-[440px]">
        {open ? children : null}
      </div>
    </md-dialog>
  );
}

/* ───────── Formulário com Server Action ───────── */
export type ActionState = { ok: boolean; message?: string; errors?: Record<string, string> } | null;
export type FormAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function ActionForm({
  action,
  children,
  onDone,
  submitLabel = "Salvar",
  onCancel,
  submitIcon,
  className = "",
}: {
  action: FormAction;
  children: React.ReactNode;
  onDone?: () => void;
  submitLabel?: string;
  onCancel?: () => void;
  submitIcon?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    if (state?.ok) done.current?.();
  }, [state]);

  return (
    <form action={formAction} className={`flex flex-col gap-4 ${className}`}>
      {children}
      {state && !state.ok && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md bg-error-container px-3 py-2 text-on-error-container type-body-medium"
        >
          <Icon name="error" size={20} />
          <div>
            {state.message}
            {state.errors && (
              <ul className="mt-1 list-disc pl-4">
                {Object.entries(state.errors).map(([k, v]) => (
                  <li key={k}>{v}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="text" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={pending} icon={submitIcon}>
          {pending ? "Salvando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

/** Diálogo + formulário com abertura controlada por botão. */
export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  return { open, show: () => setOpen(true), hide: () => setOpen(false) };
}

"use client";

import { startTransition, useEffect, useId, useRef, useState } from "react";
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

export function Button({
  variant = "filled",
  icon,
  children,
  type = "button",
  onClick,
  form,
  ...rest
}: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (onClick) onClick();
    if (type === "submit") {
      const el = e.currentTarget;
      const targetForm = form
        ? (document.getElementById(form) as HTMLFormElement | null)
        : (el as unknown as { form?: HTMLFormElement }).form || el.closest("form");
      if (targetForm) {
        let nativeSubmit = targetForm.querySelector<HTMLButtonElement>("button[data-native-submit]");
        if (!nativeSubmit) {
          nativeSubmit = document.createElement("button");
          nativeSubmit.type = "submit";
          nativeSubmit.setAttribute("data-native-submit", "");
          nativeSubmit.style.display = "none";
          targetForm.appendChild(nativeSubmit);
        }
        nativeSubmit.click();
      }
    }
  };

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

  // Passamos type="button" para o web component do Material Web para evitar
  // que ele intercepte o evento 'submit' com um submitter CustomElement incompatível com React 19.
  // `has-icon` é refletido pelo próprio componente no navegador; renderizar já no
  // servidor evita aviso de hidratação.
  const props = {
    ...rest,
    type: "button" as const,
    onClick: handleClick,
    ...(icon ? { "has-icon": true } : {}),
  };

  switch (variant) {
    case "tonal":
      return <md-filled-tonal-button {...props}>{withIcon}</md-filled-tonal-button>;
    case "outlined":
      return <md-outlined-button {...props}>{withIcon}</md-outlined-button>;
    case "text":
      return <md-text-button {...props}>{withIcon}</md-text-button>;
    default:
      return <md-filled-button {...props}>{withIcon}</md-filled-button>;
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
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (onClick) onClick();
    if (type === "submit") {
      const el = e.currentTarget;
      const targetForm = form
        ? (document.getElementById(form) as HTMLFormElement | null)
        : (el as unknown as { form?: HTMLFormElement }).form || el.closest("form");
      if (targetForm) {
        let nativeSubmit = targetForm.querySelector<HTMLButtonElement>("button[data-native-submit]");
        if (!nativeSubmit) {
          nativeSubmit = document.createElement("button");
          nativeSubmit.type = "submit";
          nativeSubmit.setAttribute("data-native-submit", "");
          nativeSubmit.style.display = "none";
          targetForm.appendChild(nativeSubmit);
        }
        nativeSubmit.click();
      }
    }
  };

  const Tag = tonal ? "md-filled-tonal-icon-button" : "md-icon-button";
  return (
    <Tag aria-label={label} title={label} onClick={handleClick} disabled={disabled} type="button" form={form}>
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

/**
 * Campo de data com botão de calendário sempre visível.
 * Usa <input type="date"> nativo (o md-outlined-text-field esconde o seletor quando vazio):
 * `min`/`max` desabilitam os dias fora do intervalo no calendário e bloqueiam o envio.
 */
export function DateField({
  name,
  label,
  defaultValue,
  required,
  min,
  max,
  supporting,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  required?: boolean;
  min?: string;
  max?: string;
  supporting?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const id = useId();
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    try {
      ref.current?.showPicker();
    } catch {
      ref.current?.focus();
    }
  };
  const messageFor = (el: HTMLInputElement) =>
    el.validity.valueMissing
      ? "Preencha este campo."
      : el.validity.rangeUnderflow
        ? "Escolha hoje ou uma data futura."
        : el.validity.rangeOverflow
          ? "Data acima do limite permitido."
          : el.validity.badInput
            ? "Data inválida."
            : null;
  const help = error ?? supporting;

  return (
    <div className="flex flex-col gap-1">
      <fieldset
        className={`group flex h-14 items-center rounded-[4px] pb-1 transition-colors ${
          error
            ? "border-2 border-error px-[11px]"
            : "border border-outline px-3 hover:border-on-surface focus-within:border-2 focus-within:border-primary focus-within:px-[11px]"
        }`}
      >
        <legend
          className={`px-1 text-[12px] leading-4 ${error ? "text-error" : "text-on-surface-variant group-focus-within:text-primary"}`}
        >
          <label htmlFor={id}>
            {label}
            {required && "*"}
          </label>
        </legend>
        <input
          ref={ref}
          id={id}
          type="date"
          name={name}
          defaultValue={defaultValue ?? ""}
          required={required}
          min={min}
          max={max}
          aria-invalid={!!error}
          aria-describedby={help ? `${id}-help` : undefined}
          onClick={open}
          onInvalid={(e) => {
            e.preventDefault();
            setError(messageFor(e.currentTarget));
            e.currentTarget.focus();
          }}
          onChange={(e) => setError(error ? messageFor(e.currentTarget) : null)}
          className="h-full min-w-0 flex-1 cursor-pointer bg-transparent text-[16px] text-on-surface outline-none [&::-webkit-calendar-picker-indicator]:hidden"
        />
        <button
          type="button"
          onClick={open}
          aria-label={`Abrir calendário: ${label}`}
          className={`-mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-container-high ${
            error ? "text-error" : "text-on-surface-variant group-focus-within:text-primary"
          }`}
        >
          <Icon name="calendar_month" />
        </button>
      </fieldset>
      {help && (
        <p id={`${id}-help`} className={`px-4 type-body-small ${error ? "text-error" : "text-on-surface-variant"}`}>
          {help}
        </p>
      )}
    </div>
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
        <md-select-option value="" md-menu-item="">
          <div slot="headline">{allowEmpty}</div>
        </md-select-option>
      )}
      {options.map((o) => (
        <md-select-option key={o.value} value={o.value} md-menu-item="">
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
      style={{
        width: "100%",
        ["--md-linear-progress-track-height" as string]: "6px",
        ["--md-linear-progress-active-indicator-height" as string]: "6px",
      }}
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
  pendingLabel = "Salvando…",
}: {
  action: FormAction;
  children: React.ReactNode;
  onDone?: () => void;
  submitLabel?: string;
  onCancel?: () => void;
  submitIcon?: string;
  className?: string;
  pendingLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const done = useRef(onDone);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    if (!state?.ok) return;
    // Limpa só após sucesso; em caso de erro o aluno não perde o que digitou.
    formRef.current?.reset();
    done.current?.();
  }, [state]);

  return (
    <form
      ref={formRef}
      // Envio manual: com `action={...}` o React 19 limpa o formulário mesmo quando o servidor devolve erro.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className={`flex flex-col gap-4 ${className}`}
      onKeyDown={(e) => {
        // O <input> do md-outlined-text-field fica no shadow DOM, então o navegador
        // não faz o envio implícito com Enter. Fazemos manualmente (exceto em textarea).
        const target = e.target as HTMLElement & { type?: string };
        if (
          e.key === "Enter" &&
          !e.nativeEvent.isComposing &&
          target.tagName === "MD-OUTLINED-TEXT-FIELD" &&
          target.type !== "textarea"
        ) {
          e.preventDefault();
          e.currentTarget.requestSubmit();
        }
      }}
    >
      {/* Botão nativo invisível para garantir compatibilidade com submit do React 19 */}
      <button type="submit" data-native-submit style={{ display: "none" }} aria-hidden="true" tabIndex={-1} />
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
      {state?.ok && state.message && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md bg-[#d7ecd3] px-3 py-2 text-[#0f3a14] type-body-medium"
        >
          <Icon name="check_circle" size={20} />
          {state.message}
        </div>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="text" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={pending} icon={submitIcon}>
          {pending ? pendingLabel : submitLabel}
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

import "react";

type MdElementProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  // Atributos/propriedades comuns do Material Web
  name?: string;
  value?: string | number;
  label?: string;
  type?: string;
  href?: string;
  target?: string;
  disabled?: boolean;
  required?: boolean;
  checked?: boolean;
  selected?: boolean;
  open?: boolean;
  multiple?: boolean;
  rows?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  maxLength?: number;
  placeholder?: string;
  autocomplete?: string;
  inputMode?: string;
  supportingText?: string;
  "supporting-text"?: string;
  errorText?: string;
  "error-text"?: string;
  error?: boolean;
  indeterminate?: boolean;
  progress?: number;
  "trailing-icon"?: boolean;
  "has-icon"?: boolean;
  "touch-target"?: string;
  "toggle"?: boolean;
  "aria-label"?: string;
  "aria-label-selected"?: string;
  "form"?: string;
  "action"?: string;
  "prefix-text"?: string;
  "suffix-text"?: string;
  "display-text"?: string;
  "hide-focus-ring"?: boolean;
  "active"?: boolean;
  "has-label"?: boolean;
  "label-text"?: string;
  "removable"?: boolean;
  "elevated"?: boolean;
  "hide-inactive-label"?: boolean;
  "hide-inactive-labels"?: boolean;
  "active-index"?: number;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "md-filled-button": MdElementProps;
      "md-filled-tonal-button": MdElementProps;
      "md-outlined-button": MdElementProps;
      "md-text-button": MdElementProps;
      "md-elevated-button": MdElementProps;
      "md-icon-button": MdElementProps;
      "md-filled-icon-button": MdElementProps;
      "md-filled-tonal-icon-button": MdElementProps;
      "md-outlined-icon-button": MdElementProps;
      "md-outlined-text-field": MdElementProps;
      "md-filled-text-field": MdElementProps;
      "md-outlined-select": MdElementProps;
      "md-filled-select": MdElementProps;
      "md-select-option": MdElementProps;
      "md-checkbox": MdElementProps;
      "md-switch": MdElementProps;
      "md-linear-progress": MdElementProps;
      "md-circular-progress": MdElementProps;
      "md-dialog": MdElementProps;
      "md-icon": MdElementProps;
      "md-divider": MdElementProps;
      "md-ripple": MdElementProps;
      "md-chip-set": MdElementProps;
      "md-filter-chip": MdElementProps;
      "md-assist-chip": MdElementProps;
      "md-focus-ring": MdElementProps;
    }
  }
}

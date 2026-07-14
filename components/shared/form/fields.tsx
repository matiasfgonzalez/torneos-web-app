"use client";

import type { ReactNode } from "react";
import {
  useFormContext,
  useWatch,
  type Control,
  type FieldPath,
  type FieldValues,
  type PathValue,
} from "react-hook-form";
import type { LucideIcon } from "lucide-react";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";
import { cn } from "@/lib/utils";

/**
 * Campos de formulario del panel (F3) — patrón §11 de docs/UI_PATTERNS.md.
 *
 * Antes cada formulario repetía a mano la misma cadena de 12 clases por input
 * (y divergía: unos con `border-2`, otros sin `dark:`, otros sin foco de marca),
 * más el mismo bloque de `FormField > FormItem > label con barra de acento >
 * FormControl > FormMessage` en cada campo. Acá vive una sola vez.
 *
 * Todos se atan a react-hook-form (`control` + `name`), muestran el error del
 * campo debajo (validación inline en español vía `lib/zod-locale`) y marcan
 * `aria-invalid` en rojo. Se usan dentro de `<FormSheet>`, que provee el
 * `FormProvider`.
 */

const CONTROL_BASE =
  "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl transition-colors focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 aria-invalid:border-red-500 dark:aria-invalid:border-red-500";

/** 48px: objetivo táctil cómodo (mínimo 44 de WCAG/HIG). */
const INPUT_CLASS = cn(CONTROL_BASE, "h-12");
const TEXTAREA_CLASS = cn(CONTROL_BASE, "resize-y min-h-24 py-3");

interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  icon?: LucideIcon;
  /** Texto de ayuda persistente (no un placeholder que desaparece al escribir). */
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Label con la barra de acento de marca — la firma visual del form en este repo. */
function FieldLabel({
  icon: Icon,
  required,
  children,
}: Readonly<{ icon?: LucideIcon; required?: boolean; children: ReactNode }>) {
  return (
    <div className="flex items-center gap-2">
      <div
        aria-hidden="true"
        className="h-4 w-1 shrink-0 rounded-full bg-gradient-to-b from-brand to-brand-2"
      />
      <FormLabel className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
        {Icon && (
          <Icon
            className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
        )}
        {children}
        {required && (
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </FormLabel>
    </div>
  );
}

// ---------------------------------------------------------------- Texto

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  icon,
  description,
  required,
  disabled,
  className,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
}: Readonly<
  BaseFieldProps<T> & {
    placeholder?: string;
    /** `email`/`tel`/`url` levantan el teclado correcto en mobile. */
    type?: "text" | "email" | "tel" | "url";
    inputMode?: "text" | "email" | "tel" | "url" | "numeric";
    autoComplete?: string;
  }
>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FieldLabel icon={icon} required={required}>
            {label}
          </FieldLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ""}
              type={type}
              inputMode={inputMode}
              autoComplete={autoComplete}
              placeholder={placeholder}
              disabled={disabled}
              className={INPUT_CLASS}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------- Número

export function NumberField<T extends FieldValues>({
  control,
  name,
  label,
  icon,
  description,
  required,
  disabled,
  className,
  placeholder,
  min,
  max,
  step,
  /** Sufijo de unidad dentro del input (cm, kg, pts…). */
  unit,
}: Readonly<
  BaseFieldProps<T> & {
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  }
>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FieldLabel icon={icon} required={required}>
            {label}
          </FieldLabel>
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                type="number"
                inputMode="numeric"
                value={field.value ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  // "" no es 0: un campo vacío tiene que llegar vacío al schema,
                  // que decide si es opcional o un error.
                  field.onChange(raw === "" ? undefined : e.target.valueAsNumber);
                }}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(INPUT_CLASS, unit && "pr-12")}
              />
            </FormControl>
            {unit && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-gray-400 dark:text-gray-500"
              >
                {unit}
              </span>
            )}
          </div>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------- Fecha

export function DateField<T extends FieldValues>({
  control,
  name,
  label,
  icon,
  description,
  required,
  disabled,
  className,
  withTime,
}: Readonly<BaseFieldProps<T> & { withTime?: boolean }>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FieldLabel icon={icon} required={required}>
            {label}
          </FieldLabel>
          <FormControl>
            {/* El valor vive como string ("2026-07-14" / "2026-07-14T20:30") y
                se convierte a Date recién al enviar: guardar un Date en el
                estado del form obligaba a un toISOString().split("T") en cada
                render y corría el día por zona horaria. */}
            <Input
              {...field}
              value={field.value ?? ""}
              type={withTime ? "datetime-local" : "date"}
              disabled={disabled}
              className={INPUT_CLASS}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------- Textarea

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  icon,
  description,
  required,
  disabled,
  className,
  placeholder,
  rows = 4,
}: Readonly<BaseFieldProps<T> & { placeholder?: string; rows?: number }>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FieldLabel icon={icon} required={required}>
            {label}
          </FieldLabel>
          <FormControl>
            <Textarea
              {...field}
              value={field.value ?? ""}
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
              className={TEXTAREA_CLASS}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------- Select

export interface FieldOption {
  value: string;
  label: string;
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  icon,
  description,
  required,
  disabled,
  className,
  placeholder = "Seleccionar…",
  options,
}: Readonly<
  BaseFieldProps<T> & {
    placeholder?: string;
    options: readonly FieldOption[];
  }
>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FieldLabel icon={icon} required={required}>
            {label}
          </FieldLabel>
          <Select
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className={cn(INPUT_CLASS, "w-full")}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------- Booleano

export function SwitchField<T extends FieldValues>({
  control,
  name,
  label,
  disabled,
  className,
  /** Texto que cambia según el estado: dice qué pasa, no repite el label. */
  onText,
  offText,
}: Readonly<
  Omit<BaseFieldProps<T>, "icon" | "required" | "description"> & {
    onText: string;
    offText: string;
  }
>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex flex-row items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900",
            className,
          )}
        >
          <div className="space-y-0.5">
            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {label}
            </FormLabel>
            <FormDescription className="text-xs">
              {field.value ? onText : offText}
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className="data-[state=checked]:bg-brand"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------- Imagen

export function ImageField<T extends FieldValues>({
  control,
  name,
  publicIdName,
  label,
  icon,
  description,
  disabled,
  className,
  folder,
  placeholder,
}: Readonly<
  BaseFieldProps<T> & {
    /** Campo hermano donde se guarda el `publicId` de Cloudinary. */
    publicIdName: FieldPath<T>;
    folder: string;
    placeholder?: string;
  }
>) {
  const { setValue } = useFormContext<T>();
  // useWatch y no form.watch(): ver la nota de `react-hooks/incompatible-library`
  // en team-form.tsx — watch() devuelve una función no memoizable.
  const publicId = useWatch({ control, name: publicIdName });

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FieldLabel icon={icon}>{label}</FieldLabel>
          <FormControl>
            <CloudinaryUpload
              folder={folder}
              value={field.value ?? null}
              publicId={publicId ?? null}
              onChange={(url, publicId) => {
                setValue(name, (url ?? null) as PathValue<T, typeof name>, {
                  shouldDirty: true,
                });
                setValue(
                  publicIdName,
                  (publicId ?? null) as PathValue<T, typeof publicIdName>,
                  { shouldDirty: true },
                );
              }}
              disabled={disabled}
              placeholder={placeholder}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------- Color

const TEAM_COLORS = [
  { name: "Rojo", value: "#DC2626" },
  { name: "Azul", value: "#2563EB" },
  { name: "Verde", value: "#16A34A" },
  { name: "Amarillo", value: "#CA8A04" },
  { name: "Negro", value: "#000000" },
  { name: "Blanco", value: "#FFFFFF" },
  { name: "Naranja", value: "#EA580C" },
  { name: "Violeta", value: "#9333EA" },
] as const;

export function ColorField<T extends FieldValues>({
  control,
  name,
  label,
  icon,
  disabled,
  className,
}: Readonly<Omit<BaseFieldProps<T>, "required" | "description">>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FieldLabel icon={icon}>{label}</FieldLabel>
          <div
            role="group"
            aria-label={`Colores sugeridos para ${label.toLowerCase()}`}
            className="flex flex-wrap gap-2"
          >
            {TEAM_COLORS.map((color) => {
              const selected =
                typeof field.value === "string" &&
                field.value.toUpperCase() === color.value;
              return (
                <button
                  key={color.value}
                  type="button"
                  disabled={disabled}
                  aria-label={color.name}
                  aria-pressed={selected}
                  onClick={() => field.onChange(color.value)}
                  style={{ backgroundColor: color.value }}
                  className={cn(
                    // 44px de objetivo táctil aunque el disco se vea de 32
                    "flex h-11 w-11 items-center justify-center rounded-full border-2 bg-clip-content p-1.5 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
                    selected
                      ? "border-brand ring-2 ring-brand/30"
                      : "border-gray-300 dark:border-gray-600",
                  )}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <FormControl>
              <Input
                type="color"
                value={field.value ?? "#FFFFFF"}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                disabled={disabled}
                aria-label={`${label}: selector de color`}
                className="h-11 w-14 cursor-pointer rounded-xl border-2 border-gray-200 p-1 dark:border-gray-700"
              />
            </FormControl>
            <Input
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              disabled={disabled}
              placeholder="#FFFFFF"
              aria-label={`${label}: código hexadecimal`}
              className={cn(INPUT_CLASS, "h-11 flex-1 font-mono text-sm")}
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ---------------------------------------------------------------- Sección

/**
 * Agrupa campos relacionados (`field-grouping` de la checklist de UX). El
 * formulario largo se lee como 4-5 bloques, no como 25 inputs sueltos.
 */
export function FormSection({
  icon: Icon,
  title,
  description,
  children,
  className,
}: Readonly<{
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-5 dark:border-gray-800 dark:bg-gray-900/50",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-mid">
          <Icon className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

/** Fila de 2 (o 3) campos que colapsa a 1 columna en mobile. */
export function FieldRow({
  children,
  cols = 2,
  className,
}: Readonly<{ children: ReactNode; cols?: 2 | 3; className?: string }>) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

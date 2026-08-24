// src/presentation/components/Common/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/presentation/lib/cn';

/**
 * Variantes tipadas en un solo sitio: si mañana el foco se ve distinto, se toca
 * acá y no en veinte componentes. El área táctil mínima va en la base, no como
 * decisión de cada pantalla.
 */
export const buttonVariants = cva(
  'inline-flex min-h-touch items-center justify-center gap-2 rounded font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-surface hover:opacity-90',
        secondary: 'bg-surface-raised text-ink hover:opacity-90',
        ghost: 'text-ink underline underline-offset-4 hover:opacity-80',
      },
      size: {
        sm: 'px-3 text-sm',
        md: 'px-4',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

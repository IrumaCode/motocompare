import type { ButtonHTMLAttributes } from 'react';
import { buttonClassName, type ButtonVariant } from './button-styles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button type="button" className={buttonClassName(variant, className)} {...props} />;
}

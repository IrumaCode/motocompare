import type { ButtonHTMLAttributes } from 'react';
import { buttonClassName, type ButtonSize, type ButtonVariant } from './button-styles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = 'primary', size, className = '', ...props }: ButtonProps) {
  return <button type="button" className={buttonClassName(variant, className, size)} {...props} />;
}

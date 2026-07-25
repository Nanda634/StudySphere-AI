import React from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:shadow-hover",

  secondary:
    "bg-card border border-border text-text hover:bg-elevated",

  outline:
    "border border-primary text-primary hover:bg-primary/10",

  ghost:
    "text-muted hover:text-white hover:bg-white/5",

  danger:
    "bg-danger hover:bg-red-600 text-white",

  success:
    "bg-success hover:bg-green-600 text-white",
};

const sizes = {
  xs: "h-8 px-3 text-xs",

  sm: "h-10 px-4 text-sm",

  md: "h-12 px-6 text-base",

  lg: "h-14 px-8 text-lg",
};

export default function Button({
  children,

  variant = "primary",

  size = "md",

  loading = false,

  disabled = false,

  leftIcon,

  rightIcon,

  fullWidth = false,

  rounded = false,

  className = "",

  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
      inline-flex
      items-center
      justify-center
      gap-2
      font-semibold
      transition-all
      duration-300
      ease-out
      active:scale-95
      disabled:opacity-60
      disabled:cursor-not-allowed

      ${rounded ? "rounded-full" : "rounded-xl"}

      ${variants[variant]}

      ${sizes[size]}

      ${fullWidth ? "w-full" : ""}

      ${className}
      `}
      {...props}
    >
      {loading && (
        <Loader2
          className="animate-spin"
          size={18}
        />
      )}

      {!loading && leftIcon}

      <span>{children}</span>

      {!loading && rightIcon}
    </button>
  );
}
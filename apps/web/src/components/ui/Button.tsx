import { cls } from "@/lib/format";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "green" | "red" | "ghost" | "outline";

const styles: Record<Variant, string> = {
  primary: "btn-primary",
  green: "btn-green",
  red: "btn-red",
  ghost: "btn-ghost",
  outline: "btn-outline",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = "primary", className, ...rest }: Props) {
  return <button className={cls(styles[variant], className)} {...rest} />;
}

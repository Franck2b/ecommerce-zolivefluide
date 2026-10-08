"use client";

import type { ComponentProps } from "react";

/** Bouton de soumission qui demande confirmation avant une action irréversible. */
export function ConfirmButton({ message, ...props }: ComponentProps<"button"> & { message: string }) {
  return (
    <button
      type="submit"
      {...props}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    />
  );
}

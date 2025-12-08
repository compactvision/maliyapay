import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // --- Styles de base ---
          "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          
          // --- AMÉLIORATIONS POUR UN RENDU PREMIUM ---
          // Couleurs de texte et de fond sémantiques.
          "text-foreground bg-background",
          
          // --- STYLING DE LA BORDURE (LE CHANGEMENT CLÉ) ---
          // Couleur de bordure par défaut qui s'adapte au thème.
          "border-border",
          // Transition fluide pour toutes les propriétés.
          "transition-all duration-200",
          
          // --- ÉTATS DE SURVOL ET FOCUS ---
          // Au survol ET au focus, la bordure prend la couleur primaire (vert émeraude).
          // Cela garantit une visibilité maximale et un feedback clair.
          "hover:border-primary focus-visible:border-primary",
          
          // --- AMÉLIORATIONS SPÉCIFIQUES AU DARK MODE ---
          // Effet "glassmorphism" : fond légèrement transparent et ombre intérieure.
          "dark:bg-accent/20 dark:shadow-inner",
          // L'anneau de focus est renforcé par une ombre colorée en mode sombre.
          "focus-visible:dark:shadow-lg focus-visible:dark:shadow-primary/20",
          
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
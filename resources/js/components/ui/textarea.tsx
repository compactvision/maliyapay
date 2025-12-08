import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // --- Styles de base ---
        "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        
        // --- AMÉLIORATIONS POUR UN RENDU PREMIUM ---
        // Couleurs de texte, de fond et de bordure sémantiques qui s'adaptent au thème.
        "text-foreground bg-background border-border",
        
        // Transition fluide pour toutes les propriétés (fond, bordure, ombre).
        "transition-all duration-200",
        
        // --- STYLING DE LA BORDURE (LE CHANGEMENT CLÉ) ---
        // Au survol ET au focus, la bordure prend la couleur primaire (vert émeraude).
        // Cela garantit une visibilité maximale et un feedback clair.
        "hover:border-primary focus-visible:border-primary",
        
        // --- AMÉLIORATIONS SPÉCIFIQUES AU DARK MODE ---
        // Effet "glassmorphism" : fond légèrement transparent et ombre intérieure.
        "dark:bg-accent/20 dark:shadow-inner",
        // Ombre colorée au focus pour un effet "pop" en mode sombre.
        "focus-visible:dark:shadow-lg focus-visible:dark:shadow-primary/20",
        
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
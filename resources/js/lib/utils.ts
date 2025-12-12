import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const getDynamicGreeting = (userName: string): string => {
    const hour = new Date().getHours();
    const name = userName || 'Invité';

    // Définir des plages horaires pour des salutations spécifiques
    if (hour >= 5 && hour < 12) {
        // Matin
        return `Bonjour, ${name}. Excellente journée à vous !`;
    } else if (hour >= 12 && hour < 14) {
        // Midi
        return `Bonjour, ${name}. Bon appétit !`;
    } else if (hour >= 14 && hour < 18) {
        // Après-midi
        return `Bon après-midi, ${name}. Bienvenue !`;
    } else if (hour >= 18 && hour < 22) {
        // Soirée
        return `Bonsoir, ${name}. Passez une bonne soirée.`;
    } else {
        // Nuit
        return `Bonsoir, ${name}.`;
    }
};

export const getShortDynamicGreeting = (userName: string): string => {
    const hour = new Date().getHours();
    const name = userName || 'Invité';

    if (hour >= 5 && hour < 12) {
        return `Bonjour, ${name}`;
    } else if (hour >= 12 && hour < 18) {
        return `Bon après-midi, ${name}`;
    } else {
        return `Bonsoir, ${name}`;
    }
};
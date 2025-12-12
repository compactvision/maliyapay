import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface IconInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon; 
    trailingIcon?: LucideIcon; 
    onTrailingIconClick?: () => void; 
}

const IconInput = React.forwardRef<HTMLInputElement, IconInputProps>(
    ({ className, type, icon: Icon, trailingIcon: TrailingIcon, onTrailingIconClick, ...props }, ref) => {
        return (
            <div className="relative group">
                {Icon && (
                    <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50 transition-colors duration-300 group-focus-within:text-emerald-400" />
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-12 text-base text-white placeholder:text-white/40 shadow-lg backdrop-blur-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:border-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-50",
                        TrailingIcon && "pr-14", 
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {TrailingIcon && onTrailingIconClick && (
                    <button
                        type="button"
                        onClick={onTrailingIconClick}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 transition-colors duration-300 hover:text-white/80"
                    >
                        <TrailingIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
        )
    }
)
IconInput.displayName = "IconInput"

export { IconInput }
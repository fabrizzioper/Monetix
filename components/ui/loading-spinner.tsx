import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-monetix-primary",
        sizeClasses[size],
        className,
      )}
    />
  )
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm p-4">
      <div className="flex flex-col items-center gap-4 max-w-xs w-full">
        <LoadingSpinner size="lg" />
        {text && <span className="text-gray-800 text-base sm:text-lg font-medium drop-shadow-lg text-center w-full break-words">{text}</span>}
      </div>
    </div>
  )
}

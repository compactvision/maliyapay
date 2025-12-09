import { useState, useEffect } from "react"

export const useToast = () => {
  const [toasts, setToasts] = useState<any[]>([])

  const toast = ({ title, description, variant }: any) => {
    const id = Math.random().toString(36).substr(2, 9)
    console.log(`Toast: ${title} - ${description} (${variant})`)
    setToasts((prev) => [...prev, { id, title, description, variant }])
    
    // Auto dismiss
    setTimeout(() => {
        dismiss(id)
    }, 3000)
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return {
    toast,
    dismiss,
    toasts,
  }
}

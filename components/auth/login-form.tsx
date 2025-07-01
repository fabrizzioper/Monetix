"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/hooks/use-auth"
import { validateLoginForm } from "@/lib/utils/validation"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [submitError, setSubmitError] = useState("")

  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    const validation = validateLoginForm(email, password)
    setErrors(validation.errors)

    if (!validation.isValid) return

    const result = await login({ email, password })

    if (!result.success) {
      setSubmitError(result.message || "Error al iniciar sesión")
    }
  }

  const handleGoToRegister = () => {
    router.push("/register")
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 px-4 sm:px-6 lg:px-0">
      <div className="space-y-2 text-center">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-gray-900">Iniciar sesión</h1>
        <p className="text-sm sm:text-base text-gray-600">Bienvenido de nuevo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn("w-full h-12 text-base sm:text-sm", errors.email && "border-red-500 focus:border-red-500")}
            disabled={isLoading}
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "w-full h-12 text-base sm:text-sm pr-12",
                errors.password && "border-red-500 focus:border-red-500",
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        </div>

        {submitError && (
          <div className="p-3 sm:p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {submitError}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 sm:h-10 bg-monetix-primary hover:bg-monetix-secondary text-white font-medium text-base sm:text-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" className="text-white" />
              <span>Iniciando sesión...</span>
            </div>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <button className="font-medium text-monetix-primary hover:text-monetix-secondary" onClick={handleGoToRegister}>
            Regístrate
          </button>
        </p>
      </div>
    </div>
  )
}

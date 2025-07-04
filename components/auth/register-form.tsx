"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AdvancedImage } from '@cloudinary/react'
import { Cloudinary } from '@cloudinary/url-gen'
import { fill } from '@cloudinary/url-gen/actions/resize'

const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET

if (!CLOUDINARY_UPLOAD_PRESET) throw new Error("CLOUDINARY_UPLOAD_PRESET is not set in .env")
if (!CLOUDINARY_CLOUD_NAME) throw new Error("CLOUDINARY_CLOUD_NAME is not set in .env")
if (!CLOUDINARY_API_KEY) throw new Error("CLOUDINARY_API_KEY is not set in .env")
// CLOUDINARY_API_SECRET solo para referencia, no usar en frontend

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({})
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const cld = new Cloudinary({ cloud: { cloudName: CLOUDINARY_CLOUD_NAME } })

  const validate = () => {
    const errs: typeof errors = {}
    if (!email) errs.email = "El correo es obligatorio"
    if (!password) errs.password = "La contraseña es obligatoria"
    if (!name) errs.name = "El nombre es obligatorio"
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")
    setSubmitSuccess("")
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setIsLoading(true)
    let avatarUrl = avatar
    // Si hay archivo seleccionado, subirlo antes de registrar
    if (avatarFile) {
      const uploadedUrl = await uploadToCloudinary(avatarFile)
      if (!uploadedUrl) {
        setIsLoading(false)
        setSubmitError("Error al subir la imagen. Intenta con otra.")
        return
      }
      avatarUrl = uploadedUrl
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, avatar: avatarUrl }),
      })
      if (res.ok) {
        setSubmitSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.")
        router.push("/login")
      } else {
        const data = await res.json()
        setSubmitError(data.error || "Error al registrar")
      }
    } catch (err) {
      setSubmitError("Error de red o del servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToLogin = () => {
    router.push("/login")
  }

  // Subir imagen a Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET!)
    formData.append("api_key", CLOUDINARY_API_KEY!)
    formData.append("cloud_name", CLOUDINARY_CLOUD_NAME!)
    try {
      const res = await fetch(url, { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error?.message || "Error al subir la imagen")
        return null
      }
      return data.secure_url || null
    } catch (e) {
      alert("Error de red o del servidor al subir la imagen")
      return null
    }
  }

  // Manejar selección de archivo
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setAvatar("") // Limpiar avatar URL previa, nunca pasar null
    } else {
      setAvatarPreview("")
      setAvatar("")
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 px-4 sm:px-6 lg:px-0">
      <div className="space-y-2 text-center">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-gray-900">Crear cuenta</h1>
        <p className="text-sm sm:text-base text-gray-600">Regístrate para comenzar</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre</Label>
          <Input
            id="name"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn("w-full h-12 text-base sm:text-sm", errors.name && "border-red-500 focus:border-red-500")}
            disabled={isLoading}
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn("w-full h-12 text-base sm:text-sm", errors.email && "border-red-500 focus:border-red-500")}
            disabled={isLoading}
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn("w-full h-12 text-base sm:text-sm", errors.password && "border-red-500 focus:border-red-500")}
            disabled={isLoading}
          />
          {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatarFile" className="text-sm font-medium text-gray-700">Avatar (opcional)</Label>
          <div className="flex flex-col items-center">
            <div className="relative group">
              {/* Área circular para preview o placeholder */}
              <div className="w-20 h-20 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden">
                {isLoading ? (
                  <LoadingSpinner size="lg" className="text-monetix-primary" />
                ) : avatar && avatar.startsWith('http') && avatar.includes('res.cloudinary.com') ? (() => {
                  const matches = avatar.match(/\/upload\/([^.#?]+)(?:[?#].*)?$/)
                  const publicId = matches ? matches[1] : null
                  if (!publicId) return null
                  const img = cld.image(publicId)
                  img.resize(fill().width(80).height(80))
                  return <AdvancedImage cldImg={img} />
                })() : avatarPreview ? (
                  <Image src={avatarPreview} alt="Vista previa avatar" width={80} height={80} className="object-cover w-20 h-20" />
                ) : (
                  <span className="text-gray-400 text-3xl">+</span>
                )}
              </div>
              {/* Botón flotante para seleccionar archivo */}
              <label htmlFor="avatarFile" className="absolute bottom-0 right-0 bg-monetix-primary hover:bg-monetix-secondary text-white rounded-full p-2 shadow cursor-pointer border-2 border-white transition-all group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4 2.828 2.828 0 014 4z" /></svg>
                <input
                  id="avatarFile"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
            <span className="text-xs text-gray-500 mt-2">Máx. 2MB. JPG, PNG, GIF.</span>
          </div>
        </div>
        {submitError && (
          <div className="p-3 sm:p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {submitError}
          </div>
        )}
        {submitSuccess && (
          <div className="p-3 sm:p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            {submitSuccess}
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
              <span>Registrando...</span>
            </div>
          ) : (
            "Registrarse"
          )}
        </Button>
      </form>
      <div className="text-center">
        <p className="text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <button className="font-medium text-monetix-primary hover:text-monetix-secondary" onClick={handleGoToLogin}>
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  )
} 
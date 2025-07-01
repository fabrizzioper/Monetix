"use client"

import { useState, useEffect, useCallback } from "react"
import type { LoginCredentials, AuthState } from "@/lib/types"
import { AuthService } from "@/lib/services/auth.service"
import { useRouter } from "next/navigation"

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const router = useRouter()

  useEffect(() => {
    const user = AuthService.getStoredUser()
    setAuthState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    })
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      try {
        const response = await AuthService.login(credentials)

        if (response.success) {
          setAuthState({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          })
          router.push("/dashboard")
          return { success: true, message: response.message }
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }))
          return { success: false, message: response.message }
        }
      } catch (error) {
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return { success: false, message: "Error de conexión" }
      }
    },
    [router],
  )

  const logout = useCallback(() => {
    AuthService.logout()
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
    router.push("/")
  }, [router])

  return {
    ...authState,
    login,
    logout,
  }
}

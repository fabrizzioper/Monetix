import type { LoginCredentials, User, ApiResponse } from "@/lib/types"

export class AuthService {
  private static readonly TOKEN_KEY = "monetix_token"
  private static readonly USER_KEY = "monetix_user"

  static async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    // Llamar a la API real
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
      const data = await response.json()
      if (!data.success) {
        return {
          success: false,
          message: data.error || "Credenciales inválidas",
          data: null as any,
        }
      }
      const token = data.token
      const user = data.user
      if (typeof window !== "undefined") {
        localStorage.setItem(this.TOKEN_KEY, token)
        localStorage.setItem(this.USER_KEY, JSON.stringify(user))
      }
      return {
        success: true,
        data: user,
        message: "Login exitoso",
      }
    } catch (e) {
      return {
        success: false,
        message: "Error de conexión",
        data: null as any,
      }
    }
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)
    }
  }

  static getStoredUser(): User | null {
    if (typeof window === "undefined") return null

    const userStr = localStorage.getItem(this.USER_KEY)
    const token = localStorage.getItem(this.TOKEN_KEY)

    if (!userStr || !token) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  static isAuthenticated(): boolean {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem(this.TOKEN_KEY)
  }
}

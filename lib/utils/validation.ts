export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 4
}

export function validateLoginForm(
  email: string,
  password: string,
): {
  isValid: boolean
  errors: { email?: string; password?: string }
} {
  const errors: { email?: string; password?: string } = {}

  if (!email) {
    errors.email = "El email es requerido"
  } else if (!validateEmail(email)) {
    errors.email = "Email inválido"
  }

  if (!password) {
    errors.password = "La contraseña es requerida"
  } else if (!validatePassword(password)) {
    errors.password = "La contraseña debe tener al menos 4 caracteres"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

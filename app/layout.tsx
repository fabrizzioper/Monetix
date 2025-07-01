import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { CurrentBondProvider } from "@/lib/hooks/use-current-bond"

export const metadata: Metadata = {
  title: "Monetix - Gestión de Bonos",
  description: "Sistema de gestión y cálculo de bonos financieros",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>
        <CurrentBondProvider>{children}</CurrentBondProvider>
      </body>
    </html>
  )
}

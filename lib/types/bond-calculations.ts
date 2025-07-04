/* ---------- 1. Tipos básicos ---------- */

export interface BondInput {
  // Datos principales
  valorNominal: number // S/
  nAnios: number // años
  frecuenciaCupon: number // 1 = anual, 2 = semestral…
  diasPorAnio: 360 | 365 // convención
  tipoTasa: "Efectiva" | "Nominal"
  tasaInteres: number // % (ej. 7.375)
  tipoGracia: "Total" | "Parcial" | "Ninguna"
  plazoGraciaAnio: number // años
  nPeriodosGracia?: number // calculado: plazoGraciaAnio × frecuenciaCupon
  // Costes iniciales (%)
  pctEstruct: number // % sobre nominal
  pctColoc: number // %
  pctCavali: number // %
  // Parámetro opcional del inversionista
  kd?: number // % tasa de descuento
  capitalizacion?: string // frecuencia de capitalización para tasa nominal
  tasaOportunidad: number // % anual de oportunidad
}

export interface FlowRow {
  n: number // periodo
  plazoGracia: "" | "P" | "T" | "S" // EXACTO como tu guía
  bono: number // saldo antes de amort.
  saldoFinal: number // igual a bono
  cuponInteres: number // cupón (negativo para emisor) - NOMBRE CORREGIDO
  cuota: number // cupón + amortización
  amort: number // amortización principal
  flujoEmisor: number
  flujoBonista: number
  flujoAct: number // valor presente - NOMBRE CORREGIDO
  faXPlazo: number // PV * n - NOMBRE CORREGIDO
  factorConv: number // PV * n * (n+1)
}

export interface BondConstants {
  frecuenciaCupon: number // m
  nPeriodosPorAnio: number // = m
  nTotalPeriodos: number // N = nAnios × m
  nPeriodosGracia: number // Ng = plazoGraciaAnio × m
  tasaEfectivaAnual: number // TEA
  tasaEfectivaMensual: number // TEM (siempre mensual para comparación)
  tasaEfectivaPeriodo?: number // TET, TES, etc. según frecuencia
  nombreTasaPeriodo?: string // "TET", "TES", etc.
  tasaPeriodica: number // i
  costesInicialesEmisor: number
  costesInicialesBonista: number
}

export interface BondMetrics {
  precioActual: number
  utilidad: number
  duracion: number
  convexidad: number
  total: number
  duracionModif: number
  tceaEmisor: number // TIR efectiva anual
  treaBonista: number // TIR efectiva anual
}

export interface BondCalculationResult {
  input: BondInput
  constants: BondConstants
  schedule: FlowRow[]
  metrics: BondMetrics
}

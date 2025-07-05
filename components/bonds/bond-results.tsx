"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Download,
  Share,
  Calculator,
  FileSpreadsheet,
  FileText,
  Table,
  TrendingUp,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentBond } from "@/lib/hooks/use-current-bond"
import { formatCurrency } from "@/lib/utils/format"
import { ExportService } from "@/lib/services/export.service"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BondScheduleTable } from "./visualizations/bond-schedule-table"
import { BondLineChart } from "./visualizations/bond-line-chart"
import { cn } from "@/lib/utils"
import { LoadingSpinner, LoadingOverlay } from "@/components/ui/loading-spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { BondConstantsModal } from "./bond-constants-modal"

type ViewType = "table" | "line"

const viewOptions = [
  { id: "table", label: "Tabla", icon: Table, description: "Vista tabular detallada" },
  { id: "line", label: "Línea", icon: TrendingUp, description: "Flujos en el tiempo" },
] as const

function MetricsCard({
  title,
  value,
  description,
  className,
}: {
  title: string
  value: string | number
  description?: string
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-gray-900">
          {typeof value === "number"
            ? value.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : value}
        </div>
        <div className="text-sm font-medium text-gray-600">{title}</div>
        {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
      </CardContent>
    </Card>
  )
}

function StructuringBlock() {
  const { calculationResult } = useCurrentBond()
  const [showConstantesModal, setShowConstantesModal] = useState(false)

  if (!calculationResult) return null

  const { constants, input } = calculationResult

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estructuración del Bono</CardTitle>
        <CardDescription>Constantes derivadas de los datos de entrada</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{(() => {
              switch (Number(constants.frecuenciaCupon)) {
                case 12: return 'Mensual (12)';
                case 6: return 'Bimestral (6)';
                case 4: return 'Trimestral (4)';
                case 3: return 'Cuatrimestral (3)';
                case 2: return 'Semestral (2)';
                case 1: return 'Anual (1)';
                default: return constants.frecuenciaCupon;
              }
            })()}</div>
            <div className="text-sm text-gray-600">Frecuencia Cupón</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{input.diasPorAnio} / {constants.frecuenciaCupon} = {input.diasPorAnio && constants.frecuenciaCupon ? (input.diasPorAnio / constants.frecuenciaCupon) : ''}</div>
            <div className="text-sm text-gray-600">Días × Año / Frecuencia Cupón</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{constants.nPeriodosPorAnio}</div>
            <div className="text-sm text-gray-600">Nº Periodos/Año</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{constants.nTotalPeriodos}</div>
            <div className="text-sm text-gray-600">Nº Total Periodos</div>
          </div>
         
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{(() => {
              if (input.tipoTasa === 'Efectiva') {
                return `${Number(input.tasaInteres).toFixed(5)}%`;
              } else if (input.tipoTasa === 'Nominal' && input.tasaInteres) {
                let m = null;
                switch (input.capitalizacion) {
                  case 'Diaria': m = 360; break;
                  case 'Quincenal': m = 24; break;
                  case 'Mensual': m = 12; break;
                  case 'Bimestral': m = 6; break;
                  case 'Trimestral': m = 4; break;
                  case 'Cuatrimestral': m = 3; break;
                  case 'Semestral': m = 2; break;
                  case 'Anual': m = 1; break;
                  default: m = null;
                }
                const tna = Number(input.tasaInteres) / 100;
                if (m) {
                  const tea = (Math.pow(1 + tna / m, m) - 1) * 100;
                  return `${tea.toFixed(5)}%`;
                } else if (input.diasPorAnio && constants.frecuenciaCupon) {
                  const m2 = input.diasPorAnio / constants.frecuenciaCupon;
                  const tea = (Math.pow(1 + tna / m2, m2) - 1) * 100;
                  return `${tea.toFixed(5)}%`;
                } else {
                  return '';
                }
              } else {
                return '';
              }
            })()}</div>
            <div className="text-sm text-gray-600">TEA</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {constants.tasaEfectivaPeriodo ? (constants.tasaEfectivaPeriodo * 100).toFixed(5) + '%' : (constants.tasaEfectivaMensual * 100).toFixed(5) + '%'}
            </div>
            <div className="text-sm text-gray-600">{constants.nombreTasaPeriodo || "Tasa por Período"}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(constants.costesInicialesEmisor, 'PEN')}
            </div>
            <div className="text-sm text-gray-600 flex flex-col items-center gap-1">
              Costes Iniciales Emisor
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(constants.costesInicialesBonista, "PEN")}
            </div>
            <div className="text-sm text-gray-600">Costes Bonista</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{constants.nPeriodosGracia}</div>
            <div className="text-sm text-gray-600">Nº Periodos Gracia</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {constants.cokPeriodo ? constants.cokPeriodo.toFixed(5) + '%' : ''}
            </div>
            <div className="text-sm text-gray-600">COK {constants.frecuenciaCupon === 1 ? 'Anual' : constants.nombreTasaPeriodo || 'por Período'}</div>
          </div>
          {/* Campo: Días capitalización (solo si tipoTasa === 'Nominal') */}
          {input.tipoTasa === 'Nominal' && constants.diasCapitalizacion && (
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{constants.diasCapitalizacion}</div>
              <div className="text-sm text-gray-600">Días capitalización</div>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  )
}

export function BondResults() {
  const router = useRouter()
  const { calculationResult, currentBond, mode } = useCurrentBond()
  const [currentView, setCurrentView] = useState<ViewType>("table")
  const [recalculating, setRecalculating] = useState(false)
  const [showCostesModal, setShowCostesModal] = useState(false)
  const [showConstantesModal, setShowConstantesModal] = useState(false)

  useEffect(() => {
    if (!calculationResult) {
      router.push("/dashboard")
    }
  }, [calculationResult, router])

  if (!calculationResult) {
    return null
  }

  const { metrics, input, constants } = calculationResult

  const handleExportExcel = () => {
    if (calculationResult && currentBond) {
      ExportService.exportToExcel(calculationResult, currentBond.name)
    }
  }

  const handleExportDocumentation = () => {
    if (currentBond) {
      ExportService.exportDocumentation(currentBond.name)
    }
  }

  const renderVisualization = () => {
    switch (currentView) {
      case "table":
        return <BondScheduleTable />
      case "line":
        return <BondLineChart />
      default:
        return <BondScheduleTable />
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
      {recalculating && <LoadingOverlay text="Redirigiendo..." />}
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {currentBond ? `Resultados: ${currentBond.name}` : "Resultados del Cálculo"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Análisis completo del bono calculado</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Share className="h-4 w-4 mr-2" />
            Compartir
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExportExcel()}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar a Excel/CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportDocumentation()}>
                <FileText className="h-4 w-4 mr-2" />
                Documentación Completa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {currentBond && mode === "view" && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setRecalculating(true)
                router.push("/nuevo")
              }}
              className="w-full sm:w-auto"
              disabled={recalculating}
            >
              {recalculating ? (
                <><LoadingSpinner size="sm" className="mr-2" />Recalculando...</>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Recalcular
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Resto del contenido con grids responsive */}
      {/* 1. Estructuración del Bono */}
      <StructuringBlock />
      <div className="flex justify-end mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setShowConstantesModal(true)}
        >
          <Info className="h-4 w-4 mr-1" />
          Ver cálculos detallados
        </Button>
      </div>
      {/* Modal de cálculos detallados */}
      <BondConstantsModal open={showConstantesModal} onOpenChange={setShowConstantesModal} input={input} constants={constants} />

  
      {/* 3. Ratios de decisión */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Ratios de Decisión</CardTitle>
          <CardDescription>Indicadores para análisis de riesgo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.duracion.toFixed(2)}</div>
              <div className="text-xs sm:text-sm font-medium text-gray-600">Duración</div>
              <div className="text-xs text-gray-500">Sensibilidad a tasas</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.convexidad.toFixed(2)}</div>
              <div className="text-xs sm:text-sm font-medium text-gray-600">Convexidad</div>
              <div className="text-xs text-gray-500">Curvatura precio-tasa</div>
            </div>
         
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.duracionModif.toFixed(2)}</div>
              <div className="text-xs sm:text-sm font-medium text-gray-600">Duración Mod.</div>
              <div className="text-xs text-gray-500">Duración / (1 + kd)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Indicadores de Rentabilidad */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores de Rentabilidad</CardTitle>
          <CardDescription>Tasas internas de retorno efectivas anuales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">{(metrics.tceaEmisor * 100).toFixed(5)}%</div>
              <div className="text-sm font-medium text-red-600">TCEA Emisor</div>
              <div className="text-xs text-gray-500">Tasa de costo efectiva anual para el emisor</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">{(metrics.treaBonista * 100).toFixed(5)}%</div>
              <div className="text-sm font-medium text-green-600">TREA Bonista</div>
              <div className="text-xs text-gray-500">Tasa de rentabilidad efectiva anual para el bonista</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Visualización de Datos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Análisis de Cronograma</CardTitle>
          <CardDescription>Diferentes vistas de los datos del cronograma</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Botones de Vista */}
          <div className="flex flex-wrap gap-2 mb-6">
            {viewOptions.map((option) => {
              const Icon = option.icon
              const isActive = currentView === option.id

              return (
                <Button
                  key={option.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView(option.id as ViewType)}
                  className={cn(
                    "flex items-center gap-2 h-10 px-4",
                    isActive && "bg-monetix-primary hover:bg-monetix-secondary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                  <span className="sm:hidden">{option.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Vista Actual */}
          <div className="min-h-[400px]">{renderVisualization()}</div>

          {/* Descripción de la vista actual */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>{viewOptions.find((v) => v.id === currentView)?.label}:</strong>{" "}
              {viewOptions.find((v) => v.id === currentView)?.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

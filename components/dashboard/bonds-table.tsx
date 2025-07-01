"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, Edit, Trash2, Plus, Calculator, Search, Filter, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner, LoadingOverlay } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useUserBonds } from "@/lib/hooks/use-user-bonds"
import { useCurrentBond } from "@/lib/hooks/use-current-bond"
import { formatCurrency } from "@/lib/utils/format"
import { calculateBond } from "@/lib/services/bond-calculations.service"
import { BondsService } from "@/lib/services/bonds.service"

export function BondsTable() {
  const router = useRouter()
  const { bonds, isLoading, error, deleteBond, calculateBond } = useUserBonds()
  const { setCurrentBond, setMode, setCalculationResult } = useCurrentBond()
  const [searchTerm, setSearchTerm] = useState("")
  const [currencyFilter, setCurrencyFilter] = useState("all")
  const [calculatingBonds, setCalculatingBonds] = useState<Set<string>>(new Set())

  // Filtrar bonos
  const filteredBonds = bonds.filter((bond) => {
    const matchesSearch =
      bond.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bond.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCurrency = currencyFilter === "all" || getCurrencyFromBond(bond) === currencyFilter
    return matchesSearch && matchesCurrency
  })

  const getCurrencyFromBond = (bond: any) => {
    // Inferir moneda basada en el valor nominal (simplificado)
    if (bond.input.valorNominal >= 1000000) return "PEN"
    return "USD"
  }

  const handleNewBond = () => {
    setCurrentBond(null)
    setMode("new")
    setCalculationResult(null)
    router.push("/nuevo")
  }

  const handleViewBond = (bond: any) => {
    setCurrentBond(bond)
    setMode("view")
    if (bond.lastCalculation) {
      setCalculationResult({
        input: bond.lastCalculation.input || bond.input,
        constants: bond.lastCalculation.constants || {},
        schedule: bond.lastCalculation.schedule || [],
        metrics: bond.lastCalculation.metrics || {},
      })
    } else {
      setCalculationResult(null)
    }
    router.push("/resultado")
  }

  const handleEditBond = (bond: any) => {
    setCurrentBond(bond)
    setMode("edit")
    setCalculationResult(null)
    router.push("/nuevo")
  }

  const handleCalculateBond = async (bond: any) => {
    setCalculatingBonds((prev) => new Set(prev).add(bond.id))

    try {
      // 1. Calcular el bono usando el hook (devuelve una promesa)
      const result = await calculateBond(bond.id)
      if (!result) throw new Error("No se pudo calcular el bono")
      // 2. Guardar el cálculo en la API (actualiza lastCalculation)
      await BondsService.calculateAndSaveBond(bond.id, bond.userId, {
        metrics: result.metrics,
        schedule: result.schedule,
      })
      // 3. Actualizar contexto
      setCurrentBond({ ...bond, lastCalculation: { metrics: result.metrics, schedule: result.schedule } })
      setCalculationResult(result)
      setMode("view")
      // 4. Redirigir a resultados
      router.push("/resultado")
    } finally {
      setCalculatingBonds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(bond.id)
        return newSet
      })
    }
  }

  const handleDeleteBond = async (bondId: string) => {
    await deleteBond(bondId)
  }

  // Log de la lista de bonos cada vez que cambia
  useEffect(() => {
    console.log("[useEffect] Lista de bonos actualizada:", bonds)
  }, [bonds])

  if (isLoading) {
    return <LoadingOverlay text="Cargando bonos..." />
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-red-600 text-lg">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="w-full sm:w-auto">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">Mis Bonos</h1>
          <p className="text-sm sm:text-base text-gray-600">Gestiona y calcula tus instrumentos financieros</p>
        </div>
        <Button
          className="bg-monetix-primary hover:bg-monetix-secondary text-white w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm"
          onClick={handleNewBond}
        >
          <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
          Nuevo bono
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-4 sm:w-4" />
          <Input
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full h-12 sm:h-10 text-base sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-0">
          <Filter className="h-4 w-4 text-gray-400 sm:hidden" />
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-full sm:w-48 h-12 sm:h-10 text-base sm:text-sm">
              <SelectValue placeholder="Todas las monedas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las monedas</SelectItem>
              <SelectItem value="PEN">PEN</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {/* Desktop Table */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Nominal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plazo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Actualización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBonds.map((bond) => {
                console.log("[render tabla] Bono:", bond)
                return (
                  <tr key={bond.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bond.name}</div>
                        <div className="text-sm text-gray-500">{bond.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(bond.input.valorNominal, "PEN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bond.input.nAnios} años</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bond.input.tasaInteres}% {bond.input.tipoTasa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bond.lastCalculation ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Calculado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bond.updatedAt).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        {bond.lastCalculation ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-blue-600"
                              onClick={() => handleViewBond(bond)}
                              title="Ver resultados"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-orange-600"
                              onClick={() => handleEditBond(bond)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-red-600"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar bono?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. El bono "{bond.name}" será eliminado permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteBond(bond.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-green-600"
                              onClick={() => handleCalculateBond(bond)}
                              disabled={calculatingBonds.has(bond.id)}
                              title="Calcular"
                            >
                              {calculatingBonds.has(bond.id) ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Calculator className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-orange-600"
                              onClick={() => handleEditBond(bond)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-red-600"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar bono?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. El bono "{bond.name}" será eliminado permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteBond(bond.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Cards */}
        <div className="xl:hidden">
          {filteredBonds.map((bond) => (
            <div key={bond.id} className="border-b border-gray-200 p-4 sm:p-6 last:border-b-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{bond.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{bond.code}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {bond.lastCalculation ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                      Calculado
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Pendiente
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Valor Nominal</span>
                  <div className="font-medium text-gray-900">{formatCurrency(bond.input.valorNominal, "PEN")}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Plazo</span>
                  <div className="font-medium text-gray-900">{bond.input.nAnios} años</div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Tasa</span>
                  <div className="font-medium text-gray-900">
                    {bond.input.tasaInteres}% {bond.input.tipoTasa}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Actualizado</span>
                  <div className="font-medium text-gray-900">
                    {new Date(bond.updatedAt).toLocaleDateString("es-PE")}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2 flex-1">
                  {bond.lastCalculation ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-10 text-sm"
                        onClick={() => handleViewBond(bond)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-10 text-sm"
                        onClick={() => handleEditBond(bond)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1 h-10 text-sm text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4 max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar bono?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. El bono "{bond.name}" será eliminado permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBond(bond.id)}
                              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-10 text-sm"
                        onClick={() => handleCalculateBond(bond)}
                        disabled={calculatingBonds.has(bond.id)}
                      >
                        {calculatingBonds.has(bond.id) ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Calculando...
                          </>
                        ) : (
                          <>
                            <Calculator className="h-4 w-4 mr-2" />
                            Calcular
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-10 text-sm"
                        onClick={() => handleEditBond(bond)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1 h-10 text-sm text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4 max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar bono?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. El bono "{bond.name}" será eliminado permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBond(bond.id)}
                              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBonds.length === 0 && (
          <div className="text-center py-12 px-4">
            {bonds.length === 0 ? (
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-gray-400 mb-4">
                  <CreditCard className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No tienes bonos creados</h3>
                <p className="text-gray-500 mb-6">Comienza creando tu primer bono para gestionar tus inversiones</p>
                <Button
                  onClick={handleNewBond}
                  className="bg-monetix-primary hover:bg-monetix-secondary text-white w-full sm:w-auto h-12 sm:h-10"
                >
                  <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                  Crear tu primer bono
                </Button>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <p className="text-gray-500">No se encontraron bonos que coincidan con los filtros</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

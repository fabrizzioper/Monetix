"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { ArrowLeft, Save, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner, LoadingOverlay } from "@/components/ui/loading-spinner"
import { bondFormSchema } from "@/lib/validation/bond-form.schema"
import { BondsService } from "@/lib/services/bonds.service"
import { useCurrentBond } from "@/lib/hooks/use-current-bond"
import { useUserBonds } from "@/lib/hooks/use-user-bonds"
import { cn } from "@/lib/utils"

const defaultValues = {
  bondName: '',
  valorNominal: '',
  nAnios: '',
  frecuenciaCupon: '',
  diasPorAnio: 360,
  tipoTasa: '',
  tasaInteres: '',
  tipoGracia: '',
  nPeriodosGracia: '',
  plazoGraciaAnio: '',
  pctEstruct: 1.000,
  pctColoc: 0.150,
  pctCavali: 0.0525,
  kd: '',
  capitalizacion: '',
  tasaOportunidad: '',
} as Record<string, any>;

const LOCAL_STORAGE_KEY = 'monetix-bond-form';

export function BondForm() {
  const router = useRouter()
  const { currentBond, mode, setCalculationResult } = useCurrentBond()
  const { createBond, updateBond } = useUserBonds()
  const [bondName, setBondName] = useState("")
  const [localInitialValues, setLocalInitialValues] = useState(defaultValues)
  const isFirstLoad = useRef(true)

  // Cargar datos de localStorage si no hay currentBond
  useEffect(() => {
    if (!currentBond && isFirstLoad.current) {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const values = parsed.values || defaultValues
          const stringValues = Object.assign({}, defaultValues, Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v === undefined || v === null ? (defaultValues as any)[k] : String(v)])))
          setLocalInitialValues(stringValues)
          setBondName(parsed.bondName || "")
        } catch {}
      }
      isFirstLoad.current = false
    } else if (currentBond) {
      const values = currentBond.input || defaultValues
      const stringValues = Object.assign({}, defaultValues, Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v === undefined || v === null ? (defaultValues as any)[k] : String(v)])))
      setLocalInitialValues(stringValues)
      setBondName(currentBond.name || "")
    }
  }, [currentBond])

  // Guardar en localStorage cada vez que cambian los valores o el nombre
  const handleFormChange = (values: any, bondNameValue?: string) => {
    if (typeof window !== 'undefined') {
      const nameToSave = bondNameValue || values.bondName || bondName;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ values, bondName: nameToSave }))
    }
  }

  // Limpiar localStorage al calcular, guardar o cancelar
  const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  }

  const initialValues = currentBond?.input
    ? Object.assign({}, defaultValues, Object.fromEntries(Object.entries(currentBond.input).map(([k, v]) => [k, v === undefined || v === null ? (defaultValues as any)[k] : String(v)])))
    : localInitialValues

  useEffect(() => {
    if (currentBond && mode === "edit") {
      setBondName(currentBond.name)
    } else if (!currentBond && localInitialValues) {
      setBondName((prev) => prev || "")
    }
  }, [currentBond, mode, localInitialValues])



  const handleSubmit = async (values: any, actions: any) => {
    try {
      clearLocalStorage()
      const bondInput: any = {};
      if (values.valorNominal !== '') bondInput.valorNominal = Number(values.valorNominal);
      if (values.nAnios !== '') bondInput.nAnios = Number(values.nAnios);
      if (values.frecuenciaCupon !== '') bondInput.frecuenciaCupon = Number(values.frecuenciaCupon);
      if (values.diasPorAnio !== '') bondInput.diasPorAnio = Number(values.diasPorAnio);
      if (values.tasaInteres !== '') bondInput.tasaInteres = Number(values.tasaInteres);
      if (values.nPeriodosGracia !== '') {
        bondInput.nPeriodosGracia = Number(values.nPeriodosGracia);
        // Calcular plazoGraciaAnio automáticamente
        if (values.frecuenciaCupon) {
          bondInput.plazoGraciaAnio = Number(values.nPeriodosGracia) / Number(values.frecuenciaCupon);
        }
      }
      if (values.kd !== '') bondInput.kd = Number(values.kd);
      if (values.tasaOportunidad !== '') bondInput.tasaOportunidad = Number(values.tasaOportunidad);
      bondInput.tipoTasa = values.tipoTasa;
      bondInput.tipoGracia = values.tipoGracia;
      bondInput.capitalizacion = values.capitalizacion || "";
      // Costos fijos
      bondInput.pctEstruct = 1.000;
      bondInput.pctColoc = 0.150;
      bondInput.pctCavali = 0.0525;
      // Calcular y guardar TEA calculada si aplica
      if (values.tipoTasa === 'Nominal' && values.tasaInteres && values.capitalizacion) {
        const tna = Number(values.tasaInteres) / 100;
        let m = 1;
        switch (values.capitalizacion) {
          case 'Diaria': m = 360; break;
          case 'Quincenal': m = 24; break;
          case 'Mensual': m = 12; break;
          case 'Bimestral': m = 6; break;
          case 'Trimestral': m = 4; break;
          case 'Cuatrimestral': m = 3; break;
          case 'Semestral': m = 2; break;
          case 'Anual': m = 1; break;
          default: m = 1;
        }
        const tea = (Math.pow(1 + tna / m, m) - 1) * 100;
        bondInput.teaCalculada = tea;
      } else if (values.tipoTasa === 'Efectiva' && values.tasaInteres) {
        bondInput.teaCalculada = Number(values.tasaInteres);
      } else {
        bondInput.teaCalculada = null;
      }
   
      let result
      if (mode === "edit" && currentBond) {
        result = await updateBond(currentBond.id, {
          name: bondName || currentBond.name,
          input: bondInput,
        })
      } else {
        const name = bondName || `Bono ${new Date().toLocaleDateString("es-PE")}`
        result = await createBond(name, bondInput)
      }
      if (result) {
        // Calcular el resultado completo
        const calculationResult = await BondsService.calculateBondPreview(bondInput)
        // Guardar el resultado en el backend
        await BondsService.calculateAndSaveBond(result.id, result.userId, calculationResult)
        setCalculationResult(calculationResult)
        router.push("/resultado")
      }
    } catch (error) {
      console.error("Error al procesar el bono:", error)
      actions.setStatus("Error al procesar el bono")
    }
  }

  const handleSaveOnly = async (values: any) => {
    try {
      clearLocalStorage()
      const bondInputSave: any = {};
      if (values.valorNominal !== '') bondInputSave.valorNominal = Number(values.valorNominal);
      if (values.nAnios !== '') bondInputSave.nAnios = Number(values.nAnios);
      if (values.frecuenciaCupon !== '') bondInputSave.frecuenciaCupon = Number(values.frecuenciaCupon);
      if (values.diasPorAnio !== '') bondInputSave.diasPorAnio = Number(values.diasPorAnio);
      if (values.tasaInteres !== '') bondInputSave.tasaInteres = Number(values.tasaInteres);
      if (values.nPeriodosGracia !== '') {
        bondInputSave.nPeriodosGracia = Number(values.nPeriodosGracia);
        // Calcular plazoGraciaAnio automáticamente
        if (values.frecuenciaCupon) {
          bondInputSave.plazoGraciaAnio = Number(values.nPeriodosGracia) / Number(values.frecuenciaCupon);
        }
      }
      if (values.pctEstruct !== '') bondInputSave.pctEstruct = Number(values.pctEstruct);
      if (values.pctColoc !== '') bondInputSave.pctColoc = Number(values.pctColoc);
      if (values.pctCavali !== '') bondInputSave.pctCavali = Number(values.pctCavali);
      if (values.kd !== '') bondInputSave.kd = Number(values.kd);
      if (values.tasaOportunidad !== '') bondInputSave.tasaOportunidad = Number(values.tasaOportunidad);
      bondInputSave.tipoTasa = values.tipoTasa;
      bondInputSave.tipoGracia = values.tipoGracia;
      bondInputSave.capitalizacion = values.capitalizacion || "";
      // Calcular y guardar TEA calculada si aplica
      if (values.tipoTasa === 'Nominal' && values.tasaInteres && values.capitalizacion) {
        const tna = Number(values.tasaInteres) / 100;
        let m = 1;
        switch (values.capitalizacion) {
          case 'Diaria': m = 360; break;
          case 'Quincenal': m = 24; break;
          case 'Mensual': m = 12; break;
          case 'Bimestral': m = 6; break;
          case 'Trimestral': m = 4; break;
          case 'Cuatrimestral': m = 3; break;
          case 'Semestral': m = 2; break;
          case 'Anual': m = 1; break;
          default: m = 1;
        }
        const tea = (Math.pow(1 + tna / m, m) - 1) * 100;
        bondInputSave.teaCalculada = tea;
      } else if (values.tipoTasa === 'Efectiva' && values.tasaInteres) {
        bondInputSave.teaCalculada = Number(values.tasaInteres);
      } else {
        bondInputSave.teaCalculada = null;
      }

      // Costos fijos
      bondInputSave.pctEstruct = 1.000;
      bondInputSave.pctColoc = 0.150;
      bondInputSave.pctCavali = 0.0525;

      if (mode === "edit" && currentBond) {
        await updateBond(currentBond.id, {
          name: bondName || currentBond.name,
          input: bondInputSave,
        })
      } else {
        const name = bondName || `Bono ${new Date().toLocaleDateString("es-PE")}`
        await createBond(name, bondInputSave)
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error al guardar el bono:", error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => { clearLocalStorage(); router.back(); }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {mode === "edit" ? "Editar Bono" : "Nuevo Bono"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {mode === "edit" ? "Modifica los datos del bono" : "Complete los datos para crear el bono"}
            </p>
          </div>
        </div>
      </div>

      <Formik initialValues={initialValues} validationSchema={bondFormSchema} onSubmit={handleSubmit} enableReinitialize>
        {({ isSubmitting, values, errors, touched }) => {
          useEffect(() => {
            handleFormChange(values)
          }, [values])
          return (
            <Form className="space-y-6 relative">
              {isSubmitting && <LoadingOverlay text="Calculando..." />}
              
              {/* Información General */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Información General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full">
                    <Label htmlFor="bondName" className="text-sm font-medium text-gray-700">
                      Nombre del Bono
                    </Label>
                    <Field name="bondName">
                      {({ field, meta }: any) => (
                        <Input
                          {...field}
                          id="bondName"
                          placeholder="Ej: Bono Corporativo ABC"
                          className={cn("mt-2 w-full", meta.touched && meta.error && "border-red-500")}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            field.onChange(e);
                            setBondName(e.target.value);
                          }}
                        />
                      )}
                    </Field>
                    <ErrorMessage name="bondName" component="p" className="text-xs text-red-600 mt-1" />
                  </div>
                </CardContent>
              </Card>

              {/* Sección Emisor */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Sección Emisor</CardTitle>
                  <CardDescription>Datos principales del instrumento financiero</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Todos los campos del formulario con responsive grid */}
                  <div className="space-y-2">
                    <Label htmlFor="valorNominal" className="text-sm font-medium text-gray-700">
                      Valor Nominal
                    </Label>
                    <Field name="valorNominal">
                      {({ field, form, meta }: any) => (
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => form.setFieldValue("valorNominal", Number(value))}
                        >
                          <SelectTrigger className={cn("w-full", meta.touched && meta.error && "border-red-500")}>
                            <SelectValue placeholder="Seleccionar valor nominal" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => (i + 1) * 1000).map((value) => (
                              <SelectItem key={value} value={value.toString()}>
                                {value.toLocaleString('es-PE')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage name="valorNominal" component="p" className="text-xs text-red-600" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nAnios" className="text-sm font-medium text-gray-700">
                      Nº de Años
                    </Label>
                    <Field name="nAnios">
                      {({ field, form, meta }: any) => (
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => form.setFieldValue("nAnios", Number(value))}
                        >
                          <SelectTrigger className={cn("w-full", meta.touched && meta.error && "border-red-500")}>
                            <SelectValue placeholder="Seleccionar número de años" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 13 }, (_, i) => i + 3).map((value) => (
                              <SelectItem key={value} value={value.toString()}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage name="nAnios" component="p" className="text-xs text-red-600" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frecuenciaCupon" className="text-sm font-medium text-gray-700">
                      Frecuencia del cupón
                    </Label>
                    <Field name="frecuenciaCupon">
                      {({ field, form, meta }: any) => (
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => {
                            form.setFieldValue("frecuenciaCupon", Number(value));
                            // Recalcular plazo de gracia en años si hay períodos de gracia seleccionados
                            if (values.nPeriodosGracia && value) {
                              const plazoGraciaAnio = Number(values.nPeriodosGracia) / Number(value);
                              form.setFieldValue("plazoGraciaAnio", plazoGraciaAnio.toString());
                            }
                          }}
                        >
                          <SelectTrigger className={cn("w-full", meta.touched && meta.error && "border-red-500")}>
                            <SelectValue placeholder="Seleccionar frecuencia" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Anual (1)</SelectItem>
                            <SelectItem value="2">Semestral (2)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage name="frecuenciaCupon" component="p" className="text-xs text-red-600" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diasPorPeriodo" className="text-sm font-medium text-gray-700">
                      Días por Período
                    </Label>
                    <Input
                      id="diasPorPeriodo"
                      type="number"
                      value={(() => {
                        switch (Number(values.frecuenciaCupon)) {
                          case 12: return 30;
                          case 6: return 60;
                          case 4: return 90;
                          case 3: return 120;
                          case 2: return 180;
                          case 1: return 360;
                          default: return '';
                        }
                      })()}
                      readOnly
                      disabled
                      className="w-full bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diasPorAnio" className="text-sm font-medium text-gray-700">
                      Días × Año
                    </Label>
                    <Input
                      id="diasPorAnio"
                      type="number"
                      value="360"
                      readOnly
                      disabled
                      className="w-full bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoTasa" className="text-sm font-medium text-gray-700">
                      Tipo de Tasa de Interés
                    </Label>
                    <Field name="tipoTasa">
                      {({ field, form, meta }: any) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => form.setFieldValue("tipoTasa", value)}
                        >
                          <SelectTrigger className={cn("w-full", meta.touched && meta.error && "border-red-500")}>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Efectiva">Efectiva</SelectItem>
                            <SelectItem value="Nominal">Nominal</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage name="tipoTasa" component="p" className="text-xs text-red-600" />
                  </div>

                  {/* Campo Capitalización solo si tipoTasa === 'Nominal' */}
                  {values.tipoTasa === 'Nominal' && (
                    <div className="space-y-2">
                      <Label htmlFor="capitalizacion" className="text-sm font-medium text-gray-700">
                        Capitalización
                      </Label>
                      <Field name="capitalizacion">
                        {({ field, form, meta }: any) => (
                          <Select
                            value={field.value || ""}
                            onValueChange={(value) => form.setFieldValue("capitalizacion", value)}
                          >
                            <SelectTrigger className={cn("w-full", meta.touched && meta.error && "border-red-500")}> 
                              <SelectValue placeholder="Seleccionar capitalización" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Diaria">Diaria</SelectItem>
                              <SelectItem value="Quincenal">Quincenal</SelectItem>
                              <SelectItem value="Mensual">Mensual</SelectItem>
                              <SelectItem value="Bimestral">Bimestral</SelectItem>
                              <SelectItem value="Trimestral">Trimestral</SelectItem>
                              <SelectItem value="Cuatrimestral">Cuatrimestral</SelectItem>
                              <SelectItem value="Semestral">Semestral</SelectItem>
                              <SelectItem value="Anual">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </Field>
                      <ErrorMessage name="capitalizacion" component="p" className="text-xs text-red-600" />
                      {/* Cálculo y visualización de TEA como input bloqueado */}
                      {values.tasaInteres && values.capitalizacion && (
                        <div className="mt-1">
                          <Label htmlFor="teaCalculada" className="text-xs font-medium text-gray-700">TEA calculada</Label>
                          <Input
                            id="teaCalculada"
                            value={(() => {
                              const tna = Number(values.tasaInteres) / 100;
                              let m = 1;
                              switch (values.capitalizacion) {
                                case 'Diaria': m = 360; break;
                                case 'Quincenal': m = 24; break;
                                case 'Mensual': m = 12; break;
                                case 'Bimestral': m = 6; break;
                                case 'Trimestral': m = 4; break;
                                case 'Cuatrimestral': m = 3; break;
                                case 'Semestral': m = 2; break;
                                case 'Anual': m = 1; break;
                                default: m = 1;
                              }
                              const tea = (Math.pow(1 + tna / m, m) - 1) * 100;
                              return tea.toLocaleString('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 5 }) + '%';
                            })()}
                            readOnly
                            disabled
                            className="w-full bg-gray-100 cursor-not-allowed mt-1"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="tasaInteres" className="text-sm font-medium text-gray-700">
                      Tasa de interés (%)
                    </Label>
                    <Field name="tasaInteres">
                      {({ field, meta }: any) => (
                        <Input
                          {...field}
                          id="tasaInteres"
                          type="number"
                          step="0.001"
                          placeholder="7.375"
                          className={cn("w-full", meta.touched && meta.error && "border-red-500")}
                          value={field.value ?? ''}
                        />
                      )}
                    </Field>
                    <ErrorMessage name="tasaInteres" component="p" className="text-xs text-red-600" />
                  </div>

                  
                  <div className="space-y-2">
                    <Label htmlFor="tasaOportunidad" className="text-sm font-medium text-gray-700">
                      Tasa anual de oportunidad (%)
                    </Label>
                    <Field name="tasaOportunidad">
                      {({ field, meta }: any) => (
                        <Input
                          {...field}
                          id="tasaOportunidad"
                          type="number"
                          step="0.001"
                          placeholder="Ej: 8.5"
                          className={cn("w-full", meta.touched && meta.error && "border-red-500")}
                          value={field.value ?? ''}
                        />
                      )}
                    </Field>
                    <ErrorMessage name="tasaOportunidad" component="p" className="text-xs text-red-600" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoGracia" className="text-sm font-medium text-gray-700">
                      Tipo de Gracia
                    </Label>
                    <Field name="tipoGracia">
                      {({ field, form, meta }: any) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => {
                            form.setFieldValue("tipoGracia", value);
                            // Si se selecciona "Ninguna", establecer ambos campos en 0
                            if (value === "Ninguna") {
                              form.setFieldValue("nPeriodosGracia", "");
                              form.setFieldValue("plazoGraciaAnio", "");
                              // Limpiar también los errores de validación
                              form.setFieldError("nPeriodosGracia", undefined);
                              form.setFieldError("plazoGraciaAnio", undefined);
                            }
                          }}
                        >
                          <SelectTrigger className={cn("w-full", meta.touched && meta.error && "border-red-500")}>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ninguna">Ninguna</SelectItem>
                            <SelectItem value="Parcial">Parcial</SelectItem>
                            <SelectItem value="Total">Total</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage name="tipoGracia" component="p" className="text-xs text-red-600" />
                  </div>

                  {/* Campo Nº de Periodos de Gracia - Habilitado */}
                  <div className="space-y-2">
                    <Label htmlFor="nPeriodosGracia" className="text-sm font-medium text-gray-700">
                      Nº de Periodos de Gracia
                    </Label>
                    <Field name="nPeriodosGracia">
                      {({ field, form, meta }: any) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => {
                            form.setFieldValue("nPeriodosGracia", value);
                            // Calcular automáticamente el plazo de gracia en años
                            if (value && values.frecuenciaCupon) {
                              const plazoGraciaAnio = Number(value) / Number(values.frecuenciaCupon);
                              form.setFieldValue("plazoGraciaAnio", plazoGraciaAnio.toString());
                            } else {
                              form.setFieldValue("plazoGraciaAnio", "");
                            }
                          }}
                          disabled={values.tipoGracia === "Ninguna"}
                        >
                          <SelectTrigger className={cn(
                            "w-full", 
                            meta.touched && meta.error && "border-red-500",
                            values.tipoGracia === "Ninguna" && "bg-gray-100 cursor-not-allowed"
                          )}>
                            <SelectValue placeholder="Seleccionar períodos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage name="nPeriodosGracia" component="p" className="text-xs text-red-600" />
                  </div>

                  {/* Campo Plazo de Gracia (año) - Calculado automáticamente y deshabilitado */}
                  <div className="space-y-2">
                    <Label htmlFor="plazoGraciaAnio" className="text-sm font-medium text-gray-700">
                      Plazo de Gracia (año)
                    </Label>
                    <Input
                      id="plazoGraciaAnio"
                      type="number"
                      value={values.tipoGracia === "Ninguna" ? 0 : (values.nPeriodosGracia && values.frecuenciaCupon ? (Number(values.nPeriodosGracia) / Number(values.frecuenciaCupon)).toFixed(2) : 0)}
                      readOnly
                      disabled
                      className="w-full bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                </CardContent>
              </Card>

              {/* Costes Iniciales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Costes Iniciales (%)</CardTitle>
                  <CardDescription>Porcentajes sobre el valor nominal</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pctEstruct" className="text-sm font-medium text-gray-700">
                      % Estructuración
                    </Label>
                    <Input
                      id="pctEstruct"
                      type="text"
                      value="1.000%"
                      readOnly
                      disabled
                      className="w-full bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pctColoc" className="text-sm font-medium text-gray-700">
                      % Colocación
                    </Label>
                    <Input
                      id="pctColoc"
                      type="text"
                      value="0.150%"
                      readOnly
                      disabled
                      className="w-full bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pctCavali" className="text-sm font-medium text-gray-700">
                      % CAVALI
                    </Label>
                    <Input
                      id="pctCavali"
                      type="text"
                      value="0.0525%"
                      readOnly
                      disabled
                      className="w-full bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { clearLocalStorage(); router.back(); }}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSaveOnly(values)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Solo Guardar
                </Button>

                <Button
                  type="submit"
                  className="bg-monetix-primary hover:bg-monetix-secondary text-white w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Calculando...
                    </div>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Calcular
                    </>
                  )}
                </Button>
              </div>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}




/*
=SI(Capitalización		2="Diaria",1,SI(Capitalización		2="Quincenal",15,SI(Capitalización		2="Mensual",30,SI(Capitalización		2="Bimestral",60,SI(Capitalización		2="Trimestral",90,SI(Capitalización		2="Cuatrimestral",120,SI(Capitalización		2="Semestral",180,360)))))))*/
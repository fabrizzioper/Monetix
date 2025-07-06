import * as Yup from "yup"

export const bondFormSchema = Yup.object({
  bondName: Yup.string()
    .required("El nombre del bono es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),

  valorNominal: Yup.number()
    .required("El valor nominal es requerido")
    .positive("Debe ser mayor a 0")
    .min(1000, "Mínimo S/ 1,000"),

  nAnios: Yup.number()
    .required("El número de años es requerido")
    .integer("Debe ser un número entero")
    .min(1, "Mínimo 1 año")
    .max(50, "Máximo 50 años"),

  frecuenciaCupon: Yup.number()
    .required("La frecuencia de cupón es requerida")
    .oneOf([1, 2, 3, 4, 6, 12], "Frecuencia inválida"),

  diasPorAnio: Yup.number().required("Los días por año son requeridos").oneOf([360, 365], "Debe ser 360 o 365"),

  tipoTasa: Yup.string()
    .required("El tipo de tasa es requerido")
    .oneOf(["Efectiva", "Nominal"], "Tipo de tasa inválido"),

  capitalizacion: Yup.string()
    .when('tipoTasa', {
      is: 'Nominal',
      then: (schema) => schema.required("La capitalización es requerida cuando la tasa es nominal"),
      otherwise: (schema) => schema.optional().nullable(),
    }),

  tasaInteres: Yup.number()
    .required("La tasa de interés es requerida")
    .min(5, "Mínimo 5%")
    .max(9, "Máximo 9%"),

  tipoGracia: Yup.string()
    .required("El tipo de gracia es requerido")
    .oneOf(["Total", "Parcial", "Ninguna"], "Tipo de gracia inválido"),

  nPeriodosGracia: Yup.number()
    .when('tipoGracia', {
      is: (tipoGracia: string) => tipoGracia !== 'Ninguna',
      then: (schema) => schema.required("El número de períodos de gracia es requerido").oneOf([1, 2, 3], "Debe ser 1, 2 o 3 períodos"),
      otherwise: (schema) => schema.optional().nullable(),
    }),

  plazoGraciaAnio: Yup.number()
    .when('tipoGracia', {
      is: (tipoGracia: string) => tipoGracia !== 'Ninguna',
      then: (schema) => schema.required("El plazo de gracia es requerido"),
      otherwise: (schema) => schema.optional().nullable(),
    }),

  pctEstruct: Yup.number()
    .required("El costo de estructuración es requerido")
    .min(0, "No puede ser negativo")
    .max(10, "Máximo 10%"),

  pctColoc: Yup.number()
    .required("El costo de colocación es requerido")
    .min(0, "No puede ser negativo")
    .max(10, "Máximo 10%"),

  pctCavali: Yup.number().required("El costo CAVALI es requerido").min(0, "No puede ser negativo").max(5, "Máximo 5%"),

  kd: Yup.number()
    .min(0, "No puede ser negativo")
    .max(100, "Máximo 100%")
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === null || originalValue === undefined) {
        return null
      }
      return value
    }),

  tasaOportunidad: Yup.number()
    .required("La tasa anual de oportunidad es requerida")
    .min(5, "Mínimo 5%")
    .max(12, "Máximo 12%"),
})

export type BondFormValues = Yup.InferType<typeof bondFormSchema>

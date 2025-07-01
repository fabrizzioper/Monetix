import * as Yup from "yup"

export const bondFormSchema = Yup.object({
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

  tasaInteres: Yup.number()
    .required("La tasa de interés es requerida")
    .min(0, "No puede ser negativa")
    .max(100, "Máximo 100%"),

  tipoGracia: Yup.string()
    .required("El tipo de gracia es requerido")
    .oneOf(["Total", "Parcial", "Ninguna"], "Tipo de gracia inválido"),

  plazoGraciaAnio: Yup.number().required("El plazo de gracia es requerido").min(0, "No puede ser negativo"),

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
})

export type BondFormValues = Yup.InferType<typeof bondFormSchema>

import { CalculationLogger } from "./calculation-logger.service"
import type { BondCalculationResult } from "@/lib/types/bond-calculations"

export class ExportService {
  static exportToExcel(result: BondCalculationResult, bondName: string): void {
    let csvContent = "data:text/csv;charset=utf-8,"

    csvContent += "DATOS DE ENTRADA\n"
    Object.entries(result.input).forEach(([key, value]) => {
      csvContent += `${key},${value}\n`
    })

    csvContent += "\nCONSTANTES\n"
    Object.entries(result.constants).forEach(([key, value]) => {
      csvContent += `${key},${value}\n`
    })

    csvContent += "\nCRONOGRAMA\n"
    csvContent += "Periodo,Plazo Gracia,Bono,Cupon Interes,Flujo Emisor,Flujo Bonista,Flujo Actualizado\n"
    result.schedule.forEach((row) => {
      csvContent += `${row.n},${row.plazoGracia},${row.bono},${row.cuponInteres},${row.flujoEmisor},${row.flujoBonista},${row.flujoAct}\n`
    })

    csvContent += "\nMETRICAS\n"
    Object.entries(result.metrics).forEach(([key, value]) => {
      csvContent += `${key},${value}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${bondName}_calculo.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  static exportDocumentation(bondName: string): void {
    const documentation = CalculationLogger.generateDocumentation()

    const blob = new Blob([documentation], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${bondName}_documentacion_calculos.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

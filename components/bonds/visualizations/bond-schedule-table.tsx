"use client"

import { useCurrentBond } from "@/lib/hooks/use-current-bond"
import { formatCurrency } from "@/lib/utils/format"

export function BondScheduleTable() {
  const { calculationResult } = useCurrentBond()

  if (!calculationResult) return null

  const { schedule } = calculationResult

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2 font-medium">Nº</th>
              <th className="text-left p-2 font-medium">Plazo de Gracia</th>
              <th className="text-right p-2 font-medium">Bono (Saldo Inicial)</th>
              <th className="text-right p-2 font-medium">Saldo Final</th>
              <th className="text-right p-2 font-medium">Cupón (Interés)</th>
              <th className="text-right p-2 font-medium">Cuota</th>
              <th className="text-right p-2 font-medium">Amort.</th>
              <th className="text-right p-2 font-medium">Flujo Emisor</th>
              <th className="text-right p-2 font-medium">Flujo Bonista</th>
              <th className="text-right p-2 font-medium">Flujo Act.</th>
              <th className="text-right p-2 font-medium">FA x Plazo</th>
              <th className="text-right p-2 font-medium">Factor p/Convexidad</th>
            </tr>
          </thead>
          <tbody>
            {schedule?.map((row, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-2">{row.n}</td>
                {index === 0 ? (
                  <>
                    <td className="p-2 text-center"></td>
                    <td className="p-2 text-right"></td>
                    <td className="p-2 text-right"></td>
                    <td className="p-2 text-right"></td>
                    <td className="p-2 text-right"></td>
                    <td className="p-2 text-right"></td>
                    <td className="p-2 text-right">{formatCurrency(row.flujoEmisor, "PEN")}</td>
                    <td className="p-2 text-right">{formatCurrency(row.flujoBonista, "PEN")}</td>
                    <td className="p-2 text-right"></td>
                    <td className="p-2 text-right"></td>
                    <td className="p-2 text-right"></td>
                  </>
                ) : (
                  <>
                    <td className="p-2 text-center">{row.plazoGracia}</td>
                    <td className="p-2 text-right">{formatCurrency(row.bono, "PEN")}</td>
                    <td className="p-2 text-right">{formatCurrency(row.saldoFinal, "PEN")}</td>
                    <td className="p-2 text-right">{formatCurrency(row.cuponInteres, "PEN")}</td>
                    <td className="p-2 text-right">{formatCurrency(row.cuota, "PEN")}</td>
                    <td className="p-2 text-right">{formatCurrency(row.amort, "PEN")}</td>
                    <td className="p-2 text-right">{formatCurrency(row.flujoEmisor, "PEN")}</td>
                    <td className="p-2 text-right">{formatCurrency(row.flujoBonista, "PEN")}</td>
                    <td className="p-2 text-right">{formatCurrency(row.flujoAct, "PEN")}</td>
                    <td className="p-2 text-right">{formatCurrency(row.faXPlazo, "PEN")}</td>
                    <td className="p-2 text-right">{formatCurrency(row.factorConv, "PEN")}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

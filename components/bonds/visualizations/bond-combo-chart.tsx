"use client"

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useCurrentBond } from "@/lib/hooks/use-current-bond"
import { formatCurrency } from "@/lib/utils/format"

export function BondComboChart() {
  const { calculationResult } = useCurrentBond()

  if (!calculationResult) return null

  const { schedule } = calculationResult

  // Preparar datos para el gráfico combinado
  const chartData = schedule.slice(1).map((row, index) => {
    const prevRow = schedule[index]
    const changePercent =
      prevRow && prevRow.flujoAct !== 0 ? ((row.flujoAct - prevRow.flujoAct) / Math.abs(prevRow.flujoAct)) * 100 : 0

    return {
      periodo: row.n,
      flujoEmisor: Math.abs(row.flujoEmisor),
      flujoBonista: Math.abs(row.flujoBonista),
      cuponInteres: Math.abs(row.cuponInteres),
      cambioFlujo: changePercent,
      flujoActualizado: Math.abs(row.flujoAct),
    }
  })

  const formatTooltip = (value: number, name: string) => {
    const labels: Record<string, string> = {
      flujoEmisor: "Flujo Emisor",
      flujoBonista: "Flujo Bonista",
      cuponInteres: "Cupón Interés",
      cambioFlujo: "Cambio Flujo (%)",
      flujoActualizado: "Flujo Actualizado",
    }

    if (name === "cambioFlujo") {
      return [`${value.toFixed(2)}%`, labels[name]]
    }

    return [formatCurrency(value, "PEN"), labels[name] || name]
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="periodo" stroke="#666" fontSize={12} tickLine={false} />
          <YAxis
            yAxisId="left"
            stroke="#666"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#ef4444"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `${value.toFixed(0)}%`}
          />
          <Tooltip
            formatter={formatTooltip}
            labelFormatter={(label) => `Período ${label}`}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />

          {/* Barras */}
          <Bar yAxisId="left" dataKey="flujoEmisor" fill="#3b82f6" name="Flujo Emisor" opacity={0.8} />
          <Bar yAxisId="left" dataKey="flujoBonista" fill="#22c55e" name="Flujo Bonista" opacity={0.8} />
          <Bar yAxisId="left" dataKey="cuponInteres" fill="#f59e0b" name="Cupón Interés" opacity={0.6} />

          {/* Línea de cambio */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cambioFlujo"
            stroke="#ef4444"
            strokeWidth={3}
            name="Cambio Flujo (%)"
            dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

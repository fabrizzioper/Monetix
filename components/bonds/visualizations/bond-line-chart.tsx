"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useCurrentBond } from "@/lib/hooks/use-current-bond"
import { formatCurrency } from "@/lib/utils/format"

export function BondLineChart() {
  const { calculationResult } = useCurrentBond()

  if (!calculationResult) return null

  const { schedule } = calculationResult

  // Preparar datos para el gráfico
  const chartData = schedule.map((row) => ({
    periodo: row.n,
    flujoEmisor: row.flujoEmisor,
    flujoBonista: row.flujoBonista,
    flujoActualizado: row.flujoAct,
    cuponInteres: Math.abs(row.cuponInteres),
  }))

  const formatTooltip = (value: number, name: string) => {
    const labels: Record<string, string> = {
      flujoEmisor: "Flujo Emisor",
      flujoBonista: "Flujo Bonista",
      flujoActualizado: "Flujo Actualizado",
      cuponInteres: "Cupón Interés",
    }
    return [formatCurrency(value, "PEN"), labels[name] || name]
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            stroke="#666"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
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
          <Line
            type="monotone"
            dataKey="flujoEmisor"
            stroke="#ef4444"
            strokeWidth={2}
            name="Flujo Emisor"
            dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="flujoBonista"
            stroke="#22c55e"
            strokeWidth={2}
            name="Flujo Bonista"
            dot={{ fill: "#22c55e", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="flujoActualizado"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Flujo Actualizado"
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="cuponInteres"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Cupón Interés"
            dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

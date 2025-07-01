"use client"

import { useCurrentBond } from "@/lib/hooks/use-current-bond"
import { formatCurrency } from "@/lib/utils/format"

interface CandlestickData {
  periodo: number
  open: number
  high: number
  low: number
  close: number
  isPositive: boolean
}

export function BondCandlestickChart() {
  const { calculationResult } = useCurrentBond()

  if (!calculationResult) return null

  const { schedule } = calculationResult

  // Preparar datos para el gráfico de velas
  const candlestickData: CandlestickData[] = schedule.slice(1).map((row, index) => {
    const prevRow = schedule[index] // período anterior
    const flujoEmisor = Math.abs(row.flujoEmisor)
    const flujoBonista = Math.abs(row.flujoBonista)
    const flujoAct = Math.abs(row.flujoAct)
    const cupon = Math.abs(row.cuponInteres)

    // Simular datos OHLC basados en los flujos
    const values = [flujoEmisor, flujoBonista, flujoAct, cupon].filter((v) => v > 0)
    const open = prevRow ? Math.abs(prevRow.flujoAct) : values[0]
    const close = flujoAct
    const high = Math.max(...values, open, close)
    const low = Math.min(...values, open, close)

    return {
      periodo: row.n,
      open,
      high,
      low,
      close,
      isPositive: close >= open,
    }
  })

  // Calcular dimensiones del gráfico
  const maxValue = Math.max(...candlestickData.map((d) => d.high))
  const minValue = Math.min(...candlestickData.map((d) => d.low))
  const range = maxValue - minValue
  const chartHeight = 400
  const chartWidth = Math.max(800, candlestickData.length * 60)
  const candleWidth = Math.min(40, (chartWidth / candlestickData.length) * 0.8)

  const getY = (value: number) => {
    return chartHeight - ((value - minValue) / range) * (chartHeight - 40) - 20
  }

  const getX = (index: number) => {
    return 50 + (index * (chartWidth - 100)) / (candlestickData.length - 1)
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full" style={{ minWidth: `${chartWidth}px` }}>
        <svg width={chartWidth} height={chartHeight + 60} className="border rounded-lg bg-white">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = 20 + ratio * (chartHeight - 40)
            const value = maxValue - ratio * range
            return (
              <g key={ratio}>
                <line x1={40} y1={y} x2={chartWidth - 40} y2={y} stroke="#f0f0f0" strokeDasharray="2,2" />
                <text x={35} y={y + 4} textAnchor="end" fontSize="10" fill="#666">
                  {(value / 1000000).toFixed(1)}M
                </text>
              </g>
            )
          })}

          {/* Candlesticks */}
          {candlestickData.map((candle, index) => {
            const x = getX(index)
            const openY = getY(candle.open)
            const closeY = getY(candle.close)
            const highY = getY(candle.high)
            const lowY = getY(candle.low)

            const bodyTop = Math.min(openY, closeY)
            const bodyBottom = Math.max(openY, closeY)
            const bodyHeight = Math.abs(closeY - openY)

            const color = candle.isPositive ? "#22c55e" : "#ef4444"
            const fillColor = candle.isPositive ? "#22c55e" : "#ef4444"

            return (
              <g key={index}>
                {/* High-Low line */}
                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth={1} />

                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={Math.max(bodyHeight, 2)}
                  fill={fillColor}
                  stroke={color}
                  strokeWidth={1}
                  opacity={candle.isPositive ? 0.8 : 1}
                />

                {/* Period label */}
                <text x={x} y={chartHeight + 15} textAnchor="middle" fontSize="10" fill="#666">
                  {candle.periodo}
                </text>

                {/* Tooltip area */}
                <rect
                  x={x - candleWidth / 2}
                  y={highY}
                  width={candleWidth}
                  height={lowY - highY}
                  fill="transparent"
                  className="cursor-pointer"
                >
                  <title>
                    {`Período ${candle.periodo}
Apertura: ${formatCurrency(candle.open, "PEN")}
Máximo: ${formatCurrency(candle.high, "PEN")}
Mínimo: ${formatCurrency(candle.low, "PEN")}
Cierre: ${formatCurrency(candle.close, "PEN")}`}
                  </title>
                </rect>
              </g>
            )
          })}

          {/* Axis labels */}
          <text x={chartWidth / 2} y={chartHeight + 45} textAnchor="middle" fontSize="12" fill="#333" fontWeight="bold">
            Períodos
          </text>

          <text
            x={15}
            y={chartHeight / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#333"
            fontWeight="bold"
            transform={`rotate(-90, 15, ${chartHeight / 2})`}
          >
            Flujos (Millones PEN)
          </text>

          {/* Legend */}
          <g transform={`translate(${chartWidth - 200}, 30)`}>
            <rect x={0} y={0} width={15} height={10} fill="#22c55e" opacity={0.8} />
            <text x={20} y={9} fontSize="10" fill="#333">
              Flujo Positivo
            </text>
            <rect x={0} y={15} width={15} height={10} fill="#ef4444" />
            <text x={20} y={24} fontSize="10" fill="#333">
              Flujo Negativo
            </text>
          </g>
        </svg>
      </div>
    </div>
  )
}

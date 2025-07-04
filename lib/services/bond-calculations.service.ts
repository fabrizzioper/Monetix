import type {
  BondInput,
  FlowRow,
  BondConstants,
  BondMetrics,
  BondCalculationResult,
} from "@/lib/types/bond-calculations"
import { CalculationLogger } from "./calculation-logger.service"

/* ---------- helpers ---------- */

const pct = (p: number) => p / 100

function tasaPeriodica({ tipoTasa, tasaInteres, frecuenciaCupon, capitalizacion }: BondInput) {
  const r = pct(tasaInteres)
  let result: number
  let mCap: number | null = null;
  if (tipoTasa === "Nominal") {
    switch (capitalizacion) {
      case 'Diaria': mCap = 360; break;
      case 'Quincenal': mCap = 24; break;
      case 'Mensual': mCap = 12; break;
      case 'Bimestral': mCap = 6; break;
      case 'Trimestral': mCap = 4; break;
      case 'Cuatrimestral': mCap = 3; break;
      case 'Semestral': mCap = 2; break;
      case 'Anual': mCap = 1; break;
      default: mCap = null;
    }
    let tea: number
    if (mCap) {
      tea = Math.pow(1 + r / mCap, mCap) - 1;
    } else {
      tea = Math.pow(1 + r / frecuenciaCupon, frecuenciaCupon) - 1;
    }
    result = Math.pow(1 + tea, 1 / frecuenciaCupon) - 1
  } else {
    // Efectiva
    result = Math.pow(1 + r, 1 / frecuenciaCupon) - 1
  }

  CalculationLogger.addStep({
    step: "Cálculo de Tasa Periódica",
    description: "Convertir la tasa anual a tasa por período según el tipo de tasa y capitalización",
    formula: tipoTasa === "Nominal"
      ? "i = (1 + TNA/mCap)^mCap → TEA; i = (1+TEA)^(1/m) - 1"
      : "i = (1 + TEA)^(1/m) - 1",
    inputs: {
      tipoTasa,
      tasaInteres: `${tasaInteres}%`,
      frecuenciaCupon,
      capitalizacion,
      tasaDecimal: r,
    },
    calculation:
      tipoTasa === "Nominal"
        ? (capitalizacion && mCap)
          ? `TEA = (1 + ${r}/${mCap})^${mCap} - 1 = ${((Math.pow(1 + r / mCap, mCap) - 1) * 100).toFixed(6)}%; i = (1+TEA)^(1/${frecuenciaCupon}) - 1 = ${(result * 100).toFixed(6)}%`
          : `TEA = (1 + ${r}/${frecuenciaCupon})^${frecuenciaCupon} - 1 = ${((Math.pow(1 + r / frecuenciaCupon, frecuenciaCupon) - 1) * 100).toFixed(6)}%; i = (1+TEA)^(1/${frecuenciaCupon}) - 1 = ${(result * 100).toFixed(6)}%`
        : `(1 + ${r})^(1/${frecuenciaCupon}) - 1 = ${(result * 100).toFixed(6)}%`,
    result: `${(result * 100).toFixed(6)}% por período`,
  })

  return result
}

// Nueva función para calcular días según frecuencia
function calcularDiasPorPeriodo(frecuenciaCupon: number): number {
  // Fórmula exacta del Excel
  const dias =
    frecuenciaCupon === 12
      ? 30
      : // Mensual
        frecuenciaCupon === 6
        ? 60
        : // Bimestral
          frecuenciaCupon === 4
          ? 90
          : // Trimestral
            frecuenciaCupon === 3
            ? 120
            : // Cuatrimestral
              frecuenciaCupon === 2
              ? 180
              : // Semestral
                360 // Anual

  CalculationLogger.addStep({
    step: "Cálculo de Días por Período",
    description: "Determinar días por período según la frecuencia del cupón",
    formula:
      "SI(Frecuencia=12;30;SI(Frecuencia=6;60;SI(Frecuencia=4;90;SI(Frecuencia=3;120;SI(Frecuencia=2;180;360)))))",
    inputs: {
      frecuenciaCupon,
    },
    calculation: `Frecuencia ${frecuenciaCupon} → ${dias} días`,
    result: `${dias} días por período`,
  })

  return dias
}

// Nueva función para obtener el nombre de la tasa efectiva por período
function obtenerNombreTasaEfectiva(frecuenciaCupon: number): string {
  const nombres = {
    12: "TEM", // Tasa Efectiva Mensual
    6: "TEB", // Tasa Efectiva Bimestral
    4: "TET", // Tasa Efectiva Trimestral
    3: "TEC", // Tasa Efectiva Cuatrimestral
    2: "TES", // Tasa Efectiva Semestral
    1: "TEA", // Tasa Efectiva Anual
  }
  return nombres[frecuenciaCupon as keyof typeof nombres] || "TEP"
}

/* ---------- función principal ---------- */

export function buildBondTable(input: BondInput): FlowRow[] {
  const m = input.frecuenciaCupon
  const N = input.nAnios * m // Total de períodos
  const Ng = input.plazoGraciaAnio * m // Número de períodos de gracia
  
  // Calcular tasa periódica usando la misma lógica que en calculateConstants
  const tasaDecimal = pct(input.tasaInteres)
  let tea: number
  if (input.tipoTasa === "Nominal") {
    const tna = tasaDecimal
    let mCap = null;
    switch (input.capitalizacion) {
      case 'Diaria': mCap = 360; break;
      case 'Quincenal': mCap = 24; break;
      case 'Mensual': mCap = 12; break;
      case 'Bimestral': mCap = 6; break;
      case 'Trimestral': mCap = 4; break;
      case 'Cuatrimestral': mCap = 3; break;
      case 'Semestral': mCap = 2; break;
      case 'Anual': mCap = 1; break;
      default: mCap = null;
    }
    if (mCap) {
      tea = Math.pow(1 + tna / mCap, mCap) - 1;
    } else {
      tea = Math.pow(1 + tna / m, m) - 1;
    }
  } else {
    tea = tasaDecimal
  }
  const i = Math.pow(1 + tea, 1 / m) - 1 // Tasa periódica (TES)

  // Calcular días por período según frecuencia
  const diasPorPeriodo = calcularDiasPorPeriodo(m)

  CalculationLogger.addStep({
    step: "Cálculo de Constantes Básicas",
    description: "Determinar los parámetros fundamentales del cronograma",
    formula: "N = nAnios × m, Ng = plazoGraciaAnio × m",
    inputs: {
      nAnios: input.nAnios,
      frecuenciaCupon: m,
      plazoGraciaAnio: input.plazoGraciaAnio,
      valorNominal: input.valorNominal,
      tasaPeriodica: i,
      diasPorPeriodo,
      diasPorAnio: input.diasPorAnio,
    },
    calculation: `N = ${input.nAnios} × ${m} = ${N}, Ng = ${input.plazoGraciaAnio} × ${m} = ${Ng}`,
    result: {
      totalPeriodos: N,
      periodosGracia: Ng,
      diasPorPeriodo,
    },
    dependencies: ["Cálculo de Tasa Periódica", "Cálculo de Días por Período"],
  })

  // Costes iniciales - Usar la misma lógica que en calculateConstants
  const pctEstruct = pct(input.pctEstruct)
  const pctColoc = pct(input.pctColoc)
  const pctCavali = pct(input.pctCavali)
  const costesInicialesEmisor = input.valorNominal * (pctEstruct + pctColoc + pctCavali)
  const costesInicialesBonista = input.valorNominal * pctCavali

  CalculationLogger.addStep({
    step: "Cálculo de Costes Iniciales",
    description: "Calcular los costes de estructuración, colocación y CAVALI",
    formula: "Coste = ValorNominal × (% / 100)",
    inputs: {
      valorNominal: input.valorNominal,
      pctEstruct: `${input.pctEstruct}%`,
      pctColoc: `${input.pctColoc}%`,
      pctCavali: `${input.pctCavali}%`,
    },
    calculation: `Estructuración = ${input.valorNominal * pctEstruct}, Colocación = ${input.valorNominal * pctColoc}, CAVALI = ${input.valorNominal * pctCavali}`,
    result: {
      costesInicialesEmisor,
      costesInicialesBonista,
    },
  })

  // Calcular cuota usando la fórmula de anualidad
  const cuotaCalculada = input.valorNominal * ((i * Math.pow(1 + i, N)) / (Math.pow(1 + i, N) - 1))

  CalculationLogger.addStep({
    step: "Cálculo de Cuota",
    description: "Calcular la cuota usando la fórmula de anualidad",
    formula: "Cuota = ValorNominal × ((i × (1+i)^N) / ((1+i)^N - 1))",
    inputs: {
      valorNominal: input.valorNominal,
      tasaPeriodica: i,
      totalPeriodos: N,
    },
    calculation: `${input.valorNominal} × ((${i} × (1+${i})^${N}) / ((1+${i})^${N} - 1)) = ${cuotaCalculada}`,
    result: cuotaCalculada,
  })

  // Tasa de descuento para valor presente
  const kdDec = input.kd !== undefined ? pct(input.kd) : 0

  const rows: FlowRow[] = []

  // Limitar número de filas basado en Total de períodos (N+1 filas: 0,1,2,...,N)
  for (let n = 0; n <= N; n++) {
    
    if (n === 0) {
      // FILA 0: Todas las columnas son 0 excepto Flujo Emisor, Flujo Bonista y Saldo Final
      // Flujo Emisor = Valor nominal - costes iniciales emisor

      
      const flujoEmisor = input.valorNominal - costesInicialesEmisor
      
      // Flujo Bonista = Valor nominal - costes inicial bonista  
      const flujoBonista = -(input.valorNominal + costesInicialesBonista) //el "-" para imprimir negativo
      // Saldo Final = valor nominal
      const saldoFinal = input.valorNominal
      
      // Valor presente y factores para período 0
      const pv = flujoBonista / Math.pow(1 + kdDec, n)
      const faPlazo = pv * n
      const factorConv = pv * n * (n + 1)

      rows.push({
        n,
        plazoGracia: "",
        bono: saldoFinal, // Saldo Final
        saldoFinal: saldoFinal, // Saldo Final (mismo valor)
        cuponInteres: 0,
        cuota: 0,
        amort: 0,
        flujoEmisor: flujoEmisor,
        flujoBonista: flujoBonista,
        flujoAct: pv,
        faXPlazo: faPlazo,
        factorConv: factorConv,
      })

      if (n <= 2) {
        CalculationLogger.addStep({
          step: `Período ${n} (Inicial)`,
          description: `Período inicial con flujos de emisión`,
          formula: "Flujo Emisor = ValorNominal - CostesEmisor, Flujo Bonista = ValorNominal - CostesBonista",
          inputs: {
            valorNominal: input.valorNominal,
            costesEmisor: costesInicialesEmisor,
            costesBonista: costesInicialesBonista,
          },
          calculation: `FlujoE = ${input.valorNominal} - ${costesInicialesEmisor} = ${flujoEmisor}, FlujoB = ${input.valorNominal} - ${costesInicialesBonista} = ${flujoBonista}`,
          result: {
            flujoEmisor,
            flujoBonista,
            saldoFinal,
          },
        })
      }

    } else {
      // FILAS 1 EN ADELANTE: Aplicar lógica según especificaciones

      // 1. Plazo de gracia
      // =SI(numero de fila <= numero de periodos gracia; Tipo Gracia; "S")
      let plazoGracia: "" | "P" | "T" | "S" = ""
      if (n <= Ng) {
        plazoGracia = input.tipoGracia === "Parcial" ? "P" : 
                     input.tipoGracia === "Total" ? "T" : "S"
      } else {
        plazoGracia = "S"
      }

      // 2. Saldo inicial
      // =SI(D40=1;G39;SI(D40<=$L$19;SI(E40="T";G39-H39;G39);0))
      let saldoInicial: number
      if (n === 1) {
        // Para período 1: G39 (saldo final de la fila anterior)
        saldoInicial = rows[n-1].saldoFinal
      } else if (n <= N) {
        // Para períodos 2 en adelante dentro del total
        const filaAnterior = rows[n-1]
        if (plazoGracia === "T") {
          // Gracia Total: G39-H39 (saldo final anterior - interés anterior)
          saldoInicial = filaAnterior.saldoFinal - filaAnterior.cuponInteres
        } else {
          // Otros casos: G39 (saldo final anterior)
          saldoInicial = filaAnterior.saldoFinal
        }
      } else {
        // Fuera del número de períodos
        saldoInicial = 0
      }

      // 3. Interés
      // =-saldo inicial * tasa
      const interes = -saldoInicial * i

      // 4. Cuota (LÓGICA DE EXCEL)
      // =SI(D41<=F41;SI(E41="T";0;SI(E41="P";H41;PAGO(L$21;L$19-D41+1;F41;0;0)));0)
      // Donde: D41=periodo actual, F41=total períodos, E41=plazo gracia, H41=interés, L$21=tasa, L$19=total períodos
      let cuota: number
      if (n <= N) { // SI(D41<=F41 - período actual <= total períodos)
        if (plazoGracia === "T") { // SI(E41="T" - gracia total)
          cuota = 0
        } else if (plazoGracia === "P") { // SI(E41="P" - gracia parcial)
          cuota = Math.abs(interes) // H41 - usar interés e "-" para imprimir negativo
        } else { // PAGO(L$21;L$19-D41+1;F41;0;0) - sin gracia
          // PAGO(tasa, períodos_restantes, valor_presente, valor_futuro, tipo)
          // períodos_restantes = L$19-D41+1 = N-n+1
          const periodosRestantes = N - n + 1
          if (periodosRestantes > 0) {
            // Fórmula PAGO: PMT = PV * (r * (1+r)^n) / ((1+r)^n - 1)
            const cuotaPago = saldoInicial * ((i * Math.pow(1 + i, periodosRestantes)) / (Math.pow(1 + i, periodosRestantes) - 1))
            cuota = cuotaPago // para imprimir negativo como en Excel
          } else {
            cuota = 0
          }
        }
      } else { // Fuera del número total de períodos
        cuota = 0
      }

      // 5. Amortización
      // =SI(numero de fila <= total; SI(O(Plazo de gracia ="T"; Plazo de gracia ="P"); 0; Cuota-Interes); 0)
      let amortizacion: number
      if (n <= N) {
        if (plazoGracia === "T" || plazoGracia === "P") {
          amortizacion = 0
        } else {
          amortizacion = cuota - Math.abs(interes)
        }
      } else {
        amortizacion = 0
      }

      // 6. Flujo Emisor
      // =-Cuota
      const flujoEmisor = -cuota

      // 7. Flujo Bonista  
      // =Cuota
      const flujoBonista = cuota

      // Saldo final (para la siguiente iteración)

      //=SI(D40<=$L$19;SI(E40="S";+F40+J40;SI(E40="T";F40-H40;F40));0)
      let saldoFinal: number
      if (n <= N) {
        if (plazoGracia === "S") {
          saldoFinal = saldoInicial - amortizacion
        } else if (plazoGracia === "T"){
          saldoFinal = saldoInicial - interes
        }else {
          saldoFinal = saldoInicial 

        }
      } else {
        saldoFinal = 0
      }

      //const saldoFinal = saldoInicial - amortizacion

      // Valor presente y factores
      //8. Flujo actualizado (PV) - Usar COK por período para descontar
      const cokPeriodoDecimal = input.tasaOportunidad ? Math.pow(1 + pct(input.tasaOportunidad), (input.diasPorAnio / input.frecuenciaCupon) / 360) - 1 : 0
      const pv = flujoBonista / Math.pow(1 + cokPeriodoDecimal, n)
      //9. FA x Plazo - Fórmula exacta del Excel: PV * n * (días por período / 360)
      const faPlazo = pv * n * (diasPorPeriodo / 360)
      //10. Factor de Convexidad - Fórmula exacta del Excel: PV * n * (n + 1)
      const factorConv = pv * n * (n + 1)

      rows.push({
        n,
        plazoGracia: plazoGracia,
        bono: saldoInicial, // Saldo Inicial (cambio: ahora es saldoInicial, no saldoFinal)
        saldoFinal: saldoFinal, // Saldo Final
        cuponInteres: interes,
        cuota: cuota,
        amort: amortizacion,
        flujoEmisor: flujoEmisor,
        flujoBonista: flujoBonista,
        flujoAct: pv,
        faXPlazo: faPlazo,
        factorConv: factorConv,
      })

      // Log detallado para los primeros períodos y el último
      if (n <= 2 || n === N) {
        const periodosRestantes = N - n + 1
        CalculationLogger.addStep({
          step: `Período ${n}`,
          description: `Cálculo completo del período ${n} con fórmula PAGO de Excel`,
          formula: "=SI(periodo<=total;SI(gracia='T';0;SI(gracia='P';interes;PAGO(tasa;total-periodo+1;saldo;0;0)));0)",
          inputs: {
            periodo: n,
            plazoGracia: plazoGracia,
            saldoInicial: saldoInicial,
            tasaPeriodica: i,
            totalPeriodos: N,
            periodosRestantesPago: periodosRestantes,
            formulaExcel: `=SI(${n}<=${N};SI("${plazoGracia}"="T";0;SI("${plazoGracia}"="P";${interes};PAGO(${i};${periodosRestantes};${saldoInicial};0;0)));0)`,
          },
          calculation: `PlazoGracia=${plazoGracia}, SaldoIni=${saldoInicial}, Interés=${interes}, PeriodosRestPago=${periodosRestantes}, Cuota=${cuota}, Amort=${amortizacion}, FlujoE=${flujoEmisor}, FlujoB=${flujoBonista}, SaldoFin=${saldoFinal}`,
          result: {
            plazoGracia,
            saldoInicial,
            interes,
            cuota,
            amortizacion,
            flujoEmisor,
            flujoBonista,
            saldoFinal,
            periodosRestantesPago: periodosRestantes,
          },
        })
      }
    }
  }

  CalculationLogger.addStep({
    step: "Cronograma Completado",
    description: "Finalización de la generación del cronograma con fórmula PAGO de Excel",
    formula: "=SI(periodo<=total;SI(gracia='T';0;SI(gracia='P';interes;PAGO(tasa;total-periodo+1;saldo;0;0)));0)",
    inputs: {
      totalPeriodos: rows.length,
      sumaFlujosBonista: rows.reduce((s, r) => s + r.flujoBonista, 0),
      sumaFlujosActualizados: rows.reduce((s, r) => s + r.flujoAct, 0),
      logicaAplicada: "Fórmula PAGO de Excel implementada: períodos dinámicos según posición actual",
      formulaExcel: "=SI(D41<=F41;SI(E41='T';0;SI(E41='P';H41;PAGO(L$21;L$19-D41+1;F41;0;0)));0)",
    },
    calculation: `${rows.length} períodos generados (0 a ${N}) con fórmula PAGO de Excel`,
    result: "Cronograma completo con lógica PAGO implementada correctamente",
  })

  return rows
}

/* ---------- Constantes derivadas ---------- */

export function calculateConstants(input: BondInput): BondConstants {
  console.log('🔍 calculateConstants - input recibido:', input);
  console.log('🔍 calculateConstants - tasaOportunidad:', input.tasaOportunidad);
  console.log('🔍 calculateConstants - tipo tasaOportunidad:', typeof input.tasaOportunidad);
  const pctEstruct = pct(input.pctEstruct)
  const pctColoc = pct(input.pctColoc)
  const pctCavali = pct(input.pctCavali)
  const tasaDecimal = pct(input.tasaInteres)

  const m = input.frecuenciaCupon
  const nPeriodosPorAnio = m
  const N = input.nAnios * m
  const Ng = input.plazoGraciaAnio * m

  // TEA (Tasa Efectiva Anual)
  let tea: number
  if (input.tipoTasa === "Nominal") {
    const tna = tasaDecimal
    let mCap = null;
    switch (input.capitalizacion) {
      case 'Diaria': mCap = 360; break;
      case 'Quincenal': mCap = 24; break;
      case 'Mensual': mCap = 12; break;
      case 'Bimestral': mCap = 6; break;
      case 'Trimestral': mCap = 4; break;
      case 'Cuatrimestral': mCap = 3; break;
      case 'Semestral': mCap = 2; break;
      case 'Anual': mCap = 1; break;
      default: mCap = null;
    }
    if (mCap) {
      tea = Math.pow(1 + tna / mCap, mCap) - 1;
    } else {
      tea = Math.pow(1 + tna / m, m) - 1;
    }
  } else {
    tea = tasaDecimal
  }

  // Tasa Efectiva por Período (TEM, TET, TES, etc.)
  const tasaEfectivaPeriodo = Math.pow(1 + tea, 1 / m) - 1
  const nombreTasaPeriodo = obtenerNombreTasaEfectiva(m)

  // TEM siempre (para comparación)
  const tem = Math.pow(1 + tea, 1 / 12) - 1

  // Tasa periódica (i) - Usar la tasa efectiva por período
  const tasaPeriodicaCalc = tasaEfectivaPeriodo

  // Costes iniciales
  const costesInicialesEmisor = input.valorNominal * (pctEstruct + pctColoc + pctCavali)
  const costesInicialesBonista = input.valorNominal * pctCavali

  // COK por período - Fórmula corregida según el ejemplo
  console.log('🔍 COK por período - Valores de entrada:', {
    tasaOportunidad: input.tasaOportunidad,
    diasPorAnio: input.diasPorAnio,
    tasaOportunidadDecimal: pct(input.tasaOportunidad),
    diasPorPeriodo: input.diasPorAnio / input.frecuenciaCupon
  });
  // Fórmula corregida: (1 + tasaOportunidad)^(diasPorPeriodo/360) - 1
  const cokPeriodo = input.tasaOportunidad ? (Math.pow(1 + pct(input.tasaOportunidad), (input.diasPorAnio / input.frecuenciaCupon) / 360) - 1) * 100 : undefined
  console.log('🔍 COK por período - Cálculo:', {
    base: 1 + pct(input.tasaOportunidad),
    exponente: (input.diasPorAnio / input.frecuenciaCupon) / 360,
    resultado: cokPeriodo
  });

  // Días capitalización (solo para tasa nominal)
  let diasCapitalizacion: number | undefined
  if (input.tipoTasa === 'Nominal' && input.capitalizacion) {
    switch (input.capitalizacion) {
      case 'Diaria': diasCapitalizacion = 1; break;
      case 'Quincenal': diasCapitalizacion = 15; break;
      case 'Mensual': diasCapitalizacion = 30; break;
      case 'Bimestral': diasCapitalizacion = 60; break;
      case 'Trimestral': diasCapitalizacion = 90; break;
      case 'Cuatrimestral': diasCapitalizacion = 120; break;
      case 'Semestral': diasCapitalizacion = 180; break;
      case 'Anual': diasCapitalizacion = 360; break;
      default: diasCapitalizacion = undefined;
    }
  }

  CalculationLogger.addStep({
    step: "Constantes Derivadas Finales",
    description: "Cálculo de todas las constantes derivadas del bono",
    formula: `TEA, ${nombreTasaPeriodo}, TEM, Costes, COK, Días Capitalización, etc.`,
    inputs: {
      tipoTasa: input.tipoTasa,
      tasaInteres: input.tasaInteres,
      frecuencia: m,
      nombreTasaPeriodo,
      capitalizacion: input.capitalizacion,
      tasaOportunidad: input.tasaOportunidad,
    },
    calculation:
      input.tipoTasa === "Nominal"
        ? `TEA = (1 + ${tasaDecimal}/${m})^${m} - 1 = ${tea}, ${nombreTasaPeriodo} = (1 + ${tea})^(1/${m}) - 1 = ${tasaEfectivaPeriodo}`
        : `TEA = ${tea} (ya efectiva), ${nombreTasaPeriodo} = (1 + ${tea})^(1/${m}) - 1 = ${tasaEfectivaPeriodo}`,
    result: {
      TEA: tea,
      [nombreTasaPeriodo]: tasaEfectivaPeriodo,
      TEM: tem,
      tasaPeriodica: tasaPeriodicaCalc,
      costesEmisor: costesInicialesEmisor,
      costesBonista: costesInicialesBonista,
      cokPeriodo,
      diasCapitalizacion,
    },
  })

  const constants = {
    frecuenciaCupon: m,
    nPeriodosPorAnio,
    nTotalPeriodos: N,
    nPeriodosGracia: Ng,
    tasaEfectivaAnual: tea,
    tasaEfectivaMensual: tem,
    tasaEfectivaPeriodo, // Nueva propiedad
    nombreTasaPeriodo, // Nueva propiedad
    tasaPeriodica: tasaPeriodicaCalc,
    costesInicialesEmisor,
    costesInicialesBonista,
    cokPeriodo,
    diasCapitalizacion,
  }
  
  console.log('🔍 calculateConstants - constants finales:', constants);
  console.log('🔍 calculateConstants - cokPeriodo final:', constants.cokPeriodo);
  
  return constants
}

/* ---------- TIR ---------- */

function irr(cashFlows: number[], guess = 0.1, maxIterations = 100, tolerance = 1e-10): number {
  let rate = guess

  CalculationLogger.addStep({
    step: "Cálculo de TIR (Inicio)",
    description: "Iniciar cálculo de Tasa Interna de Retorno usando Newton-Raphson",
    formula: "NPV = Σ(CF_t / (1+r)^t) = 0",
    inputs: {
      flujosCaja: cashFlows,
      estimacionInicial: guess,
      maxIteraciones: maxIterations,
      tolerancia: tolerance,
    },
    calculation: `Iteración Newton-Raphson con ${cashFlows.length} flujos`,
    result: "TIR iniciado",
  })

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0
    let dnpv = 0

    for (let t = 0; t < cashFlows.length; t++) {
      const factor = Math.pow(1 + rate, t)
      npv += cashFlows[t] / factor
      if (t > 0) {
        dnpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1)
      }
    }

    if (Math.abs(npv) < tolerance) break
    if (Math.abs(dnpv) < 1e-15) break

    const newRate = rate - npv / dnpv
    if (Math.abs(newRate - rate) < tolerance) break

    rate = newRate
  }

  CalculationLogger.addStep({
    step: "TIR Calculada",
    description: "Resultado final del cálculo de TIR",
    formula: "Tasa que hace NPV = 0",
    inputs: {
      tasaFinal: rate,
    },
    calculation: `Convergencia alcanzada en iteraciones`,
    result: `${(rate * 100).toFixed(6)}% anual`,
    dependencies: ["Cronograma Completado"],
  })

  return rate
}

/* ---------- Métricas ---------- */

export function calculateMetrics(input: BondInput, rows: FlowRow[]): BondMetrics {
  const kdDec = input.kd ? pct(input.kd) : 0

  const precio = rows.slice(1).reduce((s, r) => s + r.flujoAct, 0)
  CalculationLogger.addStep({
    step: "Precio Actual",
    description: "Suma de todos los flujos actualizados (excepto período 0)",
    formula: "P = Σ(PV_n) para n=1 a N",
    inputs: {
      flujosPeriodos1aN: rows.slice(1).map((r) => r.flujoAct),
    },
    calculation: `Suma de ${rows.length - 1} flujos actualizados`,
    result: precio,
    dependencies: ["Cronograma Completado"],
  })

  const utilidad = precio + rows[0].flujoBonista
  CalculationLogger.addStep({
    step: "Utilidad",
    description: "Precio actual más el flujo inicial del bonista",
    formula: "Utilidad = Precio + Flujo_Bonista_0",
    inputs: {
      precio,
      flujoInicialBonista: rows[0].flujoBonista,
    },
    calculation: `${precio} + (${rows[0].flujoBonista}) = ${utilidad}`,
    result: utilidad,
    dependencies: ["Precio Actual"],
  })

  const sumFaPlazo = rows.reduce((s, r) => s + r.faXPlazo, 0)
  // Duración: Excel usa la suma de todos los flujos actualizados (excluyendo período 0) como denominador
  const precioTotal = rows.slice(1).reduce((s, r) => s + r.flujoAct, 0)
  const dur = sumFaPlazo / precioTotal
  CalculationLogger.addStep({
    step: "Duración de Macaulay",
    description: "Suma de FA×Plazo dividido por la suma total de flujos actualizados",
    formula: "D = Σ(PV_n × n) / Σ(PV_n)",
    inputs: {
      sumaFaXPlazo: sumFaPlazo,
      precioTotal,
    },
    calculation: `${sumFaPlazo} / ${precioTotal} = ${dur}`,
    result: `${dur.toFixed(4)} años`,
    dependencies: ["Precio Actual"],
  })

  const sumFactorConv = rows.reduce((s, r) => s + r.factorConv, 0)
  // Convexidad: Excel usa el valor absoluto de la suma de todos los flujos actualizados (excluyendo período 0) como denominador
  const precioTotalConvexidad = Math.abs(rows.slice(1).reduce((s, r) => s + r.flujoAct, 0))
  const conv = sumFactorConv / precioTotalConvexidad
  CalculationLogger.addStep({
    step: "Convexidad",
    description: "Suma de factores de convexidad dividido por el valor absoluto de la suma total de flujos actualizados (excluyendo período 0)",
    formula: "CV = Σ(PV_n × n × (n+1)) / |Σ(PV_n)|",
    inputs: {
      sumaFactorConv: sumFactorConv,
      precioTotalConvexidad,
    },
    calculation: `${sumFactorConv} / |${precioTotalConvexidad}| = ${conv}`,
    result: conv,
    dependencies: ["Precio Actual"],
  })

  const total = dur + conv
  const durMod = kdDec > 0 ? dur / (1 + kdDec) : dur

  CalculationLogger.addStep({
    step: "Duración Modificada",
    description: "Duración ajustada por la tasa de descuento",
    formula: "D_mod = D / (1 + kd)",
    inputs: {
      duracion: dur,
      kd: kdDec,
    },
    calculation: kdDec > 0 ? `${dur} / (1 + ${kdDec}) = ${durMod}` : `${dur} (kd = 0)`,
    result: durMod,
    dependencies: ["Duración de Macaulay"],
  })

  // Cálculo de TCEA como suma de tasa de interés del cupón y % de estructuración, colocación y cavali
  const tcea =
    pct(input.tasaInteres) +
    pct(input.pctEstruct) +
    pct(input.pctColoc) +
    pct(input.pctCavali)

  CalculationLogger.addStep({
    step: "TCEA Manual",
    description:
      "TCEA calculada como suma de tasa de interés del cupón y porcentajes de estructuración, colocación y cavali",
    formula:
      "TCEA = tasaInteres + pctEstruct + pctColoc + pctCavali (en decimal)",
    inputs: {
      tasaInteres: input.tasaInteres,
      pctEstruct: input.pctEstruct,
      pctColoc: input.pctColoc,
      pctCavali: input.pctCavali,
    },
    calculation: `${pct(input.tasaInteres)} + ${pct(input.pctEstruct)} + ${pct(
      input.pctColoc
    )} + ${pct(input.pctCavali)} = ${tcea}`,
    result: `${(tcea * 100).toFixed(6)}%`,
  })

    // Cálculo de TREA como resta de tasa de interés del cupón y % dcavali

  const trea = pct(input.tasaInteres) - pct(input.pctCavali)

  const finalMetrics = {
    precioActual: precio,
    utilidad,
    duracion: dur,
    convexidad: conv,
    total,
    duracionModif: durMod,
    tceaEmisor: tcea,
    treaBonista: trea,
  }

  CalculationLogger.addStep({
    step: "Métricas Finales",
    description: "Resumen de todas las métricas calculadas",
    formula: "Compilación de resultados",
    inputs: finalMetrics,
    calculation: "Todas las métricas calculadas",
    result: finalMetrics,
    dependencies: ["Precio Actual", "Utilidad", "Duración de Macaulay", "Convexidad", "TIR Calculada"],
  })

  return finalMetrics
}

// Función principal que calcula todo
export function calculateBond(input: BondInput, bondName = "Bono"): BondCalculationResult {
  CalculationLogger.startLogging(bondName, input)

  const constants = calculateConstants(input)
  const schedule = buildBondTable(input)
  const metrics = calculateMetrics(input, schedule)

  CalculationLogger.finishLogging(constants, schedule, metrics)

  return {
    input,
    constants,
    schedule,
    metrics,
  }
}

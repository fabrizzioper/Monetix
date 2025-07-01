export interface CalculationStep {
  step: string
  description: string
  formula: string
  inputs: Record<string, any>
  calculation: string
  result: any
  dependencies?: string[]
}

export interface CalculationLog {
  timestamp: string
  bondName: string
  input: any
  steps: CalculationStep[]
  constants: any
  schedule: any[]
  metrics: any
}

export class CalculationLogger {
  private static log: CalculationLog | null = null
  private static steps: CalculationStep[] = []

  static startLogging(bondName: string, input: any) {
    this.steps = []
    this.log = {
      timestamp: new Date().toISOString(),
      bondName,
      input,
      steps: [],
      constants: null,
      schedule: [],
      metrics: null,
    }

  }

  static addStep(step: CalculationStep) {
    this.steps.push(step)

    if (step.dependencies) {
    
    }
  }

  static finishLogging(constants: any, schedule: any[], metrics: any) {
    if (this.log) {
      this.log.steps = [...this.steps]
      this.log.constants = constants
      this.log.schedule = schedule
      this.log.metrics = metrics

    }
  }

  static getLog(): CalculationLog | null {
    return this.log
  }

  static generateDocumentation(): string {
    if (!this.log) return ""

    let doc = `# DOCUMENTACIÓN COMPLETA DE CÁLCULOS DE BONO\n\n`
    doc += `**Bono:** ${this.log.bondName}\n`
    doc += `**Fecha:** ${new Date(this.log.timestamp).toLocaleString("es-PE")}\n\n`

    doc += `## 1. DATOS DE ENTRADA\n\n`
    Object.entries(this.log.input).forEach(([key, value]) => {
      doc += `- **${key}:** ${value}\n`
    })

    doc += `\n## 2. CÁLCULOS PASO A PASO\n\n`
    this.log.steps.forEach((step, index) => {
      doc += `### Paso ${index + 1}: ${step.step}\n\n`
      doc += `**Descripción:** ${step.description}\n\n`
      doc += `**Fórmula:** \`${step.formula}\`\n\n`
      doc += `**Entradas:**\n`
      Object.entries(step.inputs).forEach(([key, value]) => {
        doc += `- ${key} = ${value}\n`
      })
      doc += `\n**Cálculo:** ${step.calculation}\n\n`
      doc += `**Resultado:** ${step.result}\n\n`
      if (step.dependencies) {
        doc += `**Depende de:** ${step.dependencies.join(", ")}\n\n`
      }
      doc += `---\n\n`
    })

    doc += `## 3. CONSTANTES DERIVADAS\n\n`
    Object.entries(this.log.constants).forEach(([key, value]) => {
      doc += `- **${key}:** ${value}\n`
    })

    doc += `\n## 4. CRONOGRAMA DETALLADO\n\n`
    doc += `| Período | Plazo Gracia | Bono | Cupón | Flujo Emisor | Flujo Bonista | Flujo Actualizado |\n`
    doc += `|---------|--------------|------|-------|--------------|---------------|-------------------|\n`
    this.log.schedule.forEach((row) => {
      doc += `| ${row.n} | ${row.plazoGracia} | ${row.bono.toFixed(2)} | ${row.cuponInteres.toFixed(2)} | ${row.flujoEmisor.toFixed(2)} | ${row.flujoBonista.toFixed(2)} | ${row.flujoAct.toFixed(2)} |\n`
    })

    doc += `\n## 5. MÉTRICAS FINALES\n\n`
    Object.entries(this.log.metrics).forEach(([key, value]) => {
      doc += `- **${key}:** ${typeof value === "number" ? value.toFixed(6) : value}\n`
    })

    return doc
  }
}

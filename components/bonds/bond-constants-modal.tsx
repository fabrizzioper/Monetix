import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils/format";
import React from "react";

interface BondConstantsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  input: any;
  constants: any;
}

export const BondConstantsModal: React.FC<BondConstantsModalProps> = ({ open, onOpenChange, input, constants }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Desglose de Constantes Derivadas</DialogTitle>
        <DialogDescription>
          Así se calculan y de dónde salen los valores de la estructuración del bono:
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
        <div className="border-b pb-2 mb-2">
          <b className="text-monetix-primary">Frecuencia Cupón:</b> <span className="font-mono">{(() => {
            switch (Number(constants.frecuenciaCupon)) {
              case 12: return 'Mensual (12)';
              case 6: return 'Bimestral (6)';
              case 4: return 'Trimestral (4)';
              case 3: return 'Cuatrimestral (3)';
              case 2: return 'Semestral (2)';
              case 1: return 'Anual (1)';
              default: return constants.frecuenciaCupon;
            }
          })()}</span><br />
          <span className="text-gray-500">Seleccionado en el formulario.</span>
        </div>
        <div>
          <b className="text-monetix-primary">Días × Año / Frecuencia Cupón:</b><br />
          <span className="text-gray-500">Fórmula: <b>Días por Año / Frecuencia Cupón</b></span><br />
          <span className="text-gray-500">Datos: <b>{input.diasPorAnio} / {constants.frecuenciaCupon}</b></span><br />
          <span className="text-gray-500">Resultado: <b>{input.diasPorAnio && constants.frecuenciaCupon ? (input.diasPorAnio / constants.frecuenciaCupon) : ''}</b></span><br />
          <span className="text-gray-500">Convención de días seleccionada dividido entre la frecuencia.</span>
        </div>
        <div>
          <b className="text-monetix-primary">Nº Periodos/Año:</b><br />
          <span className="text-gray-500">Fórmula: <b>Frecuencia Cupón</b></span><br />
          <span className="text-gray-500">Datos: <b>{constants.frecuenciaCupon}</b></span><br />
          <span className="text-gray-500">Resultado: <b>{constants.nPeriodosPorAnio}</b></span><br />
          <span className="text-gray-500">Equivale a la frecuencia seleccionada.</span>
        </div>
        <div>
          <b className="text-monetix-primary">Nº Total Periodos:</b><br />
          <span className="text-gray-500">Fórmula: <b>Nº Periodos/Año × Nº de Años</b></span><br />
          <span className="text-gray-500">Datos: <b>{constants.nPeriodosPorAnio} × {input.nAnios}</b></span><br />
          <span className="text-gray-500">Resultado: <b>{constants.nTotalPeriodos}</b></span><br />
          <span className="text-gray-500">Total de períodos del bono.</span>
        </div>
        <div>
          <b className="text-monetix-primary">Nº Periodos Gracia:</b><br />
          <span className="text-gray-500">Fórmula: <b>Nº de Años de Gracia × Frecuencia</b></span><br />
          <span className="text-gray-500">Datos: <b>{input.plazoGraciaAnio} × {constants.frecuenciaCupon}</b></span><br />
          <span className="text-gray-500">Resultado: <b>{constants.nPeriodosGracia}</b></span><br />
          <span className="text-gray-500">Períodos de gracia según los años y frecuencia.</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <b className="text-monetix-primary">TEA (Tasa Efectiva Anual):</b><br />
          {input.tipoTasa === 'Efectiva' ? (
            <>
              <span className="text-gray-500">Fórmula: <b>Tasa de interés ingresada</b></span><br />
              <span className="text-gray-500">Datos: <b>{Number(input.tasaInteres).toFixed(3)}%</b></span><br />
              <span className="text-gray-500">Resultado: <b>{Number(input.tasaInteres).toFixed(3)}%</b></span><br />
              <span className="text-gray-500">Tasa de interés ingresada.</span>
            </>
          ) : (
            <>
              <span className="text-gray-500">Fórmula: <b>(1 + TNA/m)<sup>m</sup> - 1</b></span><br />
              <span className="text-gray-500">Datos: <b>TNA = {input.tasaInteres}%, m = {input.diasPorAnio} / {constants.frecuenciaCupon} = {(input.diasPorAnio / constants.frecuenciaCupon)}</b></span><br />
              <span className="text-gray-500">Resultado: <b>{(() => {
                const m = input.diasPorAnio / constants.frecuenciaCupon;
                const tna = Number(input.tasaInteres) / 100;
                const tea = (Math.pow(1 + tna / m, m) - 1) * 100;
                return tea.toFixed(3);
              })()}%</b></span><br />
              <span className="text-gray-500">Calculada a partir de la tasa nominal anual.</span>
            </>
          )}
        </div>
        <div>
          <b className="text-monetix-primary">{constants.nombreTasaPeriodo || 'Tasa por Período'}:</b><br />
          <span className="text-gray-500">Fórmula: <b>(1 + {constants.nombreTasaPeriodo})^({constants.frecuenciaCupon}/{input.diasPorAnio}) - 1</b></span><br />
          <span className="text-gray-500">Datos: <b>(1 + {(constants.tasaEfectivaPeriodo || 0).toFixed(6)})^({constants.frecuenciaCupon}/{input.diasPorAnio}) - 1</b></span><br />
          <span className="text-gray-500">Resultado: <b>{(() => {
            const base = 1 + (constants.tasaEfectivaPeriodo || 0);
            const exp = constants.frecuenciaCupon / input.diasPorAnio;
            const res = Math.pow(base, exp) - 1;
            return (res * 100).toFixed(6) + '%';
          })()}</b></span><br />
          <span className="text-gray-500">Tasa efectiva por período según frecuencia.</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <b className="text-monetix-primary">Costes Iniciales Emisor:</b><br />
          <span className="text-gray-500">Fórmula: <b>(% Estructuración + % Colocación + % CAVALI) × Valor Nominal</b></span><br />
          <span className="text-gray-500">Datos: <b>({input.pctEstruct}% + {input.pctColoc}% + {input.pctCavali}%) × {formatCurrency(Number(input.valorNominal || 0), 'PEN')}</b></span><br />
          <span className="text-gray-500">Resultado: <b>{formatCurrency((Number(input.pctEstruct || 0) + Number(input.pctColoc || 0) + Number(input.pctCavali || 0)) / 100 * Number(input.valorNominal || 0), 'PEN')}</b></span><br />
          <span className="text-gray-500">Suma de % Estructuración, % Colocación y % CAVALI multiplicado por el Valor Nominal.</span>
        </div>
        <div>
          <b className="text-monetix-primary">Costes Bonista:</b><br />
          <span className="text-gray-500">Fórmula: <b>% CAVALI × Valor Nominal</b></span><br />
          <span className="text-gray-500">Datos: <b>{input.pctCavali}% × {formatCurrency(Number(input.valorNominal || 0), 'PEN')}</b></span><br />
          <span className="text-gray-500">Resultado: <b>{formatCurrency(constants.costesInicialesBonista, 'PEN')}</b></span><br />
          <span className="text-gray-500">Solo % CAVALI × Valor Nominal</span>
        </div>
        <div>
          <b className="text-monetix-primary">COK {constants.nombreTasaPeriodo || 'por Período'}:</b><br />
          <span className="text-gray-500">Fórmula: <b>(1 + Tasa anual de oportunidad)^(Días por Período / 360) - 1</b></span><br />
          <span className="text-gray-500">Datos: <b>(1 + {input.tasaOportunidad}%)^({input.diasPorAnio / input.frecuenciaCupon} / 360) - 1</b></span><br />
          <span className="text-gray-500">Resultado: <b>{constants.cokPeriodo ? constants.cokPeriodo.toFixed(5) + '%' : 'N/A'}</b></span><br />
          <span className="text-gray-500">Costo de oportunidad del capital por período.</span>
        </div>
        {input.tipoTasa === 'Nominal' && constants.diasCapitalizacion && (
          <div>
            <b className="text-monetix-primary">Días capitalización:</b><br />
            <span className="text-gray-500">Fórmula: <b>=SI(Capitalización="Diaria",1,SI(Capitalización="Quincenal",15,SI(Capitalización="Mensual",30,SI(Capitalización="Bimestral",60,SI(Capitalización="Trimestral",90,SI(Capitalización="Cuatrimestral",120,SI(Capitalización="Semestral",180,360)))))))</b></span><br />
            <span className="text-gray-500">Datos: <b>Capitalización = {input.capitalizacion}</b></span><br />
            <span className="text-gray-500">Resultado: <b>{constants.diasCapitalizacion}</b></span><br />
            <span className="text-gray-500">Se activa cuando se escoge nominal.</span>
          </div>
        )}
      </div>
      <DialogFooter>
        <button onClick={() => onOpenChange(false)} className="mt-4 px-4 py-2 rounded bg-monetix-primary text-white hover:bg-monetix-secondary">Cerrar</button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
); 




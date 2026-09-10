import { useState } from "react";
import { api, FREQUENCY_LABELS, type Frequency, type RateType } from "../lib/api";

const FREQUENCIES = Object.keys(FREQUENCY_LABELS) as Frequency[];

export default function LoanForm() {
  const [name, setName] = useState("Mi préstamo");
  const [principal, setPrincipal] = useState("10000");
  const [rateType, setRateType] = useState<RateType>("TEA");
  const [ratePercent, setRatePercent] = useState("18");
  const [frequency, setFrequency] = useState<Frequency>("MENSUAL");
  const [numInstallments, setNumInstallments] = useState("12");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const principalNum = Number(principal);
    const rateNum = Number(ratePercent) / 100;
    const nNum = Number(numInstallments);

    if (!principalNum || principalNum <= 0) {
      setError("Ingresa un monto válido mayor a 0.");
      return;
    }
    if (!rateNum || rateNum <= 0) {
      setError("Ingresa una tasa válida mayor a 0%.");
      return;
    }
    if (!nNum || nNum <= 0 || !Number.isInteger(nNum)) {
      setError("El número de cuotas debe ser un entero mayor a 0.");
      return;
    }

    setLoading(true);
    try {
      const loan = await api.createLoan({
        name: name.trim() || "Préstamo",
        principal: principalNum,
        annual_rate: rateNum,
        rate_type: rateType,
        frequency,
        num_installments: nNum,
        start_date: startDate || undefined,
      });
      window.location.href = `/prestamos/${loan.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el préstamo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-slate-700">Nombre del préstamo</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Monto (S/)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Número de cuotas</label>
          <input
            type="number"
            min="1"
            step="1"
            value={numInstallments}
            onChange={(e) => setNumInstallments(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Tipo de tasa</label>
          <select
            value={rateType}
            onChange={(e) => setRateType(e.target.value as RateType)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="TEA">TEA (Tasa Efectiva Anual)</option>
            <option value="TCEA">TCEA (Tasa de Costo Efectivo Anual)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Tasa anual (%)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={ratePercent}
            onChange={(e) => setRatePercent(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Frecuencia de pago</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {FREQUENCY_LABELS[f]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Fecha de primer pago</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-slate-500">Si se deja vacío, se usa la fecha de hoy.</p>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? "Calculando..." : "Calcular cronograma"}
      </button>
    </form>
  );
}

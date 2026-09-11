import { useState } from "react";
import { api, FREQUENCY_LABELS, type Frequency, type LoanDetail, type RateType } from "../lib/api";

const FREQUENCIES = Object.keys(FREQUENCY_LABELS) as Frequency[];

interface Props {
  /** When provided, the form edits this loan instead of creating a new one. */
  loan?: LoanDetail;
  onSaved?: (loan: LoanDetail) => void;
  onCancel?: () => void;
}

export default function LoanForm({ loan, onSaved, onCancel }: Props) {
  const isEdit = Boolean(loan);

  const [name, setName] = useState(loan?.name ?? "Mi préstamo");
  const [principal, setPrincipal] = useState(loan?.principal ?? "10000");
  const [rateType, setRateType] = useState<RateType>(loan?.rate_type ?? "TEA");
  const [ratePercent, setRatePercent] = useState(loan ? String(Number(loan.annual_rate) * 100) : "18");
  const [frequency, setFrequency] = useState<Frequency>(loan?.frequency ?? "MENSUAL");
  const [numInstallments, setNumInstallments] = useState(loan ? String(loan.num_installments) : "12");
  const [startDate, setStartDate] = useState(loan?.start_date ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function stepInstallments(delta: number) {
    const current = Number(numInstallments) || 0;
    const next = Math.min(600, Math.max(1, current + delta));
    setNumInstallments(String(next));
  }

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

    if (isEdit && loan!.amortizations.length > 0) {
      const confirmed = window.confirm(
        `Este préstamo tiene ${loan!.amortizations.length} amortización(es) aplicada(s). ` +
          "Guardar estos cambios recalcula el cronograma desde cero y borra ese historial. ¿Continuar?",
      );
      if (!confirmed) return;
    }

    const payload = {
      name: name.trim() || "Préstamo",
      principal: principalNum,
      annual_rate: rateNum,
      rate_type: rateType,
      frequency,
      num_installments: nNum,
      start_date: startDate || undefined,
    };

    setLoading(true);
    try {
      if (isEdit) {
        const updated = await api.updateLoan(loan!.id, payload);
        onSaved?.(updated);
      } else {
        const created = await api.createLoan(payload);
        window.location.href = `/prestamos/${created.id}`;
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el préstamo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-3xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(19,19,16,0.04),0_16px_40px_-24px_rgba(19,19,16,0.35)] sm:p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="font-display text-sm font-semibold text-ink">
          {isEdit ? "Editar préstamo" : "Nuevo préstamo"}
        </span>
        {!isEdit && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-faint">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-600"></span>
            cálculo en vivo
          </span>
        )}
      </div>

      {isEdit && loan!.amortizations.length > 0 && (
        <p className="mb-6 rounded-lg bg-accent-soft px-3 py-2 text-xs font-medium text-accent-ink">
          Este préstamo tiene {loan!.amortizations.length} amortización(es) aplicada(s). Guardar cambios
          recalcula el cronograma desde cero y borra ese historial.
        </p>
      )}

      <label className="block text-xs font-medium uppercase tracking-wide text-ink-faint">Monto del préstamo</label>
      <div className="mt-2 flex items-baseline gap-2 border-b-2 border-line pb-2 transition-colors focus-within:border-ink">
        <span className="font-display text-2xl font-medium text-ink-faint">S/</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          className="w-full bg-transparent font-display text-3xl font-semibold text-ink outline-none placeholder:text-ink-faint sm:text-4xl"
          required
        />
      </div>

      <div className="mt-7 grid grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-faint">Tipo de tasa</label>
          <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-line bg-paper p-1">
            {(["TEA", "TCEA"] as RateType[]).map((rt) => (
              <button
                key={rt}
                type="button"
                onClick={() => setRateType(rt)}
                className={`rounded-md py-1.5 text-xs font-semibold transition-colors ${
                  rateType === rt ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
                }`}
              >
                {rt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-faint">Tasa anual</label>
          <div className="mt-2 flex items-baseline gap-1 border-b-2 border-line pb-1.5 transition-colors focus-within:border-ink">
            <input
              type="number"
              min="0"
              step="0.01"
              value={ratePercent}
              onChange={(e) => setRatePercent(e.target.value)}
              className="w-full bg-transparent font-display text-xl font-semibold text-ink outline-none"
              required
            />
            <span className="font-display text-xl font-semibold text-ink-faint">%</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-faint">Frecuencia</label>
          <div className="relative mt-2">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              className="w-full appearance-none rounded-lg border border-line bg-paper px-3 py-2.5 text-sm font-medium text-ink outline-none transition-colors focus:border-ink"
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {FREQUENCY_LABELS[f]}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
            >
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-faint">N° de cuotas</label>
          <div className="mt-2 flex items-center rounded-lg border border-line bg-paper">
            <button
              type="button"
              onClick={() => stepInstallments(-1)}
              className="flex h-[42px] w-9 shrink-0 items-center justify-center text-ink-soft transition-colors hover:text-ink"
              aria-label="Restar cuota"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              step="1"
              value={numInstallments}
              onChange={(e) => setNumInstallments(e.target.value)}
              className="w-full bg-transparent text-center text-sm font-semibold text-ink outline-none"
              required
            />
            <button
              type="button"
              onClick={() => stepInstallments(1)}
              className="flex h-[42px] w-9 shrink-0 items-center justify-center text-ink-soft transition-colors hover:text-ink"
              aria-label="Sumar cuota"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <details className="mt-6 group" open={isEdit}>
        <summary className="cursor-pointer list-none text-xs font-medium text-ink-faint transition-colors hover:text-ink-soft">
          <span className="inline-flex items-center gap-1">
            Opciones avanzadas
            <svg
              className="transition-transform group-open:rotate-180"
              width="10"
              height="7"
              viewBox="0 0 12 8"
              fill="none"
            >
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </summary>
        <div className="mt-4 grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-faint">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm font-medium text-ink outline-none transition-colors focus:border-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-faint">Primer pago</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm font-medium text-ink outline-none transition-colors focus:border-ink"
            />
          </div>
        </div>
      </details>

      {error && (
        <p className="mt-5 rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{error}</p>
      )}

      <div className={`mt-7 flex gap-3 ${isEdit ? "flex-row-reverse" : ""}`}>
        <button
          type="submit"
          disabled={loading}
          className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-display text-sm font-semibold uppercase tracking-wide text-accent-ink transition-all hover:brightness-95 active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? "Guardando…" : isEdit ? "Guardar cambios" : "Calcular cronograma"}
          {!loading && (
            <svg
              className="transition-transform group-hover:translate-x-0.5"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-line px-5 py-3.5 font-display text-sm font-semibold text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

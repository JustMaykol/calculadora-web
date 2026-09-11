import { Fragment, useState } from "react";
import { api, FREQUENCY_LABELS, formatMoney, formatPercent, type LoanDetail } from "../lib/api";

interface Props {
  initialLoan: LoanDetail;
}

export default function ScheduleTable({ initialLoan }: Props) {
  const [loan, setLoan] = useState<LoanDetail>(initialLoan);
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentPayment = loan.installments[0]?.payment_amount;
  const totalPaid = Number(loan.total_paid);
  const principalShare = totalPaid > 0 ? (Number(loan.principal) / totalPaid) * 100 : 0;
  const interestShare = 100 - principalShare;

  function openAmortizeForm(number: number) {
    setOpenRow(number);
    setAmount("");
    setError(null);
  }

  async function submitAmortization(number: number) {
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setError("Ingresa un monto válido mayor a 0.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updated = await api.amortize(loan.id, number, amountNum);
      setLoan(updated);
      setOpenRow(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo aplicar la amortización.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero stat */}
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Cuota fija actual</p>
            <p className="mt-2 font-display text-5xl font-semibold tracking-tightest text-ink sm:text-6xl">
              <span className="text-2xl font-medium text-ink-faint align-top mr-1">S/</span>
              {currentPayment ? formatMoney(currentPayment) : "—"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:flex sm:gap-10">
            <Stat label="Monto" value={`S/ ${formatMoney(loan.principal)}`} />
            <Stat label={loan.rate_type} value={formatPercent(loan.annual_rate)} />
            <Stat label="Frecuencia" value={FREQUENCY_LABELS[loan.frequency]} />
            <Stat label="Cuotas" value={String(loan.num_installments)} />
          </div>
        </div>

        <div className="mt-8 border-t border-line-soft pt-6">
          <div className="flex items-center justify-between text-xs font-medium text-ink-soft">
            <span>Composición del total a pagar</span>
            <span className="font-mono text-ink-faint">S/ {formatMoney(loan.total_paid)}</span>
          </div>
          <div className="mt-2.5 flex h-2.5 w-full overflow-hidden rounded-full bg-paper">
            <div className="h-full bg-ink" style={{ width: `${principalShare}%` }} />
            <div className="h-full bg-accent" style={{ width: `${interestShare}%` }} />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ink" /> Capital · S/ {formatMoney(loan.principal)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> Interés · S/ {formatMoney(loan.total_interest)} ({interestShare.toFixed(1)}%)
            </span>
            {loan.amortizations.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-ink-faint">
                {loan.amortizations.length} amortización{loan.amortizations.length > 1 ? "es" : ""} aplicada
                {loan.amortizations.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Schedule table */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <p className="font-display text-sm font-semibold text-ink">Cronograma de pagos</p>
          <p className="text-xs text-ink-faint">{loan.installments.length} cuotas</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-5 py-3 sm:px-6">N°</th>
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3 text-right">Saldo inicial</th>
                <th className="px-3 py-3 text-right">Interés</th>
                <th className="px-3 py-3 text-right">Amortización</th>
                <th className="px-3 py-3 text-right">Cuota</th>
                <th className="px-3 py-3 text-right">Saldo final</th>
                <th className="px-3 py-3 sm:px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {loan.installments.map((row) => {
                const isLast = Number(row.final_balance) <= 0;
                const isOpen = openRow === row.number;
                return (
                  <Fragment key={row.number}>
                    <tr className={`transition-colors hover:bg-paper/70 ${isLast ? "bg-accent-soft/40" : ""}`}>
                      <td className="px-5 py-3 font-mono text-ink-soft sm:px-6">{row.number}</td>
                      <td className="px-3 py-3 text-ink-soft">{row.due_date}</td>
                      <td className="px-3 py-3 text-right font-mono text-ink-soft">{formatMoney(row.initial_balance)}</td>
                      <td className="px-3 py-3 text-right font-mono text-ink-soft">{formatMoney(row.interest_amount)}</td>
                      <td className="px-3 py-3 text-right font-mono text-ink-soft">{formatMoney(row.amortization_amount)}</td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-ink">{formatMoney(row.payment_amount)}</td>
                      <td className="px-3 py-3 text-right font-mono text-ink-soft">{formatMoney(row.final_balance)}</td>
                      <td className="px-3 py-3 text-right sm:px-6">
                        {!isLast && (
                          <button
                            onClick={() => (isOpen ? setOpenRow(null) : openAmortizeForm(row.number))}
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                              isOpen
                                ? "border-ink bg-ink text-paper"
                                : "border-line text-ink-soft hover:border-ink/40 hover:text-ink"
                            }`}
                          >
                            {isOpen ? "Cerrar" : "+ Amortizar"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-accent-soft/50">
                        <td colSpan={8} className="px-5 py-4 sm:px-6">
                          <div className="flex flex-wrap items-end gap-4">
                            <div>
                              <label className="block text-xs font-medium text-ink-soft">
                                Abono extra a capital · saldo disponible S/ {formatMoney(row.final_balance)}
                              </label>
                              <div className="mt-1.5 flex items-baseline gap-1.5 border-b-2 border-ink/20 pb-1 focus-within:border-ink">
                                <span className="font-display text-sm font-medium text-ink-faint">S/</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  className="w-40 bg-transparent font-display text-lg font-semibold text-ink outline-none"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => submitAmortization(row.number)}
                              disabled={loading}
                              className="rounded-xl bg-ink px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-wide text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
                            >
                              {loading ? "Aplicando…" : "Confirmar y recalcular"}
                            </button>
                            {error && <p className="text-sm font-medium text-danger">{error}</p>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {loan.amortizations.length > 0 && (
        <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <p className="font-display text-sm font-semibold text-ink">Historial de amortizaciones</p>
          <ul className="mt-4 space-y-3">
            {loan.amortizations.map((a) => (
              <li key={a.id} className="flex items-center gap-3 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-600" />
                <span className="text-ink-soft">Cuota {a.installment_number}</span>
                <span className="font-mono font-semibold text-ink">S/ {formatMoney(a.amount)}</span>
                <span className="ml-auto text-xs text-ink-faint">
                  {new Date(a.applied_at).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="mt-1 font-display text-base font-semibold text-ink">{value}</dd>
    </div>
  );
}

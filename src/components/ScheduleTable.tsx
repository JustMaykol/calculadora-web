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
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-4">
        <Stat label="Monto" value={`S/ ${formatMoney(loan.principal)}`} />
        <Stat label={loan.rate_type} value={formatPercent(loan.annual_rate)} />
        <Stat label="Frecuencia" value={FREQUENCY_LABELS[loan.frequency]} />
        <Stat label="Cuota actual" value={currentPayment ? `S/ ${formatMoney(currentPayment)}` : "—"} />
        <Stat label="N° de cuotas" value={String(loan.num_installments)} />
        <Stat label="Total interés" value={`S/ ${formatMoney(loan.total_interest)}`} />
        <Stat label="Total a pagar" value={`S/ ${formatMoney(loan.total_paid)}`} />
        <Stat label="Amortizaciones aplicadas" value={String(loan.amortizations.length)} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">N°</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Saldo inicial</th>
              <th className="px-4 py-3 text-right">Interés</th>
              <th className="px-4 py-3 text-right">Amortización</th>
              <th className="px-4 py-3 text-right">Cuota</th>
              <th className="px-4 py-3 text-right">Saldo final</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loan.installments.map((row) => {
              const isLast = Number(row.final_balance) <= 0;
              const isOpen = openRow === row.number;
              return (
                <Fragment key={row.number}>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-700">{row.number}</td>
                    <td className="px-4 py-2.5 text-slate-600">{row.due_date}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{formatMoney(row.initial_balance)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{formatMoney(row.interest_amount)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{formatMoney(row.amortization_amount)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-800">
                      {formatMoney(row.payment_amount)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{formatMoney(row.final_balance)}</td>
                    <td className="px-4 py-2.5 text-right">
                      {!isLast && (
                        <button
                          onClick={() => (isOpen ? setOpenRow(null) : openAmortizeForm(row.number))}
                          className="rounded-md border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                        >
                          {isOpen ? "Cancelar" : "Amortizar"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-indigo-50/50">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="flex flex-wrap items-end gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600">
                              Monto extra a capital (S/) — saldo disponible: {formatMoney(row.final_balance)}
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="mt-1 w-48 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={() => submitAmortization(row.number)}
                            disabled={loading}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                          >
                            {loading ? "Aplicando..." : "Confirmar y recalcular"}
                          </button>
                          {error && <p className="text-sm text-red-700">{error}</p>}
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

      {loan.amortizations.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Historial de amortizaciones extraordinarias</h3>
          <ul className="space-y-1.5 text-sm text-slate-600">
            {loan.amortizations.map((a) => (
              <li key={a.id}>
                Cuota {a.installment_number}: abono extra de S/ {formatMoney(a.amount)} —{" "}
                {new Date(a.applied_at).toLocaleString("es-PE")}
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
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

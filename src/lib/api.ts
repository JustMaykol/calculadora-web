export type RateType = "TEA" | "TCEA";

export type Frequency =
  | "MENSUAL"
  | "QUINCENAL"
  | "BIMESTRAL"
  | "TRIMESTRAL"
  | "CUATRIMESTRAL"
  | "SEMESTRAL"
  | "ANUAL";

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  MENSUAL: "Mensual",
  QUINCENAL: "Quincenal",
  BIMESTRAL: "Bimestral",
  TRIMESTRAL: "Trimestral",
  CUATRIMESTRAL: "Cuatrimestral",
  SEMESTRAL: "Semestral",
  ANUAL: "Anual",
};

export interface LoanCreatePayload {
  name: string;
  principal: number;
  annual_rate: number;
  rate_type: RateType;
  frequency: Frequency;
  num_installments: number;
  start_date?: string;
}

export interface InstallmentOut {
  number: number;
  due_date: string;
  initial_balance: string;
  interest_amount: string;
  amortization_amount: string;
  payment_amount: string;
  final_balance: string;
  status: "PENDING" | "PAID";
}

export interface AmortizationOut {
  id: string;
  installment_number: number;
  amount: string;
  applied_at: string;
}

export interface LoanSummary {
  id: string;
  name: string;
  principal: string;
  annual_rate: string;
  rate_type: RateType;
  frequency: Frequency;
  num_installments: number;
  start_date: string;
  created_at: string;
}

export interface LoanDetail extends LoanSummary {
  installments: InstallmentOut[];
  amortizations: AmortizationOut[];
  total_interest: string;
  total_paid: string;
}

function apiUrl(path: string): string {
  const base = import.meta.env.PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  return `${base}${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore parse errors, use statusText
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  listLoans: () => request<LoanSummary[]>("/loans"),
  getLoan: (id: string) => request<LoanDetail>(`/loans/${id}`),
  createLoan: (payload: LoanCreatePayload) =>
    request<LoanDetail>("/loans", { method: "POST", body: JSON.stringify(payload) }),
  amortize: (id: string, installmentNumber: number, amount: number) =>
    request<LoanDetail>(`/loans/${id}/amortizations`, {
      method: "POST",
      body: JSON.stringify({ installment_number: installmentNumber, amount }),
    }),
  deleteLoan: (id: string) => request<void>(`/loans/${id}`, { method: "DELETE" }),
};

export function formatMoney(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPercent(value: string | number): string {
  const n = (typeof value === "string" ? Number(value) : value) * 100;
  return `${n.toLocaleString("es-PE", { maximumFractionDigits: 4 })}%`;
}

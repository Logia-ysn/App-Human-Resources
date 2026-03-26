export type PayrollConfig = {
  // BPJS Kesehatan
  bpjsKesCompanyRate: number;   // default 0.04 (4%)
  bpjsKesEmployeeRate: number;  // default 0.01 (1%)
  bpjsKesCap: number;           // default 12000000 (max salary for BPJS calc)

  // BPJS Ketenagakerjaan
  bpjsTkJhtRate: number;        // JHT: default 0.02 (2% employee)
  bpjsTkJkkRate: number;        // JKK: default 0.0024 (0.24% company)
  bpjsTkJkmRate: number;        // JKM: default 0.003 (0.3% company)
  bpjsTkJpRate: number;         // JP: default 0.01 (1% employee)
  bpjsTkJpCap: number;          // JP max salary: default 10042300

  // PPh 21 brackets (annual)
  pph21Brackets: { limit: number; rate: number }[];
  pph21NonTaxableIncome: number; // PTKP TK/0: default 54000000/year
};

export const defaultPayrollConfig: PayrollConfig = {
  bpjsKesCompanyRate: 0.04,
  bpjsKesEmployeeRate: 0.01,
  bpjsKesCap: 12000000,
  bpjsTkJhtRate: 0.02,
  bpjsTkJkkRate: 0.0024,
  bpjsTkJkmRate: 0.003,
  bpjsTkJpRate: 0.01,
  bpjsTkJpCap: 10042300,
  pph21Brackets: [
    { limit: 60000000, rate: 0.05 },
    { limit: 250000000, rate: 0.15 },
    { limit: 500000000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ],
  pph21NonTaxableIncome: 54000000,
};

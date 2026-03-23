export type CompanySettings = {
  id: string;
  name: string;
  legalName: string;
  npwp: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  umrAmount: number;
  umrRegion: string;
  cutOffDate: number;
  payDate: number;
};

export const companySettings: CompanySettings = {
  id: "company-1",
  name: "Nama Perusahaan Anda",
  legalName: "PT Nama Perusahaan Anda",
  npwp: "00.000.000.0-000.000",
  address: "Jl. Contoh No. 1",
  city: "Jakarta Selatan",
  province: "DKI Jakarta",
  postalCode: "12345",
  phone: "021-0000000",
  email: "info@perusahaan.co.id",
  website: "https://perusahaan.co.id",
  logoUrl: "",
  umrAmount: 5067381,
  umrRegion: "DKI Jakarta",
  cutOffDate: 25,
  payDate: 28,
};

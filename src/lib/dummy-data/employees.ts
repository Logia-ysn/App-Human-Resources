export type Employee = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photoUrl: string | null;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  placeOfBirth: string;
  religion: string;
  maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  dependents: number;
  nik: string;
  npwp: string;
  bpjsKesNumber: string;
  bpjsTkNumber: string;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionName: string;
  managerId: string | null;
  managerName: string | null;
  status: "ACTIVE" | "PROBATION" | "RESIGNED" | "TERMINATED" | "RETIRED";
  type: "PERMANENT" | "CONTRACT" | "PROBATION" | "INTERNSHIP";
  joinDate: string;
  endDate: string | null;
  resignDate: string | null;
  ptkpStatus: string;
  taxMethod: "GROSS" | "GROSS_UP" | "NETT";
  basicSalary: number;
  allowanceTransport: number;
  allowanceMeal: number;
  allowancePosition: number;
  allowanceOther: number;
  isDeleted: boolean;
};

export const employees: Employee[] = [
  {
    id: "emp-1", employeeNumber: "EMP-0001", firstName: "Budi", lastName: "Santoso",
    email: "budi.santoso@company.co.id", phone: "081200000001", photoUrl: null,
    gender: "MALE", dateOfBirth: "1975-03-15", placeOfBirth: "Surabaya",
    religion: "ISLAM", maritalStatus: "MARRIED", dependents: 2,
    nik: "3578010000000001", npwp: "01.000.000.0-000.001",
    bpjsKesNumber: "0001200001", bpjsTkNumber: "TK001",
    bankName: "BCA", bankAccountNo: "1234567001", bankAccountName: "Budi Santoso",
    address: "Jl. Sudirman No. 1", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12190",
    emergencyName: "Wati Santoso", emergencyPhone: "081200000099", emergencyRelation: "Istri",
    departmentId: "dept-1", departmentName: "Board of Directors",
    positionId: "pos-1", positionName: "Direktur Utama",
    managerId: null, managerName: null,
    status: "ACTIVE", type: "PERMANENT", joinDate: "2018-01-02", endDate: null, resignDate: null,
    ptkpStatus: "K2", taxMethod: "GROSS", basicSalary: 75000000,
    allowanceTransport: 2000000, allowanceMeal: 1000000, allowancePosition: 5000000, allowanceOther: 1000000,
    isDeleted: false,
  },
  {
    id: "emp-2", employeeNumber: "EMP-0002", firstName: "Sari", lastName: "Dewi",
    email: "sari.dewi@company.co.id", phone: "081200000002", photoUrl: null,
    gender: "FEMALE", dateOfBirth: "1990-05-15", placeOfBirth: "Jakarta",
    religion: "ISLAM", maritalStatus: "MARRIED", dependents: 1,
    nik: "3171234567890002", npwp: "12.345.678.9-012.002",
    bpjsKesNumber: "0001200002", bpjsTkNumber: "TK002",
    bankName: "Mandiri", bankAccountNo: "1234567002", bankAccountName: "Sari Dewi",
    address: "Jl. Gatot Subroto No. 5", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12930",
    emergencyName: "Hadi Dewi", emergencyPhone: "081200000098", emergencyRelation: "Suami",
    departmentId: "dept-2", departmentName: "Human Resources",
    positionId: "pos-2", positionName: "HR Manager",
    managerId: "emp-1", managerName: "Budi Santoso",
    status: "ACTIVE", type: "PERMANENT", joinDate: "2020-01-02", endDate: null, resignDate: null,
    ptkpStatus: "K1", taxMethod: "GROSS", basicSalary: 18000000,
    allowanceTransport: 1500000, allowanceMeal: 750000, allowancePosition: 3000000, allowanceOther: 500000,
    isDeleted: false,
  },
  {
    id: "emp-3", employeeNumber: "EMP-0003", firstName: "Andi", lastName: "Wijaya",
    email: "andi.wijaya@company.co.id", phone: "081200000003", photoUrl: null,
    gender: "MALE", dateOfBirth: "1988-11-20", placeOfBirth: "Bandung",
    religion: "KRISTEN", maritalStatus: "MARRIED", dependents: 2,
    nik: "3273010000000003", npwp: "01.000.000.0-000.003",
    bpjsKesNumber: "0001200003", bpjsTkNumber: "TK003",
    bankName: "BCA", bankAccountNo: "1234567003", bankAccountName: "Andi Wijaya",
    address: "Jl. Kuningan No. 10", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12950",
    emergencyName: "Linda Wijaya", emergencyPhone: "081200000097", emergencyRelation: "Istri",
    departmentId: "dept-4", departmentName: "Information Technology",
    positionId: "pos-4", positionName: "IT Manager",
    managerId: "emp-1", managerName: "Budi Santoso",
    status: "ACTIVE", type: "PERMANENT", joinDate: "2019-03-15", endDate: null, resignDate: null,
    ptkpStatus: "K2", taxMethod: "GROSS", basicSalary: 22000000,
    allowanceTransport: 1500000, allowanceMeal: 750000, allowancePosition: 3500000, allowanceOther: 500000,
    isDeleted: false,
  },
  {
    id: "emp-4", employeeNumber: "EMP-0004", firstName: "Dewi", lastName: "Lestari",
    email: "dewi.lestari@company.co.id", phone: "081200000004", photoUrl: null,
    gender: "FEMALE", dateOfBirth: "1995-08-22", placeOfBirth: "Yogyakarta",
    religion: "ISLAM", maritalStatus: "SINGLE", dependents: 0,
    nik: "3404010000000004", npwp: "01.000.000.0-000.004",
    bpjsKesNumber: "0001200004", bpjsTkNumber: "TK004",
    bankName: "BNI", bankAccountNo: "1234567004", bankAccountName: "Dewi Lestari",
    address: "Jl. Casablanca No. 8", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12870",
    emergencyName: "Sri Lestari", emergencyPhone: "081200000096", emergencyRelation: "Ibu",
    departmentId: "dept-4", departmentName: "Information Technology",
    positionId: "pos-5", positionName: "Software Developer",
    managerId: "emp-3", managerName: "Andi Wijaya",
    status: "ACTIVE", type: "PERMANENT", joinDate: "2021-06-01", endDate: null, resignDate: null,
    ptkpStatus: "TK0", taxMethod: "GROSS", basicSalary: 12000000,
    allowanceTransport: 750000, allowanceMeal: 500000, allowancePosition: 1500000, allowanceOther: 250000,
    isDeleted: false,
  },
  {
    id: "emp-5", employeeNumber: "EMP-0005", firstName: "Rizky", lastName: "Ramadhan",
    email: "rizky.ramadhan@company.co.id", phone: "081200000005", photoUrl: null,
    gender: "MALE", dateOfBirth: "1997-01-10", placeOfBirth: "Semarang",
    religion: "ISLAM", maritalStatus: "SINGLE", dependents: 0,
    nik: "3374010000000005", npwp: "01.000.000.0-000.005",
    bpjsKesNumber: "0001200005", bpjsTkNumber: "TK005",
    bankName: "BCA", bankAccountNo: "1234567005", bankAccountName: "Rizky Ramadhan",
    address: "Jl. HR Rasuna Said No. 3", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12940",
    emergencyName: "Ahmad Ramadhan", emergencyPhone: "081200000095", emergencyRelation: "Ayah",
    departmentId: "dept-4", departmentName: "Information Technology",
    positionId: "pos-5", positionName: "Software Developer",
    managerId: "emp-3", managerName: "Andi Wijaya",
    status: "RESIGNED", type: "CONTRACT", joinDate: "2023-02-01", endDate: "2026-01-31", resignDate: "2026-01-31",
    ptkpStatus: "TK0", taxMethod: "GROSS", basicSalary: 10000000,
    allowanceTransport: 750000, allowanceMeal: 500000, allowancePosition: 1000000, allowanceOther: 250000,
    isDeleted: false,
  },
  {
    id: "emp-6", employeeNumber: "EMP-0006", firstName: "Fitri", lastName: "Handayani",
    email: "fitri.handayani@company.co.id", phone: "081200000006", photoUrl: null,
    gender: "FEMALE", dateOfBirth: "1993-12-05", placeOfBirth: "Medan",
    religion: "ISLAM", maritalStatus: "MARRIED", dependents: 1,
    nik: "1271010000000006", npwp: "01.000.000.0-000.006",
    bpjsKesNumber: "0001200006", bpjsTkNumber: "TK006",
    bankName: "Mandiri", bankAccountNo: "1234567006", bankAccountName: "Fitri Handayani",
    address: "Jl. Mampang No. 15", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12790",
    emergencyName: "Reza Handayani", emergencyPhone: "081200000094", emergencyRelation: "Suami",
    departmentId: "dept-2", departmentName: "Human Resources",
    positionId: "pos-3", positionName: "HR Staff",
    managerId: "emp-2", managerName: "Sari Dewi",
    status: "ACTIVE", type: "PERMANENT", joinDate: "2022-04-01", endDate: null, resignDate: null,
    ptkpStatus: "K1", taxMethod: "GROSS", basicSalary: 8000000,
    allowanceTransport: 750000, allowanceMeal: 500000, allowancePosition: 1000000, allowanceOther: 250000,
    isDeleted: false,
  },
  {
    id: "emp-7", employeeNumber: "EMP-0007", firstName: "Agus", lastName: "Prabowo",
    email: "agus.prabowo@company.co.id", phone: "081200000007", photoUrl: null,
    gender: "MALE", dateOfBirth: "1996-07-18", placeOfBirth: "Malang",
    religion: "ISLAM", maritalStatus: "SINGLE", dependents: 0,
    nik: "3573010000000007", npwp: "", bpjsKesNumber: "0001200007", bpjsTkNumber: "TK007",
    bankName: "BRI", bankAccountNo: "1234567007", bankAccountName: "Agus Prabowo",
    address: "Jl. Kemang No. 20", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12730",
    emergencyName: "Wahyu Prabowo", emergencyPhone: "081200000093", emergencyRelation: "Ayah",
    departmentId: "dept-4", departmentName: "Information Technology",
    positionId: "pos-6", positionName: "UI/UX Designer",
    managerId: "emp-3", managerName: "Andi Wijaya",
    status: "PROBATION", type: "PROBATION", joinDate: "2026-01-15", endDate: "2026-04-15", resignDate: null,
    ptkpStatus: "TK0", taxMethod: "GROSS", basicSalary: 9000000,
    allowanceTransport: 500000, allowanceMeal: 300000, allowancePosition: 0, allowanceOther: 0,
    isDeleted: false,
  },
  {
    id: "emp-8", employeeNumber: "EMP-0008", firstName: "Rini", lastName: "Susanti",
    email: "rini.susanti@company.co.id", phone: "081200000008", photoUrl: null,
    gender: "FEMALE", dateOfBirth: "1985-09-25", placeOfBirth: "Jakarta",
    religion: "KATOLIK", maritalStatus: "MARRIED", dependents: 3,
    nik: "3171010000000008", npwp: "01.000.000.0-000.008",
    bpjsKesNumber: "0001200008", bpjsTkNumber: "TK008",
    bankName: "BCA", bankAccountNo: "1234567008", bankAccountName: "Rini Susanti",
    address: "Jl. Senopati No. 12", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12110",
    emergencyName: "Tony Susanto", emergencyPhone: "081200000092", emergencyRelation: "Suami",
    departmentId: "dept-3", departmentName: "Finance & Accounting",
    positionId: "pos-7", positionName: "Finance Manager",
    managerId: "emp-1", managerName: "Budi Santoso",
    status: "ACTIVE", type: "PERMANENT", joinDate: "2019-07-01", endDate: null, resignDate: null,
    ptkpStatus: "K3", taxMethod: "GROSS", basicSalary: 20000000,
    allowanceTransport: 1500000, allowanceMeal: 750000, allowancePosition: 3500000, allowanceOther: 500000,
    isDeleted: false,
  },
  {
    id: "emp-9", employeeNumber: "EMP-0009", firstName: "Maya", lastName: "Putri",
    email: "maya.putri@company.co.id", phone: "081200000009", photoUrl: null,
    gender: "FEMALE", dateOfBirth: "1991-04-30", placeOfBirth: "Surabaya",
    religion: "HINDU", maritalStatus: "SINGLE", dependents: 0,
    nik: "3578010000000009", npwp: "01.000.000.0-000.009",
    bpjsKesNumber: "0001200009", bpjsTkNumber: "TK009",
    bankName: "Mandiri", bankAccountNo: "1234567009", bankAccountName: "Maya Putri",
    address: "Jl. Tendean No. 7", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12710",
    emergencyName: "Ketut Putri", emergencyPhone: "081200000091", emergencyRelation: "Ibu",
    departmentId: "dept-5", departmentName: "Marketing",
    positionId: "pos-9", positionName: "Marketing Manager",
    managerId: "emp-1", managerName: "Budi Santoso",
    status: "ACTIVE", type: "PERMANENT", joinDate: "2020-08-15", endDate: null, resignDate: null,
    ptkpStatus: "TK0", taxMethod: "GROSS", basicSalary: 17000000,
    allowanceTransport: 1500000, allowanceMeal: 750000, allowancePosition: 3000000, allowanceOther: 500000,
    isDeleted: false,
  },
  {
    id: "emp-10", employeeNumber: "EMP-0010", firstName: "Deni", lastName: "Pratama",
    email: "deni.pratama@company.co.id", phone: "081200000010", photoUrl: null,
    gender: "MALE", dateOfBirth: "1989-02-14", placeOfBirth: "Bekasi",
    religion: "ISLAM", maritalStatus: "MARRIED", dependents: 2,
    nik: "3275010000000010", npwp: "01.000.000.0-000.010",
    bpjsKesNumber: "0001200010", bpjsTkNumber: "TK010",
    bankName: "BCA", bankAccountNo: "1234567010", bankAccountName: "Deni Pratama",
    address: "Jl. Satrio No. 22", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12940",
    emergencyName: "Siti Pratama", emergencyPhone: "081200000090", emergencyRelation: "Istri",
    departmentId: "dept-7", departmentName: "Sales",
    positionId: "pos-11", positionName: "Sales Manager",
    managerId: "emp-1", managerName: "Budi Santoso",
    status: "ACTIVE", type: "PERMANENT", joinDate: "2019-11-01", endDate: null, resignDate: null,
    ptkpStatus: "K2", taxMethod: "GROSS", basicSalary: 18000000,
    allowanceTransport: 1500000, allowanceMeal: 750000, allowancePosition: 3000000, allowanceOther: 500000,
    isDeleted: false,
  },
  {
    id: "emp-11", employeeNumber: "EMP-0011", firstName: "Fajar", lastName: "Nugroho",
    email: "fajar.nugroho@company.co.id", phone: "081200000011", photoUrl: null,
    gender: "MALE", dateOfBirth: "1998-06-08", placeOfBirth: "Solo",
    religion: "ISLAM", maritalStatus: "SINGLE", dependents: 0,
    nik: "3372010000000011", npwp: "", bpjsKesNumber: "0001200011", bpjsTkNumber: "TK011",
    bankName: "BNI", bankAccountNo: "1234567011", bankAccountName: "Fajar Nugroho",
    address: "Jl. Tebet No. 30", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12810",
    emergencyName: "Heru Nugroho", emergencyPhone: "081200000089", emergencyRelation: "Ayah",
    departmentId: "dept-4", departmentName: "Information Technology",
    positionId: "pos-5", positionName: "Software Developer",
    managerId: "emp-3", managerName: "Andi Wijaya",
    status: "ACTIVE", type: "CONTRACT", joinDate: "2024-06-01", endDate: "2026-05-31", resignDate: null,
    ptkpStatus: "TK0", taxMethod: "GROSS", basicSalary: 9500000,
    allowanceTransport: 750000, allowanceMeal: 500000, allowancePosition: 1000000, allowanceOther: 250000,
    isDeleted: false,
  },
  {
    id: "emp-12", employeeNumber: "EMP-0012", firstName: "Nadia", lastName: "Kartika",
    email: "nadia.kartika@company.co.id", phone: "081200000012", photoUrl: null,
    gender: "FEMALE", dateOfBirth: "1994-10-17", placeOfBirth: "Denpasar",
    religion: "HINDU", maritalStatus: "MARRIED", dependents: 0,
    nik: "5171010000000012", npwp: "01.000.000.0-000.012",
    bpjsKesNumber: "0001200012", bpjsTkNumber: "TK012",
    bankName: "Mandiri", bankAccountNo: "1234567012", bankAccountName: "Nadia Kartika",
    address: "Jl. Pancoran No. 9", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12780",
    emergencyName: "Made Kartika", emergencyPhone: "081200000088", emergencyRelation: "Suami",
    departmentId: "dept-3", departmentName: "Finance & Accounting",
    positionId: "pos-8", positionName: "Accountant",
    managerId: "emp-8", managerName: "Rini Susanti",
    status: "ACTIVE", type: "PERMANENT", joinDate: "2022-09-01", endDate: null, resignDate: null,
    ptkpStatus: "K0", taxMethod: "GROSS", basicSalary: 8500000,
    allowanceTransport: 750000, allowanceMeal: 500000, allowancePosition: 1000000, allowanceOther: 250000,
    isDeleted: false,
  },
  {
    id: "emp-13", employeeNumber: "EMP-0013", firstName: "Hendra", lastName: "Saputra",
    email: "hendra.saputra@company.co.id", phone: "081200000013", photoUrl: null,
    gender: "MALE", dateOfBirth: "1992-05-03", placeOfBirth: "Palembang",
    religion: "ISLAM", maritalStatus: "MARRIED", dependents: 1,
    nik: "1671010000000013", npwp: "01.000.000.0-000.013",
    bpjsKesNumber: "0001200013", bpjsTkNumber: "TK013",
    bankName: "BRI", bankAccountNo: "1234567013", bankAccountName: "Hendra Saputra",
    address: "Jl. Warung Buncit No. 14", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12740",
    emergencyName: "Ratna Saputra", emergencyPhone: "081200000087", emergencyRelation: "Istri",
    departmentId: "dept-7", departmentName: "Sales",
    positionId: "pos-12", positionName: "Sales Executive",
    managerId: "emp-10", managerName: "Deni Pratama",
    status: "ACTIVE", type: "PERMANENT", joinDate: "2021-03-15", endDate: null, resignDate: null,
    ptkpStatus: "K1", taxMethod: "GROSS", basicSalary: 8000000,
    allowanceTransport: 750000, allowanceMeal: 500000, allowancePosition: 1000000, allowanceOther: 250000,
    isDeleted: false,
  },
  {
    id: "emp-14", employeeNumber: "EMP-0014", firstName: "Putri", lastName: "Rahayu",
    email: "putri.rahayu@company.co.id", phone: "081200000014", photoUrl: null,
    gender: "FEMALE", dateOfBirth: "2000-03-21", placeOfBirth: "Makassar",
    religion: "ISLAM", maritalStatus: "SINGLE", dependents: 0,
    nik: "7371010000000014", npwp: "", bpjsKesNumber: "0001200014", bpjsTkNumber: "TK014",
    bankName: "BCA", bankAccountNo: "1234567014", bankAccountName: "Putri Rahayu",
    address: "Jl. Bangka No. 6", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12720",
    emergencyName: "Aisyah Rahayu", emergencyPhone: "081200000086", emergencyRelation: "Ibu",
    departmentId: "dept-5", departmentName: "Marketing",
    positionId: "pos-10", positionName: "Marketing Staff",
    managerId: "emp-9", managerName: "Maya Putri",
    status: "ACTIVE", type: "INTERNSHIP", joinDate: "2025-12-01", endDate: "2026-05-31", resignDate: null,
    ptkpStatus: "TK0", taxMethod: "GROSS", basicSalary: 4000000,
    allowanceTransport: 500000, allowanceMeal: 300000, allowancePosition: 0, allowanceOther: 0,
    isDeleted: false,
  },
  {
    id: "emp-15", employeeNumber: "EMP-0015", firstName: "Wahyu", lastName: "Hidayat",
    email: "wahyu.hidayat@company.co.id", phone: "081200000015", photoUrl: null,
    gender: "MALE", dateOfBirth: "1987-12-01", placeOfBirth: "Tangerang",
    religion: "ISLAM", maritalStatus: "DIVORCED", dependents: 1,
    nik: "3603010000000015", npwp: "01.000.000.0-000.015",
    bpjsKesNumber: "0001200015", bpjsTkNumber: "TK015",
    bankName: "Mandiri", bankAccountNo: "1234567015", bankAccountName: "Wahyu Hidayat",
    address: "Jl. Cilandak No. 18", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12430",
    emergencyName: "Endah Hidayat", emergencyPhone: "081200000085", emergencyRelation: "Ibu",
    departmentId: "dept-6", departmentName: "Operations",
    positionId: "pos-13", positionName: "Operations Supervisor",
    managerId: "emp-1", managerName: "Budi Santoso",
    status: "ACTIVE", type: "PERMANENT", joinDate: "2020-02-01", endDate: null, resignDate: null,
    ptkpStatus: "TK1", taxMethod: "GROSS", basicSalary: 11000000,
    allowanceTransport: 1000000, allowanceMeal: 500000, allowancePosition: 2000000, allowanceOther: 250000,
    isDeleted: false,
  },
];

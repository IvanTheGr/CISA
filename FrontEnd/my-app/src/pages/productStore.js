/* ─── SHARED DATA STORE ─────────────────────────────────────────
   Single source of truth for all product-related pages.
   Import from here so all pages stay in sync.
──────────────────────────────────────────────────────────────── */

export const PRODUCTS = [
  { no: 1,  productName: "Base 24",                 principal: "ACI Products", productId: "B24C",  principalId: "PACI" },
  { no: 2,  productName: "Base 24-eps",              principal: "ACI Products", productId: "B24E",  principalId: "PACI" },
  { no: 3,  productName: "Postillion",               principal: "ACI Products", productId: "BPST",  principalId: "PACI" },
  { no: 4,  productName: "ACI CMM",                  principal: "ACI Products", productId: "CMGT",  principalId: "PACI" },
  { no: 5,  productName: "ACT Universal Banker",     principal: "ACI Products", productId: "MBLB",  principalId: "PACI" },
  { no: 6,  productName: "Payment Manager",          principal: "ACI Products", productId: "PMGR",  principalId: "PACI" },
  { no: 7,  productName: "ACI InterChange",          principal: "ACI Products", productId: "AICG",  principalId: "PACI" },
  { no: 8,  productName: "PRM",                      principal: "ACI Products", productId: "PRMA",  principalId: "PACI" },
  { no: 9,  productName: "ACI Red",                  principal: "ACI Products", productId: "PRMF",  principalId: "PACI" },
  { no: 10, productName: "Case Manager",             principal: "ACI Products", productId: "PRMC",  principalId: "PACI" },
  { no: 11, productName: "Web Access Service",       principal: "ACI Products", productId: "PCMI",  principalId: "PACI" },
  { no: 12, productName: "Asset",                    principal: "ACI Products", productId: "PTEST", principalId: "PACI" },
  { no: 13, productName: "Universal Online Banking", principal: "ACI Products", productId: "PWHM",  principalId: "PACI" },
  { no: 14, productName: "Global Trade Manager",     principal: "ACI Products", productId: "TRMR",  principalId: "PACI" },
  { no: 15, productName: "Money Transfer System",    principal: "ACI Products", productId: "TRPP",  principalId: "PACI" },
  { no: 16, productName: "PayOn",                    principal: "ACI Products", productId: "DIGC",  principalId: "PACI" },
  { no: 17, productName: "UP Framework",             principal: "ACI Products", productId: "UPIP",  principalId: "PACI" },
  { no: 18, productName: "Prognosis - System Performance",       principal: "IR Product", productId: "PRGS", principalId: "PIRL" },
  { no: 19, productName: "Prognosis - Base24 Performance",       principal: "IR Product", productId: "PRGB", principalId: "PIRL" },
  { no: 20, productName: "Prognosis - Unix, Windows monitoring", principal: "IR Product", productId: "PRGU", principalId: "PIRL" },
];

export const CUSTOMERS = [
  { no: 1,  customerName: "Bank Indonesia (BI)",          customerType: "Bank Sentral",               namingConvention: "BIND", headOffice: "Jakarta" },
  { no: 2,  customerName: "Bank Mandiri",                 customerType: "Bank Pemerintah",            namingConvention: "BMRI", headOffice: "Jakarta" },
  { no: 3,  customerName: "Bank Negara Indonesia (BNI)",  customerType: "Bank Pemerintah",            namingConvention: "BBNI", headOffice: "Jakarta" },
  { no: 4,  customerName: "Bank Rakyat Indonesia (BRI)",  customerType: "Bank Pemerintah",            namingConvention: "BBRI", headOffice: "Jakarta" },
  { no: 5,  customerName: "Bank Tabungan Negara (BTN)",   customerType: "Bank Pemerintah",            namingConvention: "BBTN", headOffice: "Jakarta" },
  { no: 6,  customerName: "Bank BRI Agroniaga",           customerType: "Bank Swasta Nasional Devisa", namingConvention: "AGRO", headOffice: "Jakarta" },
  { no: 7,  customerName: "Bank Artha Graha Internasional", customerType: "Bank Swasta Nasional Devisa", namingConvention: "ARTG", headOffice: "Jakarta" },
  { no: 8,  customerName: "Bank Bukopin",                 customerType: "Bank Swasta Nasional Devisa", namingConvention: "BBUK", headOffice: "Jakarta" },
  { no: 9,  customerName: "Bank Bumi Arta",               customerType: "Bank Swasta Nasional Devisa", namingConvention: "BBAI", headOffice: "Jakarta" },
  { no: 10, customerName: "Bank Capital Indonesia",       customerType: "Bank Swasta Nasional Devisa", namingConvention: "BCIA", headOffice: "Jakarta" },
  { no: 11, customerName: "Bank Central Asia (BCA)",      customerType: "Bank Swasta Nasional Devisa", namingConvention: "BBCA", headOffice: "Jakarta" },
  { no: 12, customerName: "Bank CIMB Niaga",              customerType: "Bank Swasta Nasional Devisa", namingConvention: "BNIA", headOffice: "Jakarta" },
  { no: 13, customerName: "Bank Danamon Indonesia",       customerType: "Bank Swasta Nasional Devisa", namingConvention: "BDIN", headOffice: "Jakarta" },
  { no: 15, customerName: "Bank Ganesha",                 customerType: "Bank Swasta Nasional Devisa", namingConvention: "GNES", headOffice: "Jakarta" },
  { no: 16, customerName: "Bank KEB Hana",                customerType: "Bank Swasta Nasional Devisa", namingConvention: "HNBN", headOffice: "Jakarta" },
  { no: 17, customerName: "Bank Woori Saudara",           customerType: "Bank Swasta Nasional Devisa", namingConvention: "HVBK", headOffice: "Jakarta" },
  { no: 18, customerName: "Bank ICBC Indonesia",          customerType: "Bank Swasta Nasional Devisa", namingConvention: "ICBK", headOffice: "Jakarta" },
  { no: 19, customerName: "Bank Index Selindo",           customerType: "Bank Swasta Nasional Devisa", namingConvention: "BIDX", headOffice: "Jakarta" },
  { no: 20, customerName: "Bank Maybank Indonesia",       customerType: "Bank Swasta Nasional Devisa", namingConvention: "IBBK", headOffice: "Jakarta" },
];

/* Initial sub-products linked to parent products */
export const INITIAL_SUB_PRODUCTS = [
  { id: "SP001", no: 1, parentProductId: "B24C", parentProductName: "Base 24",      principal: "ACI Products", subProductName: "Base 24 Core Engine",    subProductCode: "B24C-CORE", moduleId: "MOD-01", materialType: "Software" },
  { id: "SP002", no: 2, parentProductId: "B24C", parentProductName: "Base 24",      principal: "ACI Products", subProductName: "Base 24 ATM Module",      subProductCode: "B24C-ATM",  moduleId: "MOD-02", materialType: "Software" },
  { id: "SP003", no: 3, parentProductId: "B24E", parentProductName: "Base 24-eps",  principal: "ACI Products", subProductName: "Base 24-eps Lite",        subProductCode: "B24E-LT",   moduleId: "MOD-03", materialType: "Software" },
  { id: "SP004", no: 4, parentProductId: "PRGS", parentProductName: "Prognosis - System Performance", principal: "IR Product", subProductName: "Prognosis Agent",  subProductCode: "PRGS-AGT",  moduleId: "MOD-04", materialType: "Software" },
  { id: "SP005", no: 5, parentProductId: "PRGS", parentProductName: "Prognosis - System Performance", principal: "IR Product", subProductName: "Prognosis Dashboard", subProductCode: "PRGS-DSH", moduleId: "MOD-05", materialType: "Software" },
  { id: "SP006", no: 6, parentProductId: "PRGB", parentProductName: "Prognosis - Base24 Performance", principal: "IR Product", subProductName: "Base24 Monitor",  subProductCode: "PRGB-MON",  moduleId: "MOD-06", materialType: "Software" },
];

/* Initial customer-product assignments */
export const INITIAL_CUSTOMER_PRODUCTS = [
  { id: "CP001", no: 1, customerId: "BIND", customerName: "Bank Indonesia (BI)",         customerType: "Bank Sentral",    productIds: ["B24C", "B24E", "PRGS"], serviceType: "JSL", projectNo: "PRJ-2026-001", purchaseDate: "2026-01-10", startDate: "2026-01-10", endDate: "2026-12-31", l1pic: "Redi",  l2pic: "Regar", sales: "John Doe",    dcDrc: "Jakarta DC", spkNumber: "SPK-2026-001", poNumber: "PO-2026-001", pmInclude: true,  pmSchedule: "Every 3 months", status: "Active"   },
  { id: "CP002", no: 2, customerId: "BMRI", customerName: "Bank Mandiri",                customerType: "Bank Pemerintah", productIds: ["PMGR", "PRGB"],          serviceType: "ALF", projectNo: "PRJ-2026-002", purchaseDate: "2026-02-01", startDate: "2026-02-01", endDate: "2026-12-31", l1pic: "Budi",  l2pic: "Sari",  sales: "Jane Smith",  dcDrc: "Jakarta DC", spkNumber: "SPK-2026-002", poNumber: "PO-2026-002", pmInclude: false, pmSchedule: "—",             status: "Active"   },
  { id: "CP003", no: 3, customerId: "BBCA", customerName: "Bank Central Asia (BCA)",     customerType: "Bank Swasta Nasional Devisa", productIds: ["B24C", "CMGT"], serviceType: "JSL", projectNo: "PRJ-2026-003", purchaseDate: "2026-01-15", startDate: "2026-01-15", endDate: "2026-12-31", l1pic: "Rian",  l2pic: "Asep",  sales: "Mike Johnson", dcDrc: "BSD DC",    spkNumber: "SPK-2026-003", poNumber: "PO-2026-003", pmInclude: true,  pmSchedule: "Every 6 months", status: "Active"   },
  { id: "CP004", no: 4, customerId: "BBNI", customerName: "Bank Negara Indonesia (BNI)", customerType: "Bank Pemerintah", productIds: ["MBLB"],                  serviceType: "SLA", projectNo: "PRJ-2026-004", purchaseDate: "2026-03-01", startDate: "2026-03-01", endDate: "2026-12-31", l1pic: "Dewi",  l2pic: "Hendra", sales: "Dedy Hart",   dcDrc: "Bandung DC", spkNumber: "SPK-2026-004", poNumber: "PO-2026-004", pmInclude: false, pmSchedule: "—",             status: "Inactive" },
];

/* helpers */
export const getProductById   = (id)   => PRODUCTS.find(p => p.productId === id);
export const getCustomerById  = (id)   => CUSTOMERS.find(c => c.namingConvention === id);
export const delay            = (ms)   => new Promise(r => setTimeout(r, ms));

export const users = [
  { id: "U1001", email: "mina.cheng@gmail.com", kyc: "Verified", balance: 18423, joined: Date.now() - 86400000 * 120, status: "Active" },
  { id: "U1002", email: "leo.martin@proton.me", kyc: "Verified", balance: 9580, joined: Date.now() - 86400000 * 90, status: "Active" },
  { id: "U1003", email: "sara.k@outlook.com", kyc: "Pending", balance: 120, joined: Date.now() - 86400000 * 3, status: "Active" },
  { id: "U1004", email: "dev.ops@tribe.io", kyc: "Verified", balance: 64012, joined: Date.now() - 86400000 * 210, status: "Active" },
  { id: "U1005", email: "anon455@mail.com", kyc: "Rejected", balance: 0, joined: Date.now() - 86400000 * 45, status: "Suspended" },
  { id: "U1006", email: "priya.n@company.com", kyc: "Verified", balance: 30250, joined: Date.now() - 86400000 * 300, status: "Active" },
];

export const deposits = [
  { id: "D9001", user: "U1001", asset: "BTC", amount: "0.2500", usd: 16855, time: Date.now() - 86400000 * 2, status: "Confirmed" },
  { id: "D9002", user: "U1004", asset: "ETH", amount: "6.0000", usd: 20893, time: Date.now() - 86400000 * 1, status: "Confirmed" },
  { id: "D9003", user: "U1003", asset: "USDT", amount: "500.00", usd: 500, time: Date.now() - 3600000 * 5, status: "Pending" },
  { id: "D9004", user: "U1006", asset: "SOL", amount: "150.000", usd: 26760, time: Date.now() - 3600000 * 2, status: "Confirmed" },
  { id: "D9005", user: "U1002", asset: "XRP", amount: "3000.00", usd: 1838, time: Date.now() - 3600000 * 1, status: "Failed" },
  { id: "D9006", user: "U1001", asset: "USDT", amount: "12000.00", usd: 12000, time: Date.now() - 1800000, status: "Pending" },
];

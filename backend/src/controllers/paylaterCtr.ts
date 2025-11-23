import mock_store from "../../data/mock_store";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { addDays } from "../utils/date";

// 1. Get users
const getUsers = (req: Request, res: Response) => {
  res.json(Object.values(mock_store.users));
};

// 2. Get carts of a user
const getCarts = (req: Request, res: Response) => {
  const { user_id } = req.params;
  if (!user_id) {
    return res.status(400).json({ error: "Thiếu user_id" });
  }
  const carts = Object.values(mock_store.carts).filter(c => c.user_id === user_id);
  res.json(carts);
};


// 3. Check eligibility
const checkEligibility = (req: Request, res: Response) => {
  const { user_id, cart_id } = req.query as { user_id?: string; cart_id?: string };
  if (!user_id || !cart_id) {
    return res.status(400).json({ eligible: false, reason: "Thiếu user_id hoặc cart_id" });
  }
  const user = mock_store.users[user_id];
  const cart = mock_store.carts[cart_id];

  if (!user || !cart)
    return res.json({ eligible: false, reason: "User hoặc cart không tồn tại" });
  if (!user.verified)
    return res.json({ eligible: false, reason: "User chưa xác thực" });
  if (user.prior_successful_txns < 1)
    return res.json({ eligible: false, reason: "Chưa có giao dịch thành công" });
  if (!user.has_payment_method)
    return res.json({ eligible: false, reason: "Chưa có phương thức thanh toán liên kết" });
  if (cart.total_amount < cart.eligible_threshold)
    return res.json({ eligible: false, reason: "Giỏ hàng dưới threshold" });
  res.json({ eligible: true });
};


// 4. Create PayLater agreement
const createAgreement = (req: Request, res: Response) => {
   console.log("Request body:", req.body);
  const { user_id, cart_id } = req.body as { user_id?: string; cart_id?: string };

  if (!user_id || !cart_id) {
    return res.status(400).json({ error: "Thiếu user_id hoặc cart_id" });
  }

  const user = mock_store.users[user_id];
  const cart = mock_store.carts[cart_id];

  if (!user || !cart)
    return res.status(404).json({ error: "User hoặc Cart không tồn tại" });

  const agreement_id = uuid();
  const now = new Date();
  const amountPer = +(cart.total_amount / 3).toFixed(2);

  const schedule = [
    { instalment_number: 1, due_date: now.toISOString(), amount: amountPer, status: "PAID" },
    { instalment_number: 2, due_date: addDays(now, 30).toISOString(), amount: amountPer, status: "UPCOMING" },
    { instalment_number: 3, due_date: addDays(now, 60).toISOString(), amount: amountPer, status: "UPCOMING" },
  ];

  const agreement = {
    agreement_id,
    user_id,
    cart_id,
    total_amount: cart.total_amount,
    currency: cart.currency,
    schedule,
    status: "ACTIVE",
    created_at: now.toISOString(),
  };

  mock_store.agreements[agreement_id] = agreement;

  // Log events
  mock_store.logs.push({ agreement_id, timestamp: now.toISOString(), action: "agreement_created" });
  mock_store.logs.push({ agreement_id, timestamp: now.toISOString(), action: "charge_attempted", detail: "instalment 1" });
  mock_store.logs.push({ agreement_id, timestamp: now.toISOString(), action: "charge_succeeded", detail: "instalment 1" });

  res.status(201).json(agreement);
};

// 5. Get Agreement
const getAgreement = (req: Request, res: Response) => {
  const { agreementId } = req.params;
  if (!agreementId) {
    return res.status(400).json({ error: "Thiếu agreementId" });
  }
  const agreement = mock_store.agreements[agreementId];
  if (!agreement) return res.status(404).json({ error: "Agreement không tồn tại" });
  res.json(agreement);
};

// 6. Update Instalment Status
const updateInstalment = (req: Request, res: Response) => {
  const { agreementId, idx } = req.params;
  const { status } = req.body as { status?: string };
  if (!agreementId || !idx) {
    return res.status(400).json({ error: "Thiếu agreementId hoặc idx" });
  }
  const agreement = mock_store.agreements[agreementId];
  if (!agreement) return res.status(404).json({ error: "Agreement không tồn tại" });

  const instalmentIndex = parseInt(idx, 10) - 1;
  const inst = agreement.schedule?.[instalmentIndex];
  if (!inst) return res.status(400).json({ error: "Kỳ trả góp không tồn tại" });

  inst.status = status || inst.status;
  mock_store.logs.push({
    agreement_id: agreementId,
    timestamp: new Date().toISOString(),
    action: "instalment_updated",
    detail: `Instalment ${idx} => ${status}`,
  });

  res.json(agreement);
};

// 7. Retry Instalment
const retryInstalment = (req: Request, res: Response) => {
  const { agreementId } = req.params;
  const { instalmentNumber } = req.body as { instalmentNumber?: number };
  if (!agreementId || !instalmentNumber) {
    return res.status(400).json({ error: "Thiếu agreementId hoặc instalmentNumber" });
  }
  const agreement = mock_store.agreements[agreementId];
  if (!agreement) return res.status(404).json({ error: "Agreement không tồn tại" });
  const idx = instalmentNumber - 1;
  const inst = agreement.schedule?.[idx];
  if (!inst || inst.status !== "FAILED") return res.status(400).json({ error: "Chỉ retry kỳ FAILED" });
  inst.status = "PAID";
  mock_store.logs.push({
    agreement_id: agreementId,
    timestamp: new Date().toISOString(),
    action: "retry",
    detail: `Retry instalment ${instalmentNumber} => PAID`,
  });
  res.json(agreement);
};

// 8. Simulate Instalment Failure
const failInstalment = (req: Request, res: Response) => {
  const { agreementId } = req.params;
  const { instalmentNumber } = req.body as { instalmentNumber?: number };
  if (!agreementId || !instalmentNumber) {
    return res.status(400).json({ error: "Thiếu agreementId hoặc instalmentNumber" });
  }
  const agreement = mock_store.agreements[agreementId];
  if (!agreement) return res.status(404).json({ error: "Agreement không tồn tại" });
  const idx = instalmentNumber - 1;
  const inst = agreement.schedule?.[idx];
  if (!inst) return res.status(400).json({ error: "Kỳ trả góp không tồn tại" });
  inst.status = "FAILED";
  mock_store.logs.push({
    agreement_id: agreementId,
    timestamp: new Date().toISOString(),
    action: "charge_failed",
    detail: `Fail instalment ${instalmentNumber}`,
  });
  res.json(agreement);
};

// 9. Get activity log
const getActivityLog = (req: Request, res: Response) => {
  const { agreementId } = req.query as { agreementId?: string };
  if (agreementId) {
    const logs = mock_store.logs.filter(a => a.agreement_id === agreementId);
    return res.json(logs);
  }
  res.json(mock_store.logs);
};

// 10. Get all scenarios
const getAllScenarios = (req: Request, res: Response) => {
  res.json(mock_store.scenarios);
};

// 11. Select scenario
const selectScenario = (req: Request, res: Response) => {
  const { scenarioId } = req.body as { scenarioId?: string };
  if (!scenarioId) {
    return res.status(400).json({ error: "Thiếu scenarioId" });
  }
  const sc = mock_store.scenarios.find(s => s.scenario_id === scenarioId);
  if (!sc) return res.status(404).json({ error: "Scenario not found" });
  mock_store.activeScenario = sc;
  return res.json({ message: "Scenario selected", activeScenario: sc });
};

// 12. Reset seed
const resetSeed = (req: Request, res: Response) => {
  mock_store.reset();
  return res.json({ message: "Seeded/reset hoàn tất." });
};

export default {
  getUsers,
  getCarts,
  checkEligibility,
  createAgreement,
  getAgreement,
  updateInstalment,
  retryInstalment,
  failInstalment,
  getActivityLog,
  getAllScenarios,
  selectScenario,
  resetSeed,
};

import mock_store from "../../data/mock_store";
import { v4 as uuid } from "uuid";
import { addDays } from "../utils/date";

/**
 * Tạo agreement mới đúng chuẩn:
 * - Kỳ đầu tiên (t0) status: PAID (đã charge thành công, như BTC dataset)
 * - 2 kỳ tiếp theo: UPCOMING
 * - Chia đều amount
 * - Currency, lịch dùng đúng mock data
 */
export function createAgreement(userId: string, cartId: string) {
  const user = mock_store.users[userId];
  const cart = mock_store.carts[cartId];
  if (!user || !cart) return null;

  const now = new Date();
  const agreement_id = uuid();
  const amountPer = +(cart.total_amount / 3).toFixed(2);

  // Đúng template của BTC: lịch là [t0, t0+30d, t0+60d]
  const schedule = [
    { instalment_number: 1, due_date: now.toISOString(), amount: amountPer, status: "PAID" },
    { instalment_number: 2, due_date: addDays(now, 30).toISOString(), amount: amountPer, status: "UPCOMING" },
    { instalment_number: 3, due_date: addDays(now, 60).toISOString(), amount: amountPer, status: "UPCOMING" },
  ];

  const agreement = {
    agreement_id,
    user_id: userId,
    cart_id: cartId,
    total_amount: cart.total_amount,
    currency: cart.currency,
    schedule,
    status: "ACTIVE",
    created_at: now.toISOString(),
  };

  mock_store.agreements[agreement_id] = agreement;
  return agreement;
}


export function getAgreement(agreementId: string) {
  return mock_store.agreements[agreementId];
}

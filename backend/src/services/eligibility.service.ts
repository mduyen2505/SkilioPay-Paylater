
import mock_store from "../../data/mock_store";

/**
 * Kiểm tra đúng logic đủ điều kiện PayLater cho user+cart
 * - User phải: verified, prior_successful_txns >= 1, has_payment_method
 * - Cart đủ threshold (>=30.0 USD, dựa vào eligible_threshold trong data)
 * Trả về kết quả JSON như BTC test dataset yêu cầu.
 */
export function checkEligibility(userId: string, cartId: string) {
  const user = mock_store.users[userId];
  const cart = mock_store.carts[cartId];
  if (!user || !cart)
    return { eligible: false, reason: "User or cart does not exist." };

  if (!user.verified)
    return { eligible: false, reason: "User is not verified." };

  if (user.prior_successful_txns < 1)
    return { eligible: false, reason: "No prior successful transactions found." };

  if (!user.has_payment_method)
    return { eligible: false, reason: "No payment method linked." };

  if (cart.total_amount < cart.eligible_threshold)
    return { eligible: false, reason: "Cart total is below eligibility threshold." };

  return { eligible: true };
}

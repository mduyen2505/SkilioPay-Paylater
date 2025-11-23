
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
    return { eligible: false, reason: "User hoặc cart không tồn tại" };

  if (!user.verified)
    return { eligible: false, reason: "User chưa xác thực" };

  if (user.prior_successful_txns < 1)
    return { eligible: false, reason: "Chưa có giao dịch thành công" };

  if (!user.has_payment_method)
    return { eligible: false, reason: "Chưa có phương thức thanh toán liên kết" };

  if (cart.total_amount < cart.eligible_threshold)
    return { eligible: false, reason: "Giỏ hàng dưới threshold" };

  return { eligible: true };
}

import mock_store from "../../data/mock_store";

/**
 * Log một hành động vào store.logs (dùng cho tracking, test scenario, DEV log).
 * Nhất quán với dataset BTC.
 */
export function logAction(entry: {
  agreement_id: string,
  timestamp: string,
  action: string,
  detail?: string
}) {
  mock_store.logs.push(entry);
}

/**
 * Lọc và trả ra log liên quan tới một agreement hoặc toàn bộ log mock data.
 */
export function getActivityLog(agreementId?: string) {
  if (agreementId) {
    return mock_store.logs.filter(a => a.agreement_id === agreementId);
  }
  return mock_store.logs;
}

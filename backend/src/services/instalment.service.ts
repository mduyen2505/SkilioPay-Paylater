import mock_store from "../../data/mock_store";

/**
 * Cập nhật trạng thái của một kỳ trả góp (PAID/FAILED/UPCOMING).
 * Đảm bảo truy cập an toàn với optional chaining và kiểm tra!
 */
export function updateInstalmentStatus(
  agreementId: string,
  instalmentIdx: number,
  status: string
) {
  const agreement = mock_store.agreements[agreementId];
  if (!agreement) return null;

  const instalment = agreement.schedule?.[instalmentIdx];
  if (!instalment) return null;

  instalment.status = status;
  return agreement;
}

/**
 * Retry kỳ trả góp FAILED - chỉ cho phép nếu trạng thái hiện là FAILED (BTC test flow)
 */
export function retryInstalment(
  agreementId: string,
  instalmentNumber: number
) {
  const agreement = mock_store.agreements[agreementId];
  if (!agreement) return null;

  const idx = instalmentNumber - 1;
  const inst = agreement.schedule?.[idx];
  if (!inst || inst.status !== "FAILED") return null;

  inst.status = "PAID";
  return agreement;
}

/**
 * Simulate kỳ trả góp bị FAIL
 */
export function failInstalment(
  agreementId: string,
  instalmentNumber: number
) {
  const agreement = mock_store.agreements[agreementId];
  if (!agreement) return null;

  const idx = instalmentNumber - 1;
  const inst = agreement.schedule?.[idx];
  if (!inst) return null;

  inst.status = "FAILED";
  return agreement;
}

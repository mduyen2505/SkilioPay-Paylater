import mock_store from "../../data/mock_store";

/**
 * Lấy tất cả scenario test, trả về đúng dữ liệu từ fixtures BTC cung cấp.
 */
export function getAllScenarios() {
  return mock_store.scenarios;
}

/**
 * Chọn scenario active (lưu vào store.activeScenario để DEV/QA dashboard sử dụng, đúng như demo test BTC).
 */
export function selectScenario(scenarioId: string) {
  const sc = mock_store.scenarios.find(s => s.scenario_id === scenarioId);
  if (!sc) return null;
  mock_store.activeScenario = sc;
  return sc;
}

/**
 * Reset lại toàn bộ seed test data - dùng khi muốn trở về dữ liệu clean cho dev/test tiếp (BTC cũng hướng dẫn reset)
 */
export function resetSeed() {
  if (typeof mock_store.reset === "function") {
    mock_store.reset();
  }
}

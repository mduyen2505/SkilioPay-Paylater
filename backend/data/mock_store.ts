import fs from "fs";
import path from "path";

type User = {
  user_id: string;
  name: string;
  verified: boolean;
  prior_successful_txns: number;
  has_payment_method: boolean;
  default_pm_last4?: string | null;
  timezone: string;
  locale: string;
};

type Cart = {
  cart_id: string;
  user_id: string;
  total_amount: number;
  currency: string;
  eligible_threshold: number;
  item_count: number;
  notes?: string;
  
};

type Scenario = {
  scenario_id: string;
  user_id: string;
  cart_id: string;
  instalment1_outcome: string;
  instalment2_outcome: string;
  instalment3_outcome: string;
  description?: string;
};

type Agreement = {
  agreement_id: string;
  user_id: string;
  cart_id: string;
  total_amount: number;
  currency: string;
  schedule: {
    instalment_number: number;
    due_date: string;
    amount: number;
    status: string; // 'PAID' | 'UPCOMING' | 'FAILED' | 'DUE'
  }[];
  status: string; // 'ACTIVE', etc.
  created_at: string;
};

type ActivityLogEntry = {
  agreement_id: string;
  timestamp: string;
  action: string;
  detail?: string;
};

type Meta = {
  generated_on_utc: string;
  currency: string;
  eligible_threshold: number;
  outcome_legend: Record<string, string>;
  schedule_template: string[];
};

// Load data from paylater_seed_fixtures.json (BTC test data)
function loadSeedData() {
  // Khuyến nghị: đặt file trong /data
  const filePath = path.join(__dirname, "../data/paylater_seed_fixtures.json");
  const raw = fs.readFileSync(filePath, "utf8");
  const json = JSON.parse(raw);

  const users: Record<string, User> = {};
for (const u of json.users) {
  users[u.user_id] = u;
}

const carts: Record<string, Cart> = {};
for (const c of json.carts) {
  carts[c.cart_id] = c;
}


  const scenarios = json.scenarios as Scenario[];

  return {
    meta: json.meta as Meta,
    users,
    carts,
    scenarios,
  };
}

// State (in-memory DB for mocking)
let storeState = (() => {
  const { meta, users, carts, scenarios } = loadSeedData();

  return {
    meta,
    users,
    carts,
    scenarios,
    agreements: {} as Record<string, Agreement>,
    logs: [] as ActivityLogEntry[],
    activeScenario: null as Scenario | null
  };
})();

function reset() {
  // Re-load từ file seed, clear agreements/logs/activeScenario
  const { meta, users, carts, scenarios } = loadSeedData();
  storeState = {
    meta,
    users,
    carts,
    scenarios,
    agreements: {},
    logs: [],
    activeScenario: null
  };
}

const mock_store = {
  // --- CẤU TRÚC DỮ LIỆU ---
  get meta() { return storeState.meta; },
  get users() { return storeState.users; },             // { [user_id]: User }
  get carts() { return storeState.carts; },             // { [cart_id]: Cart }
  get scenarios() { return storeState.scenarios; },     // Scenario[]
  get agreements() { return storeState.agreements; },   // { [agreement_id]: Agreement }
  get logs() { return storeState.logs; },               // ActivityLogEntry[]
  get activeScenario() { return storeState.activeScenario; },
  set activeScenario(s) { storeState.activeScenario = s; },

  // --- METHODS ---
  reset,
};

export default mock_store;

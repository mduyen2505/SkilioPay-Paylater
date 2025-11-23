import React, { useEffect, useState } from "react";

type Scenario = {
  scenario_id: string;
  description: string;
};

type LogEntry = {
  timestamp: string;
  action: string;
  detail?: string;
};

export default function DevScenarioDashboard() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const res = await fetch("/dev/scenarios");
      const data = await res.json();
      setScenarios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectScenario = async (scenarioId: string) => {
  try {
    const res = await fetch("/dev/scenario/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId }),
    });
    const data = await res.json();
    setActiveScenario(data?.scenario_id || null);
    // Quan trọng: fetch lại logs
    setTimeout(() => fetchLogs(), 100);
  } catch (err) {
    console.error(err);
  }
};

const resetSeed = async () => {
  try {
    await fetch("/dev/reset", { method: "POST" });
    setActiveScenario(null);
    setLogs([]); // reset logs ngay lập tức, sau đó fetch lại logs mới
    setTimeout(() => fetchLogs(), 100);
  } catch (err) {
    console.error(err);
  }
};


  const fetchLogs = async () => {
    try {
      const res = await fetch("/dev/logs"); // giả sử endpoint trả về logs
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScenarios();
    fetchLogs();
  }, []);

  if (loading) return <div>Loading scenarios...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Dev/Test Scenario Dashboard</h2>

      <div style={{ marginBottom: 16 }}>
        <button onClick={resetSeed} style={{ marginRight: 8 }}>Reset Seed</button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3>Available Scenarios</h3>
        <ul>
          {scenarios.map(s => (
            <li key={s.scenario_id}>
              <span>{s.scenario_id}: {s.description}</span>
              <button
                onClick={() => selectScenario(s.scenario_id)}
                style={{ marginLeft: 8 }}
                disabled={activeScenario === s.scenario_id}
              >
                {activeScenario === s.scenario_id ? "Active" : "Select"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Activity Log</h3>
        <ul>
          {logs.map((log, idx) => (
            <li key={idx}>
              [{log.timestamp}] {log.action} {log.detail ? `- ${log.detail}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


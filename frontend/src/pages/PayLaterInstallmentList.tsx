import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Instalment = {
  instalment_number: number;
  due_date: string;
  amount: number;
  status: "PAID" | "UPCOMING" | "FAILED" | "DUE";
};

type Agreement = {
  agreement_id: string;
  user_id: string;
  cart_id: string;
  total_amount: number;
  currency: string;
  schedule: Instalment[];
  status: string;
  created_at?: string;
};

type ActivityLogEntry = {
  agreement_id: string;
  timestamp: string;
  action: string;
  detail?: string;
};

export default function PayLaterInstallmentList() {
  const { agreementId } = useParams();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgreement();
    // eslint-disable-next-line
  }, [agreementId]);

  async function fetchAgreement() {
    if (!agreementId) return;
    setLoading(true);
    try {
      // fetch agreement + log
      const res = await fetch(`http://localhost:3000/api/paylater/agreement/${agreementId}`);
      const data: Agreement = await res.json();
      setAgreement(data);

      const logRes = await fetch(`http://localhost:3000/api/paylater/activity-log?agreementId=${agreementId}`);
      const logData: ActivityLogEntry[] = await logRes.json();
      setLogs(logData);
    } catch (err) {
      console.error(err);
      setError("Failed to load agreement or logs");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(str: string) {
    const d = new Date(str);
    if (isNaN(d.getTime())) return "--";
    return d.toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" });
  }
  function calcRemaining(schedule: Instalment[]) {
    return schedule.filter(i => i.status !== "PAID").reduce((sum, i) => sum + i.amount, 0);
  }

  const handleFail = async (instalmentNumber: number) => {
    if (!agreement) return;
    try {
      await fetch(`http://localhost:3000/api/paylater/agreement/${agreement.agreement_id}/fail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instalmentNumber }),
      });
      fetchAgreement();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetry = async (instalmentNumber: number) => {
    if (!agreement) return;
    try {
      await fetch(`http://localhost:3000/api/paylater/agreement/${agreement.agreement_id}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instalmentNumber }),
      });
      fetchAgreement();
    } catch (err) {
      console.error(err);
    }
  };

  // Change this to your config if needed
  const lateFee = 2;

  if (loading) return <div style={{ marginTop: 80, textAlign: "center" }}>Loading...</div>;
  if (!agreement) return <div style={{ marginTop: 80, textAlign: "center" }}>No agreement found</div>;

 return (
  <div style={{
    background: "#F6FCFA",
    minHeight: "100vh",
    padding: 32,
    display: "flex",
    justifyContent: "center"
  }}>
    <div style={{
      background: "#fff",
      borderRadius: 22,
      boxShadow: "0 8px 36px #13444E13",
      maxWidth: 420,
      width: "100%",
      margin: "0 auto",
      padding: "28px 0 20px 0"
    }}>
      {/* --- Header mới hiện đại, không còn cart icon --- */}
      <div style={{
        display: "flex", alignItems: "center", borderBottom: "1.5px solid #EFF0F3",
        padding: "0 0 15px 0", margin: "0 25px"
      }}>
        {/* Back to user chọn */}
        <button
          onClick={() => navigate("/paylater/user-picker")}
          style={{
            background: "transparent",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            color: "#38C87B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            marginRight: 15,
            fontSize: 20,
            transition: "color 0.12s"
          }}
        >
          {/* iOS Back icon SVG hiện đại */}
          <svg width="24" height="24" fill="none" stroke="#38C87B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6"></path>
          </svg>
        </button>
        {/* Title */}
        <div style={{
          flex: 1,
          textAlign: "center",
          color: "#13444E",
          fontWeight: 700,
          fontSize: 19,
          letterSpacing: 0.2
        }}>
          PayLater – Plan Detail
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* --- Card Info: Plan ID + meta --- */}
      <div style={{
        margin: "28px 24px 20px 24px",
        padding: "22px 20px",
        background: "#F8FAF9",
        borderRadius: 15,
        boxShadow: "0 2px 14px #38C87B09"
      }}>
        <div style={{
          fontWeight: 700, fontSize: 16, color: "#13444E", marginBottom: 9, display: "flex", alignItems: "center"
        }}>
          PayLater Plan
          <span style={{
            background: "#EAF3EE",
            color: "#38C87B",
            borderRadius: 6,
            padding: "2px 10px",
            fontWeight: 700,
            marginLeft: 12,
            fontSize: 13.5,
            boxShadow: "0 2px 7px #38C87B22", transform: "translateY(-2.5px)"
          }}>
            #{agreement.agreement_id?.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Row label="Transaction Date" value={agreement.created_at ? formatDate(agreement.created_at) : "--"} />
          <Row label="Total Amount" value={`$${agreement.total_amount.toFixed(2)}`} />
          <Row label="Remaining Balance" value={`$${calcRemaining(agreement.schedule).toFixed(2)}`} />
          <Row label="Late Fee" value={<span style={{ color: "#E7A12A", fontWeight: 600 }}>${lateFee ?? "0"}</span>} />
        </div>
      </div>

      {/* Timeline kế hoạch trả góp */}
      <div style={{ margin: "24px 24px 0 24px" }}>
        {agreement.schedule.map((inst, idx) => {
          let circle, color, statusLabel;
          if (inst.status === "PAID") {
            circle = (<span style={{
              width: 20, height: 20, borderRadius: "50%", background: "#38C87B",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13
            }}>✓</span>);
            color = "#38C87B";
            statusLabel = "PAID";
          } else if (inst.status === "FAILED") {
            circle = (<span style={{
              width: 20, height: 20, borderRadius: "50%", background: "#D32F2F",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
            }}>×</span>);
            color = "#D32F2F";
            statusLabel = "FAILED";
          } else {
            circle = (<span style={{
              width: 20, height: 20, borderRadius: "50%", border: "2px solid #E0A612",
              color: "#E0A612", background: "#F8F6EF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13
            }}>{idx + 1}</span>);
            color = "#E0A612";
            statusLabel = inst.status;
          }
          return (
            <div key={inst.instalment_number} style={{ display: "flex", alignItems: "center", marginBottom: 13, minHeight: 55 }}>
              <div style={{ width: 26, minWidth: 26, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                <div style={{ zIndex: 2 }}>{circle}</div>
                {/* Dotted line dưới icon, không che icon */}
                {idx < agreement.schedule.length - 1 && (
                  <div style={{
                    position: "absolute", top: 20, left: "50%",
                    marginLeft: -1, width: 0, height: 33,
                    borderLeft: "2px dotted #EDE8CF", zIndex: 1
                  }} />
                )}
              </div>
              {/* Info card */}
              <div style={{
                flex: 1, marginLeft: 10,
                boxShadow: "0 1.5px 6px #EDE3BF11",
                borderRadius: 10,
                background: "#F8F7F3",
                padding: "9px 15px",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{
                  fontSize: 13.5,
                  color: color,
                  fontWeight: inst.status === "PAID" ? 600 : 700,
                  letterSpacing: 0.1,
                  marginBottom: 1
                }}>
                  {`${inst.instalment_number}/${agreement.schedule.length} : ${formatDate(inst.due_date)}`}
                  <span style={{ textTransform: "uppercase", fontWeight: 700 }}> ({statusLabel})</span>
                </div>
                <div style={{
                  background: "#fff",
                  border: "1px solid #F3F3F3",
                  borderRadius: 7,
                  fontWeight: 700,
                  fontSize: 14.2,
                  color: "#3A4D3D",
                  padding: "7px 12px",
                  marginTop: 4,
                  boxShadow: "0 0.5px 3px #dde8d9",
                  display: "flex",
                  alignItems: "center"
                }}>
                  Amount Due : ${inst.amount.toFixed(2)}
                  {/* Action buttons */}
                  {["UPCOMING", "DUE"].includes(inst.status) && (
                    <button
                      onClick={() => handleFail(inst.instalment_number)}
                      style={{
                        marginLeft: 16, padding: "2px 12px",
                        background: "#D32F2F", color: "#fff",
                        border: "none", borderRadius: 5, fontSize: 13,
                        fontWeight: 600, cursor: "pointer"
                      }}
                    >Fail</button>
                  )}
                  {["FAILED", "DUE"].includes(inst.status) && (
                    <button
                      onClick={() => handleRetry(inst.instalment_number)}
                      style={{
                        marginLeft: 12, padding: "2px 12px",
                        background: "#1976D2", color: "#fff",
                        border: "none", borderRadius: 5, fontSize: 13,
                        fontWeight: 600, cursor: "pointer"
                      }}
                    >Retry</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Log dành cho DEV, tách block riêng đẹp & nền sáng -- dễ nhìn */}
      <div style={{
        padding: "25px 22px 0 22px",
        marginTop: 32
      }}>
        <div style={{
          fontWeight: 700, fontSize: 16, color: "#13444E", marginBottom: 10
        }}>Activity Log</div>
        <div style={{
          background: "#F7FAF8",
          border: "1.5px solid #EAF3EE",
          borderRadius: 12,
          padding: "18px 13px",
          fontSize: 13.5,
          minHeight: 80,
          maxHeight: 220,
          overflowY: "auto",
          color: "#445359",
          boxShadow: "0 2px 13px #38C87B09"
        }}>
          {/* Log lỗi nếu có */}
          {error && <div style={{ color: "#D32F2F", marginBottom: 7 }}>{error}</div>}
          {logs.length > 0 ? (
            logs.map((log, idx) => (
              <div key={idx} style={{
                marginBottom: 6, padding: 0,
                background: idx === logs.length - 1 ? "#eaf3ee" : "none",
                borderRadius: 5
              }}>
                <span style={{ color: "#949C9D", fontWeight: 600, fontSize: 11.5 }}>
                  [{new Date(log.timestamp).toLocaleString()}]
                </span>{" "}
                <span style={{
                  fontWeight: 700,
                  color: "#1A8263",
                }}>{log.action.replace(/_/g, " ")}</span>{" "}
                <span style={{
                  fontWeight: 400,
                  color: "#377AA4"
                }}>{log.detail ? `– ${log.detail}` : ""}</span>
              </div>
            ))
          ) : (
            <div style={{ color: "#c7c9d5" }}>No activity yet.</div>
          )}
        </div>
          <div style={{ marginTop: 30, textAlign: "center" }}>
    <button
      onClick={() => navigate("/")}
      style={{
        background: "#38C87B",
        color: "#fff",
        border: "none",
        borderRadius: 11,
        padding: "11px 42px",
        fontSize: 17,
        fontWeight: 700,
        boxShadow: "0 2px 11px #38C87B19",
        cursor: "pointer",
        letterSpacing: 0.4,
        transition: "background 0.16s"
      }}
      onMouseOver={e => {
        e.currentTarget.style.background = "#196944";
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = "#38C87B";
      }}
    >
      Back to Home
    </button>
  </div>
      </div>
    </div>
  </div>
);

// Component hiển thị 1 dòng info plan
function Row({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      fontSize: 14.5, color: "#353C45", fontWeight: 500, marginBottom: 2
    }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
}
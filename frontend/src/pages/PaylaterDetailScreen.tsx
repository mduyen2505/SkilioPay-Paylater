import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDate } from "../utils/date";
type Cart = {
  cart_id: string;
  total_amount: number;
  eligible_threshold: number;
  item_count: number;
};

type User = {
  user_id: string;
  name: string;
  timezone: string;
  locale: string;
  default_pm_last4?: string;
};

type Instalment = {
  due_date: string;
  amount: number;
};

export default function PaylaterDetailScreen() {
  const { user_id, cart_id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [instalments, setInstalments] = useState<Instalment[]>([]);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string }>({ eligible: false });
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [successPopup, setSuccessPopup] = useState(false);
const [createdAgreementId, setCreatedAgreementId] = useState<string | null>(null);



  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user
        const usersRes = await fetch(`http://localhost:3000/api/paylater/users`);
        const users: User[] = await usersRes.json();
        const foundUser = users.find(u => u.user_id === user_id);
        setUser(foundUser || null);

        // Fetch cart
        const cartsRes = await fetch(`http://localhost:3000/api/paylater/users/${user_id}/carts`);
        const carts: Cart[] = await cartsRes.json();
        const foundCart = carts.find(c => c.cart_id === cart_id);
        setCart(foundCart || null);

        if (foundUser && foundCart) {
          // Check eligibility via API
          const res = await fetch(
            `http://localhost:3000/api/paylater/eligibility?user_id=${user_id}&cart_id=${cart_id}`
          );
          const data = await res.json();
          setEligibility(data);

          // Create 3 instalments (amount and due dates)
          const perInstalment = parseFloat((foundCart.total_amount / 3).toFixed(2));
          const baseDate = new Date();
          const locale = foundUser.locale || "en-US";
          const timezone = foundUser.timezone || "UTC";

          setInstalments([
  { due_date: baseDate.toISOString(), amount: perInstalment },
  { due_date: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), amount: perInstalment },
  { due_date: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(), amount: perInstalment }
]);

        }

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load data");
        setLoading(false);
      }
    }
    fetchData();
  }, [user_id, cart_id]);

 const handleConfirm = async () => {
  if (!cart || !user || !eligibility.eligible) return;
  setIsCreating(true);
  setError("");
  try {
    const res = await fetch(`http://localhost:3000/api/paylater/agreement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.user_id,
        cart_id: cart.cart_id
      }),
    });
    const data = await res.json();
    setCreatedAgreementId(data.agreement_id); // Lưu agreementId trả về
    setSuccessPopup(true); // show popup
    // Không navigate ngay lập tức
  } catch (err) {
    console.error(err);
    setError("Error creating agreement");
  } finally {
    setIsCreating(false);
  }
};



  if (loading || !cart || !user)
  return <div style={{ marginTop: 80, textAlign: "center" }}>Loading...</div>;

return (
  <div style={{
    background: "#F6FCFA",
    minHeight: "100vh",
    padding: 28,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start"
  }}>
    <div
      style={{
        background: "#fff",
        borderRadius: 22,
        maxWidth: 410,
        margin: "0 auto",
        boxShadow: "0 8px 36px #13444E15",
        padding: 0,
        width: "100%"
      }}
    >
      {/* Header with Back button and title */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "0 0 0 14px",
        background: "#FFF",
        borderRadius: "22px 22px 0 0"
      }}>
       <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent",
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            color: "#13444E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 13,
            padding: 0,
            cursor: "pointer"
          }}
          aria-label="Back"
        >
          {/* iOS Back Icon SVG */}
          <svg width="24" height="24" fill="none" stroke="#13444E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ display: "block" }}>
            <path d="M15 18l-6-6 6-6"></path>
          </svg>
        </button>
        <div style={{
          flex: 1,
          textAlign: "center",
          color: "#13444E",
          fontWeight: 700,
          fontSize: 18,
          margin: "18px 16px 12px -40px", // negative left to visually center w/ button
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9
        }}>
          <img src="/project.png" alt="Cart" style={{ width: 22, height: 22, marginRight: 4 }} />
          Paylater Detail
        </div>
        <div style={{ width: 50 }} />
      </div>

      {/* Payment schedule section */}
      <div style={{
  background: "#F6FCFA",
  minHeight: "50vh",
  padding: 28,
  display: "flex",
  justifyContent: "center"
}}>
  <div style={{
    background: "#fff",
    borderRadius: 22,
    maxWidth: 370,
    minWidth: 300,
    margin: "0 auto",
    boxShadow: "0 8px 36px #13444E15",
    padding: 28
  }}>
    <div style={{ fontWeight: 700, fontSize: 15, color: "#2B2D2F", marginBottom: 15 }}>Payment Schedule :</div>
  {instalments.map((item, index) => (
  <div key={index} style={{
    display: "flex",
    alignItems: "flex-start",
    position: "relative",
    minHeight: 70
  }}>
    {/* Circle + line */}
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginRight: 18,
      height: "100%",
      position: "relative"
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: "2.2px solid #38C87B",
        background: "#fff",
        color: "#38C87B",
        fontWeight: 700,
        fontSize: 15,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2
      }}>{String(index + 1).padStart(2, '0')}</div>
      {index < instalments.length - 1 && (
        <div style={{
          position: "absolute",
          top: 32,
          left: "50%",
          marginLeft: -1,
          width: 2,
          height: 38,
          borderLeft: "2px dashed #38C87B99",
          zIndex: 1
        }} />
      )}
    </div>
    {/* Info (Ngày và Số tiền trên cùng dòng) */}
    <div style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 5
    }}>
      <div style={{ fontWeight: 600, fontSize: 15, color: "#1B3C3F" }}>
        {index === 0 ? "Pay Today:" : formatDate(item.due_date)}
      </div>
      <div style={{
        fontWeight: 700,
        color: "#38C87B",
        fontSize: 16,
        minWidth: 70,
        textAlign: "right"
      }}>
        ${item.amount.toFixed(2)}
      </div>
    </div>
  </div>
))}


    {/* Fee and total */}
    <div style={{ marginTop: 13, marginBottom: 3, fontSize: 15 }}>
      <b>Fee = $0 </b>
      <span style={{ color: "#A7A7A7", fontSize: 13, marginLeft: 3, fontWeight: 400 }}>
        Late fee applies for overdue payments.
      </span>
    </div>
    <div style={{ marginTop: 5, fontWeight: 700, fontSize: 16, color: "#1B3C3F" }}>
      Total Payable :
      <span style={{ color: "#38C87B", fontWeight: 800, fontSize: 25, marginLeft: 7 }}>
        ${cart.total_amount}
      </span>
      <span style={{
        color: "#9AC18D",
        fontWeight: 600,
        marginLeft: 5,
        fontSize: 14
      }}>
        ({instalments.length}x${instalments[0].amount.toFixed(2)})
      </span>
    </div>
  </div>
</div>


      {/* Eligibility warning (modern notification card) */}
      {!eligibility.eligible && (
        <div style={{
          background: "linear-gradient(90deg,#F7FDF2 90%,#EDEDED 100%)",
          border: "1px solid #FFC822",
          borderRadius: 12,
          color: "#AD8600",
          fontSize: 15,
          margin: "25px 22px 0 22px",
          padding: "16px 18px 14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 1px 6px #FFC82222"
        }}>
          <span style={{
            fontSize: 20,
            color: "#FFC822"
          }}>⚠️</span>
          <span>
            <b style={{ color: "#AD8600" }}>Not eligible:</b> {eligibility.reason}
          </span>
        </div>
      )}

 {/* Payment Method */}
{user?.default_pm_last4 && (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: "#F6FCFA",
      margin: "16px 16px 0 16px",
      padding: "10px 15px",
      borderRadius: 10,
      boxShadow: "0 1px 6px #13444E11",
      fontSize: 15,
      fontWeight: 400,
      color: "#13444E"
    }}
  >
    <span style={{
      fontSize: 20,
      color: "#7393F5"
    }}>💳</span>
    <span style={{ marginRight: 4 }}>Payment Method: </span>
    <span style={{
      letterSpacing: 1,
      background: "#EDF7F3",
      borderRadius: 6,
      padding: "1px 10px",
      fontWeight: 500,
      color: "#286434",
      fontSize: 15
    }}>
      •••• {user.default_pm_last4}
    </span>
    <span style={{
      color: "#A8AAAE",
      fontWeight: 500,
      marginLeft: 9,
      fontSize: 12
    }}>
      (Default)
    </span>
  </div>
)}

   {/* Today's Payment CTA box */}
<div
  style={{
    background: "#fff",
    padding: "22px 18px",
    borderRadius: 14,
    boxShadow: "0 2px 12px #38C87B1A",
    margin: "32px 16px 0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  }}
>
  <div>
    <div style={{ color: "#52585A", fontWeight: 500, fontSize: 15, marginBottom: 6 }}>
      Today's payment
    </div>
    <div style={{ color: "#38C87B", fontWeight: 700, fontSize: 22, letterSpacing: 0.5 }}>
      ${instalments[0]?.amount?.toFixed(2) ?? "--"}
    </div>
  </div>
  <button
    style={{
      background: eligibility.eligible ? "#38C87B" : "#A6CBA4",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      fontWeight: 700,
      fontSize: 17,
      padding: "10px 38px",
      minWidth: 84,
      height: 44,
      cursor: eligibility.eligible && !isCreating ? "pointer" : "not-allowed",
      boxShadow: eligibility.eligible ? "0 1px 9px #38C87B36" : "none",
      transition: "background 0.13s",
      opacity: eligibility.eligible ? 1 : 0.65
    }}
    onClick={handleConfirm}
    disabled={!eligibility.eligible || isCreating}
  >
    {isCreating ? "Processing..." : "Pay"}
  </button>
</div>

{/* Thông báo lỗi nếu có */}
{error && (
  <div style={{
    color: "#D32F2F",
    background: "rgba(255,232,180,0.17)",
    fontWeight: 600,
    fontSize: 15,
    padding: "10px 13px",
    borderRadius: 10,
    margin: "14px 16px 0 16px",
    textAlign: "center"
  }}>
    {error}
  </div>
)}

{successPopup && (
  <div style={{
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(34,45,54,0.13)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}>
    <div style={{
      background: "#fff",
      borderRadius: 25,
      boxShadow: "0 6px 32px #38C87B44",
      padding: "38px 34px 26px 34px",
      textAlign: "center",
      minWidth: 270,
      maxWidth: "85vw"
    }}>
     <div style={{
  fontSize: 54,
  color: "#38C87B",
  marginBottom: 16,
  display: "flex",
  justifyContent: "center"
}}>
  <img
    src="/payment-status.png" // Đường dẫn tính từ public, ví dụ: public/success.svg
    alt="Success"
    style={{
      width: 74,
      height: 74,
      display: "block"
    }}
  />
</div>
      <div style={{
        fontWeight: 700,
        fontSize: 20,
        color: "#13444E",
        marginBottom: 7,
        letterSpacing: 0.2
      }}>
        Payment successful!
      </div>
      <div style={{
        color: "#6A7D88",
        fontSize: 16,
        marginBottom: 30,
        lineHeight: 1.6
      }}>
        Your payment was processed.<br />
        You can now view your installment details.
      </div>
      <button
        style={{
          background: "#fff",
          color: "#38C87B",
          borderRadius: 10,
          border: "2px solid #38C87B",
          padding: "10px 32px",
          fontWeight: 500,
          fontSize: 17,
          cursor: "pointer",
          boxShadow: "0 1.5px 10px #38C87B10",
          transition: "background 0.15s,color 0.16s,border 0.16s"
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = "#38C87B";
          e.currentTarget.style.color = "#fff";
          e.currentTarget.style.borderColor = "#38C87B";
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.color = "#38C87B";
          e.currentTarget.style.borderColor = "#38C87B";
        }}
        onClick={() => {
          setSuccessPopup(false);
          if (createdAgreementId) {
            navigate(`/paylater/agreement/${createdAgreementId}`);
          }
        }}
      >
        View Paylater Instalment
      </button>
    </div>
  </div>
)}


    </div>
  </div>
);
}
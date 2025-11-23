import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";




type Cart = {
  cart_id: string;
  user_id: string;
  total_amount: number;
  eligible_threshold: number;
  item_count: number;
};

type User = {
  user_id: string;
  name: string;
  timezone: string;
  locale: string;
};

export default function PaymentOptionsScreen() {
  const { user_id, cart_id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [selectedCartIdx, setSelectedCartIdx] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/api/paylater/users`)
      .then(res => res.json())
      .then(users => {
        const foundUser = users.find((u: User) => u.user_id === user_id);
        setUser(foundUser || null);
      })
      .catch(err => console.error(err));
  }, [user_id]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/paylater/users/${user_id}/carts`)
      .then(res => res.json())
      .then(data => {
        setCarts(data);
        if (cart_id) {
          const idx = data.findIndex((c: Cart) => c.cart_id === cart_id);
          setSelectedCartIdx(idx >= 0 ? idx : 0);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user_id, cart_id]);

  if (loading || !user || !carts.length) {
    return <div style={{ color: "#38C87B", textAlign: "center", marginTop: 80 }}>Loading...</div>;
  }

  const cart = carts[selectedCartIdx];
  const canContinue = cart.total_amount >= cart.eligible_threshold;
  const isMobile = window.innerWidth <= 650;

  const handleSelectCart = (idx: number) => {
    setSelectedCartIdx(idx);
  };

const handleContinue = () => {
  navigate(`/user/${user.user_id}/cart/${cart.cart_id}/paylater-detail`);
};


return (
  <div style={{
    background: "linear-gradient(180deg,#F6FCFA 60%,#E8F5F0 100%)",
    minHeight: "100vh",
    padding: isMobile ? "0 0 18px 0" : "38px 0",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start"
  }}>
    <div style={{
      background: "#fff",
      borderRadius: 24,
      boxShadow: "0 6px 40px #13444e1a",
      maxWidth: isMobile ? 375 : 440,
      width: "100%",
      marginTop: isMobile ? 0 : 40,
      padding: isMobile ? "0" : "40px 0"
    }}>
      {/* Header */}
       {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "18px 18px 4px 10px",
        background: "#fff",
        borderRadius: "22px 22px 0 0",
        boxShadow: "0 1.5px 10px #13444e09"
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
          fontSize: 19,
          color: "#13444E",
          fontWeight: 700,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9
        }}>
          <img src="/shopping-cart.png" alt="Cart" style={{ width: 22, height: 22, marginRight: 7, objectFit: "contain" }} />
          Cart
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Multiple carts (if any) */}
{carts.length > 1 && (
  <div style={{ padding: "0 18px 0 18px", marginTop: 13 }}>
    {/* Dòng chỉ dẫn phía trên */}
    <div style={{
      fontSize: 12,
      color: "#92989f",
      marginBottom: 6,
      letterSpacing: 0.1,
      fontWeight: 500,
      textAlign: "left"
    }}>
      Please select the cart you want to pay.
    </div>
    {/* Group các nút chọn cart (không đổi) */}
    <div style={{
      display: "flex",
      gap: 10,
      padding: "10px 0 10px 0",
      background: "#F6FCFA",
      overflowX: "auto",
      borderBottom: "1px solid #EBEBEB"
    }}>
      {carts.map((c, idx) => (
        <button
          key={c.cart_id}
          onClick={() => handleSelectCart(idx)}
          style={{
            padding: "10px 20px",
            borderRadius: 12,
            border: idx === selectedCartIdx ? "2px solid #38C87B" : "1px solid #EBEBEB",
            background: idx === selectedCartIdx ? "#E8F5F0" : "#fff",
            color: idx === selectedCartIdx ? "#38C87B" : "#13444E",
            fontWeight: idx === selectedCartIdx ? 700 : 500,
            fontSize: 14.8,
            cursor: "pointer",
            boxShadow: idx === selectedCartIdx ? "0 0 7px #38C87B13" : "none",
            transition: "box-shadow 0.14s"
          }}
        >
          ${c.total_amount}
        </button>
      ))}
    </div>
  </div>
)}


    {/* Cart summary nổi bật, dễ thấy */}
<div style={{
  background: "#fbfbfbff", // nền trắng tinh khiết!
  borderRadius: 20,
  margin: "24px 16px 12px 16px",
  padding: "22px 18px",
  textAlign: "center",
  border: "1.5px solid #E5E7EA", // viền xám nhạt fintech!
  boxShadow: "0 8px 36px #38c87b19, 0 1.5px 8px #13444e11", // bóng đổ mạnh, cao
  transition: "box-shadow 0.19s"
}}>
 

  <div style={{ fontSize: 15, color: "#62BE76", marginBottom: 11, letterSpacing: 0.17 }}>
    <span role="img" aria-label="money" style={{ fontSize: 18, marginRight: 4 }}>💰</span>
    Total Amount
  </div>
  <div style={{
    fontSize: 32,
    color: "#38C87B",
    fontWeight: 700,
    letterSpacing: 0.3,
    textShadow: "#EEF5F2 0px 1.5px 9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  }}>
    ${cart.total_amount}
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "#F5FCF8",
      borderRadius: 11,
      padding: "5px 13px 5px 7px",
      boxShadow: "0 1.5px 7px #38C87B10"
    }}>
      <img
        src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg"
        alt="US Flag"
        style={{
          width: 20, height: 20, borderRadius: "50%", objectFit: "cover", marginRight: 2
        }}
      />
      <span style={{ fontWeight: 700, fontSize: 15.2, color: "#2A2A2A", marginRight: 0 }}>USD</span>
      <svg width="13" height="13" fill="none" viewBox="0 0 14 14" style={{ marginLeft: 4 }}>
        <path d="M4 5l3 3 3-3" stroke="#B5B6BC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </div>
  <div style={{
    marginTop: 16,
    fontSize: 15.6,
    color: "#13444E",
    fontWeight: 600
  }}>
    {cart.item_count} items
  </div>
  {!canContinue && (
    <div style={{
      marginTop: 12,
      color: "#aadf0bff",
      fontSize: 13,
      fontStyle: "italic"
    }}>
      PayLater available from ${cart.eligible_threshold.toFixed(2)}
    </div>
  )}
</div>


<div style={{ margin: "30px 16px 0 16px", display: "flex", justifyContent: "center" }}>
  <button
    disabled={!canContinue}
    style={{
      background: canContinue ? "#b6e7c9" : "#C2E8C8",     // Mint đậm hơn, rất rõ ràng
    color: canContinue ? "#136646" : "#9DAB9C",        // Chữ xanh lá hoặc xám mint
      border: "none",
      borderRadius: 12,
      width: 144,
      height: 46,
      fontWeight: 700,
      fontSize: 18,
      margin: "0 auto",
      display: "block",
      transition: "background 0.18s, color 0.18s, box-shadow 0.18s",
      cursor: canContinue ? "pointer" : "not-allowed",
      boxShadow: canContinue ? "0 2px 14px #38C87B22" : "none"
    }}
    onMouseOver={e => {
      if (canContinue) {
        e.currentTarget.style.background = "#38C87B";  // Xanh tươi hover
        e.currentTarget.style.color = "#fff";
        e.currentTarget.style.boxShadow = "0 0 0 5px #38C87B2A";
      }
    }}
    onMouseOut={e => {
  if (canContinue) {
    e.currentTarget.style.background = "#b6e7c9"; // Giống màu "bình thường" của enable
    e.currentTarget.style.color = "#136646";      // Hoặc #38C87B, nếu bạn thích nền/xanh lá đậm
    e.currentTarget.style.boxShadow = "0 2px 14px #38C87B22";
  }
}}

            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

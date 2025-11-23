import React, { useState, useEffect } from "react";
import { UserPicker } from "../components/UserPicker";
import { useNavigate } from "react-router-dom";

type User = {
  user_id: string;
  name: string;
  timezone: string;
  locale: string;
};

type Cart = {
  cart_id: string;
  total_amount: number;
  eligible_threshold: number;
};

export default function SelectUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/paylater/users")
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load users: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // NOTE: accept index too (UserPicker now passes (user_id, index))
  const handleSelect = (user_id: string, index: number) => {
    // store selected index so when user navigates back we can restore position
    try {
      localStorage.setItem("selected_user_index", String(index));
    } catch (e) {
      // ignore localStorage failures in private mode, but don't block flow
      console.warn("Could not persist selected index", e);
    }

    fetch(`http://localhost:3000/api/paylater/users/${user_id}/carts`)
      .then(async res => {
        if (!res.ok) throw new Error(`Failed to load carts: ${res.status}`);
        return res.json();
      })
      .then((carts: Cart[]) => {
        if (!carts || carts.length === 0) {
          alert("User has no carts");
          return;
        }
        const firstCart = carts[0];
        const canContinue = firstCart.total_amount >= firstCart.eligible_threshold;

        // Navigate to cart (keeps the same behavior you already had)
        navigate(`/user/${user_id}/cart/${firstCart.cart_id}`, { state: { canContinue } });
      })
      .catch(err => {
        console.error(err);
        alert("Failed to fetch carts. Check server or network.");
      });
  };

  if (loading) {
  return (
    <div style={{ color: "#13444E", textAlign: "center", marginTop: 80 }}>
      Loading users...
    </div>
  );
}

return (
  <div
    style={{
      minHeight: "100vh",
      background: "#1C9085",
      display: "flex",
      flexDirection: "column"
    }}
  >
    {/* HEADER */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 0 14px 0",
        background: "#16766D",
        boxShadow: "0 2px 8px 0 rgba(61,144,133,0.13)",
        position: "sticky",
        top: 0,
        zIndex: 20
      }}
    >
      {/* LOGO LEFT */}
      <div style={{
        width: 100, display: "flex", alignItems: "center", justifyContent: "flex-start"
      }}>
        <img
          src="/SkilioPayLogo.png"
          alt="logo"
          style={{ width: 154, height: 154, marginLeft: 36, objectFit: "contain" }}
        />
      </div>
      {/* TITLE CENTERED */}
      <div
        style={{
          flex: 1,
          textAlign: "center",
          color: "#fff",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 0.7,
          position: "relative",
          left: "-35px" // bù khoảng offset logo trái
        }}
      >
        Select User
      </div>
      {/* Giữ chỗ cho cân đều hai bên */}
      <div style={{ width: 100 }} />
    </div>

    {/* MAIN CONTENT */}
    <div style={{ paddingTop: 28 }}>
      <UserPicker users={users} onSelect={handleSelect} />
    </div>
  </div>
);
}

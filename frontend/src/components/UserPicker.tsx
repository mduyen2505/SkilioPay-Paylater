import React, { useState, useEffect } from "react";

type User = {
  user_id: string;
  name: string;
  timezone: string;
  locale: string;
};

type UserPickerProps = {
  users: User[];
  onSelect: (user_id: string, index: number) => void;
};

const BRAND_COLORS = ["#38C87B", "#62BE76", "#1C9085", "#13444E", "#B7E82A"];
const getAvatarColor = (i: number) => BRAND_COLORS[i % BRAND_COLORS.length];

export const UserPicker: React.FC<UserPickerProps> = ({ users, onSelect }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const savedIndex = localStorage.getItem("selected_user_index");
    if (savedIndex) {
      const idx = Number(savedIndex);
      if (idx >= 0 && idx < users.length) setCurrent(idx);
    }
  }, [users.length]);

  const next = () => setCurrent(c => Math.min(users.length - 1, c + 1));
  const prev = () => setCurrent(c => Math.max(0, c - 1));

  return (
    <div style={{ marginTop: 32 }}>
      {/* Carousel + arrows */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 26,
        }}
      >
        {/* LEFT ARROW */}
        <button
          onClick={prev}
          disabled={current === 0}
          style={arrowStyle(current === 0)}
          aria-label="previous user"
        >‹</button>

        {/* Center card */}
        <UserCard
          user={users[current]}
          idx={current}
          selected
          onSelect={() => onSelect(users[current].user_id, current)}
        />

        {/* RIGHT ARROW */}
        <button
          onClick={next}
          disabled={current === users.length - 1}
          style={arrowStyle(current === users.length - 1)}
          aria-label="next user"
        >›</button>
      </div>

      {/* Indicators */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 22, gap: 10 }}>
        {users.map((_u, i) => (
          <div
            key={i}
            style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "#38C87B",
              opacity: i === current ? 1 : 0.15,
              boxShadow: i === current ? "0 0 5px 1px #38C87B55" : "none",
              transform: i === current ? "scale(1.23)" : "scale(1)",
              transition: "all 0.21s"
            }}
          />
        ))}
      </div>
    </div>
  );
};

const arrowStyle = (disabled: boolean): React.CSSProperties => ({
  background: "#fff",
  border: "none",
  borderRadius: "50%",
  width: 40,
  height: 40,
  cursor: disabled ? "not-allowed" : "pointer",
  boxShadow: disabled ? "none" : "0 2px 10px #1C908511",
  fontSize: 21,
  fontWeight: 700,
  color: disabled ? "#D9DFDF" : "#1C9085",
  outline: "none",
  transition: "box-shadow 0.18s, color 0.18s"
});

// Card UI
function UserCard({
  user,
  idx,
  selected,
  onSelect,
}: {
  user: User;
  idx: number;
  selected: boolean;
  onSelect?: () => void;
}) {
  return (
    <div
      style={{
        width: 260,
        background: "#fff",
        borderRadius: 22,
        padding: "24px 20px",
        boxShadow: selected ? "0 6px 26px #38C87B33" : "0 3px 14px #13444E13",
        border: selected ? "2.3px solid #38C87B" : "1.5px solid #F3F3F3",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "0.22s"
      }}
    >
      {/* Avatar */}
      <div
        style={{
          background: getAvatarColor(idx),
          width: 78,
          height: 78,
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontSize: 29,
          fontWeight: 700,
          marginBottom: 14,
          boxShadow: "0 3px 11px #1C908522",
        }}
      >
        {user.name
          .split(" ")
          .map((x) => x[0])
          .join("")
          .toUpperCase()}
      </div>
      {/* Name */}
      <div style={{ fontWeight: 700, color: "#13444E", fontSize: 19, marginBottom: 4 }}>
        {user.name}
      </div>
      {/* Info phụ */}
      <div style={{
        fontSize: 13.5,
        color: "#5F8882",
        marginBottom: 2,
        fontWeight: 500
      }}>{user.timezone}</div>
      <div style={{
        fontSize: 13.5,
        color: "#96C7A0",
        marginBottom: 15
      }}>{user.locale}</div>
      <button
        onClick={onSelect}
        style={{
          background: "#38C87B",
          color: "#fff",
          width: "100%",
          padding: "10px 0",
          border: "none",
          borderRadius: 10,
          fontSize: 15.5,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 7px #38C87B22",
        }}
      >
        Select
      </button>
    </div>
  );
}

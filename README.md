
```markdown
# SkilioPay PayLater MVP

## 📖 Overview
SkilioPay PayLater MVP is a prototype demonstrating a **Buy Now, Pay Later (BNPL)** payment flow with: eligibility checking, 3-instalment payment schedule, agreement creation and management, retry logic for failed payments, and activity/event logging.

### Tech Stack
- **Frontend:** React (TypeScript)  
- **Backend:** Node.js + Express (TypeScript)  
- **Data:** In-memory mock data (no external database)

## ⚙️ Setup Instructions
### Backend (Node.js + Express + TypeScript)
```bash
cd backend
npm install
npm run dev
# Server runs at http://localhost:3000
```
### Frontend (React + TypeScript)
```bash
cd frontend
npm install
npm start
# App runs at http://localhost:3001
```

**Requirements:** Node.js ≥ 16  
**Database:** None (all flows use in-memory fixtures)

## 🚀 Feature Summary
- **User Picker for Demo:** choose a demo user profile to simulate eligible and ineligible states.  
- **PayLater Option at Checkout:** displayed only when the cart total meets the minimum eligibility threshold.  
- **Eligibility Check:** determined by verified user status, at least one prior successful transaction, and linked payment method. Tooltip explains why a user is not eligible.  
- **3-Instalment Payment Schedule:** shows t0 (immediate), t0+30 days, t0+60 days; amounts and due dates adjust to the user’s timezone.  
- **Agreement Creation & Confirmation:** upon confirmation, a PayLater agreement is created, stored in the mock store, and UI updates instantly.  
- **Payment Schedule Tracking:** instalment statuses include PAID · DUE · UPCOMING · FAILED; first instalment is automatically PAID at checkout.  
- **Failure & Retry Flow:** toggle allows simulating failed payment attempts; FAILED instalments show a Retry button; all attempts and outcomes update the activity log.  
- **Activity Log:** tracks BNPL events (`agreement_created`, `charge_attempted`, `charge_succeeded`, `charge_failed`, `retry`) and displays them in developer view.  
- **Mock Data Store:** in-memory storage for users, carts, scenarios, agreements, and activity logs; data resets upon server restart.

## ⚠️ Known Limitations
- No real payment gateway (all payments are simulated)  
- No PIN/authentication step  
- No reminder notifications for due instalments  
- Demo-oriented UI/UX  
- No persistent storage (everything resets on restart)  
- Limited error handling  
- Limited automated tests  

## 📂 Folder Structure
```
SKILIOPAY-PAYLATER-MVP
│
├── 📁 backend/                    # Node.js + Express (TypeScript)
│   ├── 📁 data/
│   │   ├── mock_store.ts          # In-memory store
│   │   └── paylater_seed_fixtures.json  # Test fixtures
│   │
│   ├── 📁 src/
│   │   ├── 📁 controllers/
│   │   │   └── paylaterCtr.ts     # Request handlers
│   │   │
│   │   ├── 📁 routes/
│   │   │   └── paylater.routes.ts # API endpoints
│   │   │
│   │   ├── 📁 services/           # 🔑 Business logic layer
│   │   │   ├── activity-log.service.ts
│   │   │   ├── agreement.service.ts
│   │   │   ├── eligibility.service.ts
│   │   │   └── instalment.service.ts
│   │   │
│   │   ├── 📁 utils/
│   │   │   └── date.ts            # Date utilities
│   │   │
│   │   └── index.ts               # Server entry
│   │
│   └── 📄 package.json, tsconfig.json
│
├── 📁 frontend/                   # React (TypeScript)
│   ├── 📁 public/                 # Static assets
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   └── UserPicker.tsx     # User selection
│   │   │
│   │   ├── 📁 pages/              # 🔑 Main screens
│   │   │   ├── CartScreen.tsx
│   │   │   ├── PaylaterDetailScreen.tsx
│   │   │   ├── PayLaterInstallmentList.tsx
│   │   │   └── SelectUserPage.tsx
│   │   │
│   │   ├── 📁 utils/
│   │   │   └── date.ts
│   │   │
│   │   └── App.tsx, index.tsx
│   │
│   └── 📄 package.json, tsconfig.json
│
└── 📄 README.md, .gitignore




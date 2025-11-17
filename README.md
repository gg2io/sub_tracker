# Subscription Tracker

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react\&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi\&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwind-css\&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite\&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript\&logoColor=black)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios\&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-FF6B6B?logo=react\&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python\&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?logo=sqlalchemy\&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?logo=pydantic\&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js\&logoColor=white)
![pip](https://img.shields.io/badge/pip-3775A9?logo=pypi\&logoColor=white)

A modern full‑stack **subscription management and spending analytics** application built with a **React + Tailwind CSS** frontend, a **FastAPI** backend, and **SQLite** as a lightweight, portable database.

---

## Features

### Dashboard Overview

* Active subscriptions summary
* Monthly and yearly spending statistics
* Category‑based spending visuals
* 6‑month bar chart for spending trends
* Recent transactions with payment method details

### CSV Import & Transaction Matching

* Import bank statements (CSV)
* Automatic subscription detection based on recurring patterns
* Auto‑create payment methods found in CSV
* Validates required fields with helpful error messages

### Subscription Management

* Add, edit, and delete subscriptions
* Billing cycles: **monthly, yearly, weekly, quarterly**
* Category and payment method assignment
* Color‑coded categories
* Start date & next billing date tracking

### Payment Method Management

* Manage friendly card names (e.g., "Visa *1234")
* Delete unused methods (safe validation)
* View spending breakdown per card

### Categories & Organization

* Custom categories with colors
* Category‑specific analytics
* Click‑through pie charts

### Notifications

* Upcoming payments (7‑day alert)
* Newly detected subscription notifications
* Mark read / unread

### Dark Mode

* Automatic system detection
* Manual toggle

---

## Tech Stack

### Frontend

* **React (Vite)**
* **Tailwind CSS**
* **Recharts** for charts
* **Axios** for API communication

### Backend

* **FastAPI**
* **SQLite** (via SQLAlchemy)
* **Pydantic** schemas

---

## Project Structure

```
subscription_tracker/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Setup Instructions

### Backend Setup (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

API available at: **[http://localhost:8000](http://localhost:8000)**

### Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: **[http://localhost:5173](http://localhost:5173)**

---

## CSV Import Format

### Required Columns

* `date`
* `description`
* `amount`

### Optional Columns

* `currency`
* `merchant`
* `payment_method`

### Example

```csv
date,description,amount,currency,merchant,payment_method
2025-01-15,Netflix Subscription,-15.99,GBP,Netflix,Visa *1234
2025-01-10,Spotify Premium,-9.99,GBP,Spotify,Mastercard *5678
```

---

## API Endpoints

Interactive documentation available at **/docs**

### Subscriptions

* `GET /api/subscriptions`
* `POST /api/subscriptions`
* `PUT /api/subscriptions/{id}`
* `DELETE /api/subscriptions/{id}`

### Categories

* `GET /api/categories`
* `POST /api/categories`
* `DELETE /api/categories/{id}`

### Payment Methods

* `GET /api/payment-methods`
* `POST /api/payment-methods`
* `DELETE /api/payment-methods/{id}`

### Transactions

* `GET /api/transactions`
* `POST /api/transactions/import`

### Analytics

* `GET /api/analytics/dashboard`
* `GET /api/analytics/monthly?months=n`
* `GET /api/analytics/yearly`
* `GET /api/analytics/by-payment-method`

---

## Usage Guide

1. Start backend
2. Start frontend
3. Import CSV or start adding subscriptions
4. Explore analytics, categories, and payment methods

---

## Future Enhancements

* User authentication
* Multi‑currency support
* Export analytics to PDF/CSV
* Mobile‑optimized dashboard

---

## Contributing

Pull requests are welcome! Please open an issue before submitting significant changes.

---

## License

MIT License — free to modify and use.

---

## Preview

![Image](https://github.com/user-attachments/assets/91572e6e-5de0-4acb-ab3a-40affa167376)
![Image](https://github.com/user-attachments/assets/45665a49-16c2-4dff-a518-c55f5a9318ac) 
*A snapshot of the app in action (example).*

---
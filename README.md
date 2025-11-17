# Subscription Tracker

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?logo=sqlalchemy&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?logo=pandas&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-FF6B6B?logo=react&logoColor=white)

A full-stack application for tracking and managing your subscriptions with CSV bank statement import capabilities.

## Features

- **Dashboard Overview**: View all your active subscriptions at a glance
- **Spending Analytics**:
  - Current month spending
  - Last 12 months spending
  - Monthly spending trends (6-month bar chart)
  - Category breakdown (interactive pie chart)
  - Payment method spending breakdown (clickable cards showing which subscriptions use each card)
- **CSV Import**: Import transactions from your bank statements
- **Subscription Management**:
  - Add new subscriptions
  - Edit existing subscriptions (amount, billing cycle, payment method, etc.)
  - Delete subscriptions
  - Assign payment methods to subscriptions
- **Payment Method Management**:
  - Store and manage payment card names (e.g., "Visa *1234")
  - Settings panel for managing payment methods and categories
  - Delete unused payment methods and categories
  - View spending breakdown by payment method
- **Category Organization**:
  - Organize subscriptions by categories with color coding
  - Create, edit, and delete categories via Settings
- **Recent Activity**:
  - Track recent transactions with payment method details
  - View all transactions modal (expandable from Recent Activity)
- **Notifications**: Get alerts for upcoming payments and detected subscriptions
- **Transaction Matching**: Automatic detection of recurring subscription patterns
- **Dark Mode**: Toggle between light and dark themes, with automatic system theme detection

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python3 main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## CSV Import Format

Your CSV file should contain the following columns:

### Required Columns:
- `date`: Transaction date (format: YYYY-MM-DD or MM/DD/YYYY)
- `description`: Transaction description
- `amount`: Transaction amount (negative for expenses, positive for income)

### Optional Columns:
- `currency`: Currency code (default: GBP)
- `merchant`: Merchant/vendor name
- `payment_method`: Payment card name (e.g., "Visa *1234")

### Example CSV:

```csv
date,description,amount,currency,merchant,payment_method
2025-01-15,Netflix Subscription,-15.99,GBP,Netflix,Visa *1234
2025-01-10,Spotify Premium,-9.99,GBP,Spotify,Mastercard *5678
2025-01-05,Adobe Creative Cloud,-54.99,GBP,Adobe,Visa *1234
2025-01-01,YouTube Premium,-11.99,GBP,YouTube,Amex *9012
```

**Note**: When importing, the system will automatically create payment method entries for any new card names encountered in the CSV.

## Usage

1. **Start the Backend**: Run `python3 main.py` in the backend directory (with venv activated)
2. **Start the Frontend**: Run `npm run dev` in the frontend directory
3. **Access the App**: Open your browser to `http://localhost:5173`

### Adding Subscriptions

1. Click the "Add" button in the Active Subscriptions section
2. Fill in the subscription details:
   - Name (required)
   - Amount (required)
   - Billing cycle (monthly, yearly, quarterly, weekly)
   - Category (optional - can create new ones)
   - Payment method (optional - can create new ones)
   - Start date
   - Next billing date
3. Click "Add Subscription"

### Editing Subscriptions

1. Click on any active subscription card
2. Update any details:
   - Name, description, amount
   - Billing cycle
   - Category or payment method
   - Dates or active status
3. Click "Save Changes"

### Importing Bank Statements

1. Click the "Import CSV" button in the header
2. Select your CSV file (must follow the format above)
3. Click "Upload"
4. The transactions will be imported and visible in the Recent Activity section
5. Any new payment methods in the CSV will be automatically created

### Managing Categories

1. When adding/editing a subscription, click "New" next to the category dropdown
2. Enter a category name (e.g., "Entertainment", "Productivity", "Cloud Services")
3. Optionally choose a color for the category
4. Click "Add"
5. The category will be available for all subscriptions

### Managing Payment Methods

**Via Settings Panel:**
1. Click the Settings (gear) icon in the header
2. Navigate to the "Payment Methods" tab
3. Add new payment methods with friendly names
4. Delete unused payment methods (will fail if in use by subscriptions/transactions)

**While Adding/Editing Subscriptions:**
1. Click "New" next to the payment method dropdown
2. Enter a friendly name for your card (e.g., "Visa *1234", "Mastercard *5678")
3. Click "Add"
4. The payment method will be available immediately

### Viewing Spending by Payment Method

1. Scroll to the "Spending by Payment Method" section
2. View total spending and transaction count for each card
3. Click any payment method card to see:
   - Total spending breakdown
   - All subscriptions using that card
   - Click subscriptions to edit them

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

### Main Endpoints:

**Subscriptions:**
- `GET /api/subscriptions` - List all subscriptions
- `GET /api/subscriptions/{id}` - Get a specific subscription
- `POST /api/subscriptions` - Create a subscription
- `PUT /api/subscriptions/{id}` - Update a subscription
- `DELETE /api/subscriptions/{id}` - Delete a subscription

**Categories:**
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a category
- `DELETE /api/categories/{id}` - Delete a category (fails if in use)

**Payment Methods:**
- `GET /api/payment-methods` - List all payment methods
- `POST /api/payment-methods` - Create a payment method
- `DELETE /api/payment-methods/{id}` - Delete a payment method (fails if in use)

**Transactions:**
- `GET /api/transactions` - List all transactions
- `POST /api/transactions/import` - Import CSV file

**Analytics:**
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/monthly?months={n}` - Get monthly spending data (default: 12 months)
- `GET /api/analytics/yearly` - Get yearly spending data
- `GET /api/analytics/by-payment-method` - Get spending breakdown by payment method

**Notifications:**
- `GET /api/notifications` - List all notifications
- `GET /api/notifications?unread_only=true` - List unread notifications only
- `PUT /api/notifications/{id}/read` - Mark a notification as read
- `POST /api/notifications/mark-all-read` - Mark all notifications as read

## Project Structure

```
subscription_tracker/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # Database configuration
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CSVImport.jsx
│   │   │   ├── AddSubscriptionModal.jsx
│   │   │   ├── EditSubscriptionModal.jsx
│   │   │   ├── MonthlySpendingModal.jsx
│   │   │   ├── SettingsModal.jsx
│   │   │   ├── NotificationPanel.jsx
│   │   │   ├── TransactionDetailModal.jsx
│   │   │   ├── AllTransactionsModal.jsx
│   │   │   ├── CategoryDetailModal.jsx
│   │   │   ├── PaymentMethodDetailModal.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Button.jsx
│   │   ├── services/        # API service
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Features in Detail

### Dashboard
- Overview cards showing:
  - Number of active subscriptions
  - Total spent this month (with month-over-month comparison)
  - Total spent in the last 12 months
- Category breakdown pie chart (interactive - click to see category details)
- Monthly spending modal with 6-month bar chart (click spending cards to view)
- Recent transactions list with payment method information
- Active subscriptions list (click to edit)
- Notification bell with unread count

### CSV Import
- Supports standard bank statement CSV formats
- Validates required columns
- Provides feedback on import success/failure
- Automatically parses dates and amounts
- Auto-creates payment methods from CSV data
- Detects recurring subscription patterns
- Generates notifications for newly detected subscriptions

### Subscription Management
- **Add**: Create new subscriptions with full details
- **Edit**: Click any subscription card to modify details
- **Delete**: Remove subscriptions when needed
- **Payment Methods**: Assign and track which card is used
- **Categories**: Organize with color-coded categories
- **Billing Cycles**: Support for monthly, yearly, quarterly, weekly
- **Automatic Transactions**: Creates transaction records for manual subscriptions

### Payment Method Management
- Store friendly card names (e.g., "Visa *1234")
- Reusable across all subscriptions and transactions
- Auto-created from CSV imports
- Easy selection via dropdown

### Notifications
- Upcoming payment alerts (7 days in advance)
- Newly detected subscription notifications
- Unread count badge
- Mark as read functionality
- Linked to specific subscriptions

### Analytics
- Real-time dashboard statistics
- Visual representations of spending patterns
- Category-based spending analysis with pie chart
- Historical spending trends with bar charts
- Month-over-month comparisons

## License

MIT

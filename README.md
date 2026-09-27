# PocketTrack — Personal Expense Tracker Mobile Application

PocketTrack is a production-ready, full-stack personal finance and expense tracker mobile application. It empowers users to take full control of their personal finances through automated budget tracking, real-time spending analytics, categorization, and secure JWT authentication.

---

## Architecture Overview

```
                      PocketTrack Architecture
                      
   +-------------------------------------------------------------+
   |                  React Native Mobile Client                 |
   |              (Expo 52, JavaScript, NativeWind)               |
   +-------------------------------------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                        Redux Toolkit                        |
   |   (authSlice, transactionSlice, budgetSlice, dashboardSlice)|
   +-------------------------------------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                     Centralized Axios                       |
   |          (JWT Interceptors, Auto Refresh, Error Handling)   |
   +-------------------------------------------------------------+
                                  |
                            REST API (HTTP)
                                  |
                                  v
   +-------------------------------------------------------------+
   |                  Django 5.1+ REST Framework                 |
   |   (SimpleJWT Auth, Accounts, Transactions, Budgets, Reports)|
   +-------------------------------------------------------------+
                                  |
                              Django ORM
                                  |
                                  v
   +-------------------------------------------------------------+
   |                     PostgreSQL Database                     |
   |                      (pockettrack_db)                       |
   +-------------------------------------------------------------+
```

---

## Key Features

- **Full Authentication & Session Persistence**:
  - User registration with validation and password confirmation
  - JWT Access & Refresh token generation with secure AsyncStorage persistence
  - Auto-login on app launch if active session exists
  - Automatic token refresh on 401 Unauthorized responses
  - Profile retrieval, editing (First Name, Last Name), and secure logout
- **Income & Expense Tracking**:
  - Add, view, edit, and delete transactions
  - Strict user-level data isolation (each user can only view/modify their own data)
  - Color-coded transaction cards (+ Green for Income, - Red for Expense)
  - 11 Expense Categories (Food, Transport, Shopping, Bills, Entertainment, Health, Education, Travel, Rent, Subscriptions, Other)
  - 6 Income Categories (Salary, Freelance, Investment, Business, Gift, Other)
- **Advanced Filtering, Search & Sorting**:
  - Search transactions in real-time by title or notes
  - Filter by transaction type: All, Income, or Expense
  - Filter by category with horizontal category pill selector
  - Sort transactions: Newest First, Oldest First, Highest Amount, Lowest Amount
- **Monthly Budget Planner**:
  - Set category-specific monthly spending budgets
  - Dynamic month-by-month navigation
  - Real-time calculation of Spent, Remaining, and Percentage Used
  - Visual color-coded progress bars (Primary < 80%, Warning Amber 80–100%, Danger Red > 100%)
  - Automatic status indicators (*On Track*, *Near Limit*, *Exceeded*)
- **Interactive Financial Dashboard**:
  - Total Balance Hero card
  - Total Income & Total Expenses all-time overview
  - Monthly Income & Expense breakdown
  - Monthly Budget utilization preview
  - Recent transactions list with quick access
- **Financial Analytics & Reports**:
  - Real data-driven reports for Current Month and Previous Month
  - Net Savings and Savings Rate percentage calculation
  - Category-wise spending breakdown with visual progress distributions
  - 6-Month Income vs. Expense trends comparison
  - Budget vs. Actual compliance reporting

---

## Tech Stack

### Frontend
- **Framework**: React Native with Expo SDK 52
- **Language**: JavaScript (ES6+ Functional Components with Hooks)
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **API Client**: Centralized Axios with request/response interceptors
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Storage**: `@react-native-async-storage/async-storage`
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Charts**: Custom responsive SVG / Bar visualizations

### Backend
- **Language**: Python 3.12+ / 3.14+
- **Framework**: Django 5.1+ & Django REST Framework (DRF)
- **Authentication**: `djangorestframework-simplejwt` (JWT Auth)
- **CORS**: `django-cors-headers`
- **Environment**: `python-dotenv`
- **Database Driver**: `psycopg` (v3 binary)
- **Database**: PostgreSQL (`pockettrack_db`)

---

## Monorepo Directory Structure

```
ExpenseTracker_Mobile_App/
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── apps/
│       ├── accounts/
│       │   ├── models.py
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   ├── admin.py
│       │   ├── tests.py
│       │   └── management/commands/
│       │       ├── seed_data.py
│       │       └── create_admin.py
│       ├── transactions/
│       │   ├── models.py
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   ├── admin.py
│       │   └── tests.py
│       ├── budgets/
│       │   ├── models.py
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   ├── admin.py
│       │   └── tests.py
│       └── dashboard/
│           ├── serializers.py
│           ├── views.py
│           ├── urls.py
│           ├── admin.py
│           └── tests.py
│
├── frontend/
│   ├── package.json
│   ├── app.json
│   ├── babel.config.js
│   ├── metro.config.js
│   ├── tailwind.config.js
│   ├── global.css
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── App.js
│   ├── index.js
│   └── src/
│       ├── App.js
│       ├── components/
│       │   ├── Button.js
│       │   ├── Input.js
│       │   ├── Card.js
│       │   ├── Header.js
│       │   ├── Loading.js
│       │   ├── EmptyState.js
│       │   ├── TransactionCard.js
│       │   ├── BudgetCard.js
│       │   └── ErrorMessage.js
│       ├── constants/
│       │   ├── colors.js
│       │   └── categories.js
│       ├── hooks/
│       │   └── reduxHooks.js
│       ├── navigation/
│       │   ├── AppNavigator.js
│       │   ├── AuthNavigator.js
│       │   └── RootNavigator.js
│       ├── redux/
│       │   ├── store.js
│       │   └── slices/
│       │       ├── authSlice.js
│       │       ├── transactionSlice.js
│       │       ├── budgetSlice.js
│       │       └── dashboardSlice.js
│       ├── screens/
│       │   ├── SplashScreen.js
│       │   ├── auth/
│       │   │   ├── LoginScreen.js
│       │   │   └── RegisterScreen.js
│       │   ├── home/
│       │   │   └── HomeScreen.js
│       │   ├── transactions/
│       │   │   ├── TransactionsScreen.js
│       │   │   ├── AddTransactionScreen.js
│       │   │   └── TransactionDetailsScreen.js
│       │   ├── budget/
│       │   │   └── BudgetScreen.js
│       │   ├── reports/
│       │   │   └── ReportsScreen.js
│       │   └── profile/
│       │       └── ProfileScreen.js
│       ├── services/
│       │   ├── api.js
│       │   ├── authService.js
│       │   ├── transactionService.js
│       │   ├── budgetService.js
│       │   └── dashboardService.js
│       └── utils/
│           ├── currency.js
│           ├── date.js
│           └── validation.js
│
├── API_DOCUMENTATION.md
├── PocketTrack.postman_collection.json
├── .gitignore
└── README.md
```

---

## Prerequisites

Before running the application, make sure you have installed:
1. **Node.js**: v18.0.0 or higher (v22.x recommended)
2. **Python**: v3.11, v3.12, or v3.14
3. **PostgreSQL**: v14+ (tested on PostgreSQL 18)
4. **Git**

---

## 1. PostgreSQL Database Setup

1. Verify that your PostgreSQL service is running:
   ```powershell
   Get-Service *postgres*
   ```
2. Create the application database:
   ```sql
   CREATE DATABASE pockettrack_db;
   ```

---

## 2. Backend Setup & Run

1. Navigate to the backend directory:
   ```powershell
   cd backend
   ```
2. Activate the virtual environment:
   ```powershell
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   # Or Command Prompt
   venv\Scripts\activate.bat
   # Linux / macOS
   source venv/bin/activate
   ```
3. Verify dependencies are installed:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `.env` file (copy from `.env.example` if needed):
   ```ini
   SECRET_KEY=django-insecure-pockettrack-secret-key-2026-production-grade
   DEBUG=True
   DB_NAME=pockettrack_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   ALLOWED_HOSTS=localhost,127.0.0.1,10.0.2.2,*
   ```
5. Apply database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. (Optional) Create an admin superuser:
   ```bash
   python manage.py create_admin
   # Creates: admin@pockettrack.com / Admin@123456
   ```
7. (Optional) Populate demo financial data for evaluation:
   ```bash
   python manage.py seed_data
   # Creates: demo@pockettrack.com / PocketTrack@2026
   ```
8. Start the Django development server:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
   Backend will be accessible at: `http://127.0.0.1:8000/` and Django Admin at `http://127.0.0.1:8000/admin/`.

---

## 3. Frontend Setup & Run

1. Navigate to the frontend directory:
   ```powershell
   cd frontend
   ```
2. Install dependencies (already installed, or re-run):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Configure the frontend `.env` file:
   - For **Android Emulator**: `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api`
   - For **Web Browser / iOS Simulator**: `EXPO_PUBLIC_API_URL=http://localhost:8000/api`
   - For **Physical Device (Expo Go)**: `EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8000/api`
4. Start the Expo development server:
   ```bash
   npx expo start
   ```
   - Press `w` to open in your web browser.
   - Press `a` to open in Android Emulator.
   - Scan the QR code using the Expo Go mobile app on your Android or iOS device.

---

## 4. Running Backend Automated Tests

Run the full Django test suite (covering user registration, login, JWT auth, token refresh, profile updates, transactions CRUD, user data isolation, budget calculations, dashboard metrics, and reports):

```powershell
cd backend
.\venv\Scripts\python.exe manage.py test
```

Expected output:
```
Ran 21 tests in 2.2s
OK
```

---

## 5. Testing with Postman

An official Postman collection is included in the project root:
- File: `PocketTrack.postman_collection.json`

To test:
1. Open Postman.
2. Click **Import** and select `PocketTrack.postman_collection.json`.
3. Run the **Login User** request — it automatically sets the `{{access_token}}` variable in Postman for all subsequent authenticated requests.
4. Execute transactions, budgets, dashboard, and reports requests.

---

## Pre-seeded Test Accounts

| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Admin Superuser** | `admin@pockettrack.com` | `Admin@123456` | Full Django Admin Access |
| **Demo User** | `demo@pockettrack.com` | `PocketTrack@2026` | Pre-populated with budgets & transactions |

You can also register any new user directly from the mobile app's Sign Up screen.

---

## Troubleshooting & Network Configuration

- **Android Emulator**: Android Emulators use `10.0.2.2` to access `localhost` on the host machine. Ensure `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api` in `frontend/.env`.
- **Physical Device**: Connect your phone to the same Wi-Fi network as your PC. Find your local IP (e.g. `192.168.1.15`) via `ipconfig`, then set `EXPO_PUBLIC_API_URL=http://192.168.1.15:8000/api`.
- **CORS Issues**: In development (`DEBUG=True`), `CORS_ALLOW_ALL_ORIGINS = True` is automatically enabled in Django settings to allow connections from any Expo device or port.

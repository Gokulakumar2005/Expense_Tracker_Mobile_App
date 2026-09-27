# PocketTrack REST API Documentation

This document describes all REST API endpoints provided by the PocketTrack backend built with Django REST Framework, JWT Authentication, and PostgreSQL.

Base URL: `http://localhost:8000/api` (or `http://10.0.2.2:8000/api` for Android Emulator)

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method**: `POST`
- **URL**: `/api/auth/register/`
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "PocketTrack@2026",
  "confirm_password": "PocketTrack@2026"
}
```
- **Response** (`201 Created`):
```json
{
  "message": "User registered successfully",
  "tokens": {
    "refresh": "<refresh_jwt_token>",
    "access": "<access_jwt_token>"
  },
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "created_at": "2026-09-27T12:00:00Z",
    "updated_at": "2026-09-27T12:00:00Z"
  }
}
```
- **Errors**:
  - `400 Bad Request`: Email already exists, passwords do not match, or password length < 6 characters.

---

### 1.2 Login User
- **Method**: `POST`
- **URL**: `/api/auth/login/`
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "PocketTrack@2026"
}
```
- **Response** (`200 OK`):
```json
{
  "message": "Login successful",
  "tokens": {
    "refresh": "<refresh_jwt_token>",
    "access": "<access_jwt_token>"
  },
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "created_at": "2026-09-27T12:00:00Z",
    "updated_at": "2026-09-27T12:00:00Z"
  }
}
```
- **Errors**:
  - `400 Bad Request`: Invalid email or password.

---

### 1.3 Refresh Access Token
- **Method**: `POST`
- **URL**: `/api/auth/refresh/`
- **Authentication**: None
- **Request Body**:
```json
{
  "refresh": "<refresh_jwt_token>"
}
```
- **Response** (`200 OK`):
```json
{
  "access": "<new_access_jwt_token>"
}
```
- **Errors**:
  - `401 Unauthorized`: Token is invalid or expired.

---

### 1.4 Get Profile
- **Method**: `GET`
- **URL**: `/api/auth/profile/`
- **Authentication**: Bearer Token required (`Authorization: Bearer <access_token>`)
- **Response** (`200 OK`):
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "created_at": "2026-09-27T12:00:00Z",
  "updated_at": "2026-09-27T12:00:00Z"
}
```

---

### 1.5 Update Profile
- **Method**: `PUT` / `PATCH`
- **URL**: `/api/auth/profile/`
- **Authentication**: Bearer Token required
- **Request Body**:
```json
{
  "first_name": "Johnny",
  "last_name": "Doe"
}
```
- **Response** (`200 OK`): Returns updated profile object.

---

## 2. Transactions Endpoints

### 2.1 List Transactions
- **Method**: `GET`
- **URL**: `/api/transactions/`
- **Authentication**: Bearer Token required
- **Query Parameters**:
  - `transaction_type`: `INCOME` or `EXPENSE`
  - `category`: Filter by category (e.g. `Food`, `Salary`)
  - `date`: Filter by exact date (`YYYY-MM-DD`)
  - `month`: Month number (`1` to `12`)
  - `year`: 4-digit year (e.g. `2026`)
  - `start_date`: Range start (`YYYY-MM-DD`)
  - `end_date`: Range end (`YYYY-MM-DD`)
  - `search`: Case-insensitive search across `title` and `description`
  - `ordering`: `newest` (default), `oldest`, `highest`, `lowest`
  - `page`: Page number for pagination
- **Response** (`200 OK`):
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": 1,
      "title": "Supermarket Groceries",
      "amount": "3200.00",
      "formatted_amount": "3,200.00",
      "transaction_type": "EXPENSE",
      "category": "Food",
      "description": "Vegetables and pantry items",
      "transaction_date": "2026-09-15",
      "created_at": "2026-09-15T10:30:00Z",
      "updated_at": "2026-09-15T10:30:00Z"
    }
  ]
}
```

---

### 2.2 Create Transaction
- **Method**: `POST`
- **URL**: `/api/transactions/`
- **Authentication**: Bearer Token required
- **Request Body**:
```json
{
  "title": "September Freelance",
  "amount": "25000.00",
  "transaction_type": "INCOME",
  "category": "Freelance",
  "description": "Mobile app consulting milestone",
  "transaction_date": "2026-09-20"
}
```
- **Response** (`201 Created`): Returns newly created transaction.
- **Errors**:
  - `400 Bad Request`: Validation failure (missing title, amount <= 0, invalid type).

---

### 2.3 Retrieve Transaction Details
- **Method**: `GET`
- **URL**: `/api/transactions/<id>/`
- **Authentication**: Bearer Token required
- **Response** (`200 OK`): Returns transaction object.
- **Errors**:
  - `404 Not Found`: Transaction does not exist or does not belong to the user.

---

### 2.4 Update Transaction
- **Method**: `PUT` / `PATCH`
- **URL**: `/api/transactions/<id>/`
- **Authentication**: Bearer Token required
- **Response** (`200 OK`): Returns updated transaction object.

---

### 2.5 Delete Transaction
- **Method**: `DELETE`
- **URL**: `/api/transactions/<id>/`
- **Authentication**: Bearer Token required
- **Response** (`200 OK`):
```json
{
  "message": "Transaction deleted successfully."
}
```

---

### 2.6 Categories List
- **Method**: `GET`
- **URL**: `/api/transactions/categories/`
- **Authentication**: Bearer Token required
- **Response** (`200 OK`):
```json
{
  "expense_categories": [
    "Food", "Transport", "Shopping", "Bills", "Entertainment",
    "Health", "Education", "Travel", "Rent", "Subscriptions", "Other"
  ],
  "income_categories": [
    "Salary", "Freelance", "Investment", "Business", "Gift", "Other"
  ]
}
```

---

## 3. Budget Endpoints

### 3.1 List Monthly Budgets
- **Method**: `GET`
- **URL**: `/api/budgets/`
- **Authentication**: Bearer Token required
- **Query Parameters**:
  - `month`: 1-12 (e.g. `9`)
  - `year`: 4-digit year (e.g. `2026`)
- **Response** (`200 OK`):
```json
[
  {
    "id": 1,
    "user": 1,
    "category": "Food",
    "amount": "6000.00",
    "month": 9,
    "year": 2026,
    "spent": "3200.00",
    "remaining": "2800.00",
    "percentage_used": 53.3,
    "is_exceeded": false,
    "is_warning": false,
    "created_at": "2026-09-01T00:00:00Z",
    "updated_at": "2026-09-01T00:00:00Z"
  }
]
```

---

### 3.2 Create Budget
- **Method**: `POST`
- **URL**: `/api/budgets/`
- **Authentication**: Bearer Token required
- **Request Body**:
```json
{
  "category": "Food",
  "amount": "6000.00",
  "month": 9,
  "year": 2026
}
```
- **Response** (`201 Created`): Returns created budget with calculated fields.
- **Errors**:
  - `400 Bad Request`: Duplicate budget for category in month/year, or amount <= 0.

---

### 3.3 Get Budget Summary
- **Method**: `GET`
- **URL**: `/api/budgets/summary/?month=9&year=2026`
- **Authentication**: Bearer Token required
- **Response** (`200 OK`):
```json
{
  "month": 9,
  "year": 2026,
  "total_budget": 6000.0,
  "total_spent": 3200.0,
  "remaining_budget": 2800.0,
  "percentage_used": 53.3,
  "budget_count": 1,
  "exceeded_count": 0,
  "warning_count": 0
}
```

---

### 3.4 Update Budget
- **Method**: `PUT` / `PATCH`
- **URL**: `/api/budgets/<id>/`
- **Authentication**: Bearer Token required
- **Response** (`200 OK`): Returns updated budget.

---

### 3.5 Delete Budget
- **Method**: `DELETE`
- **URL**: `/api/budgets/<id>/`
- **Authentication**: Bearer Token required
- **Response** (`200 OK`):
```json
{
  "message": "Budget deleted successfully."
}
```

---

## 4. Dashboard & Reports Endpoints

### 4.1 Dashboard Overview
- **Method**: `GET`
- **URL**: `/api/dashboard/`
- **Authentication**: Bearer Token required
- **Response** (`200 OK`):
```json
{
  "total_balance": 41800.0,
  "total_income": 45000.0,
  "total_expense": 3200.0,
  "monthly_income": 45000.0,
  "monthly_expense": 3200.0,
  "monthly_budget": 6000.0,
  "remaining_budget": 2800.0,
  "budget_spent": 3200.0,
  "budget_percentage": 53.3,
  "recent_transactions": [ ... ],
  "category_summary": [
    {
      "category": "Food",
      "total_amount": 3200.0,
      "percentage": 100.0,
      "transaction_count": 1
    }
  ],
  "current_month": 9,
  "current_year": 2026,
  "current_month_name": "September"
}
```

---

### 4.2 Financial Reports
- **Method**: `GET`
- **URL**: `/api/dashboard/reports/`
- **Authentication**: Bearer Token required
- **Query Parameters**:
  - `period`: `current_month` or `previous_month`
  - `month` & `year`: Optional specific month and year filter
- **Response** (`200 OK`):
```json
{
  "period": "current_month",
  "period_label": "September 2026",
  "target_month": 9,
  "target_year": 2026,
  "income_total": 45000.0,
  "expense_total": 3200.0,
  "net_savings": 41800.0,
  "savings_rate": 92.9,
  "category_breakdown": [
    {
      "category": "Food",
      "total_amount": 3200.0,
      "percentage": 100.0,
      "transaction_count": 1
    }
  ],
  "monthly_trends": [
    {
      "month": 4,
      "year": 2026,
      "month_name": "Apr",
      "income": 0.0,
      "expense": 0.0,
      "net_savings": 0.0
    },
    ...
  ],
  "budget_usage": [ ... ]
}
```

from decimal import Decimal
from datetime import date
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.transactions.models import Transaction
from apps.budgets.models import Budget

User = get_user_model()

class DashboardAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='dash@example.com',
            first_name='Dash',
            last_name='Board',
            password='password123'
        )
        self.client.force_authenticate(user=self.user)
        self.today = date.today()

        # Add income: 25000
        Transaction.objects.create(
            user=self.user,
            title='Salary',
            amount=Decimal('25000.00'),
            transaction_type=Transaction.TYPE_INCOME,
            category='Salary',
            transaction_date=self.today
        )

        # Add expense: 5000 in Food
        Transaction.objects.create(
            user=self.user,
            title='Supermarket',
            amount=Decimal('5000.00'),
            transaction_type=Transaction.TYPE_EXPENSE,
            category='Food',
            transaction_date=self.today
        )

        # Add expense: 2000 in Transport
        Transaction.objects.create(
            user=self.user,
            title='Fuel',
            amount=Decimal('2000.00'),
            transaction_type=Transaction.TYPE_EXPENSE,
            category='Transport',
            transaction_date=self.today
        )

        # Budget: 8000 for Food
        Budget.objects.create(
            user=self.user,
            category='Food',
            amount=Decimal('8000.00'),
            month=self.today.month,
            year=self.today.year
        )

    def test_dashboard_endpoint_data(self):
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(data['total_income'], 25000.00)
        self.assertEqual(data['total_expense'], 7000.00)
        self.assertEqual(data['total_balance'], 18000.00)
        self.assertEqual(data['monthly_income'], 25000.00)
        self.assertEqual(data['monthly_expense'], 7000.00)
        self.assertEqual(data['monthly_budget'], 8000.00)
        self.assertEqual(data['budget_spent'], 5000.00) # Only Food was budgeted
        self.assertEqual(data['remaining_budget'], 3000.00)
        self.assertEqual(len(data['recent_transactions']), 3)
        self.assertEqual(len(data['category_summary']), 2)

    def test_reports_endpoint_data(self):
        response = self.client.get(f'/api/dashboard/reports/?month={self.today.month}&year={self.today.year}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(data['income_total'], 25000.00)
        self.assertEqual(data['expense_total'], 7000.00)
        self.assertEqual(data['net_savings'], 18000.00)
        self.assertIn('category_breakdown', data)
        self.assertIn('monthly_trends', data)
        self.assertEqual(len(data['monthly_trends']), 6)

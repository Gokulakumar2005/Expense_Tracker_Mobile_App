from decimal import Decimal
from datetime import date
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Budget
from apps.transactions.models import Transaction

User = get_user_model()

class BudgetsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            first_name='Budget',
            last_name='Tester',
            password='password123'
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            first_name='Other',
            last_name='User',
            password='password123'
        )
        self.client.force_authenticate(user=self.user1)

        self.today = date.today()
        self.budget_data = {
            'category': 'Food',
            'amount': '5000.00',
            'month': self.today.month,
            'year': self.today.year
        }

    def test_create_budget_success(self):
        response = self.client.post('/api/budgets/', self.budget_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['category'], 'Food')
        self.assertEqual(Decimal(str(response.data['amount'])), Decimal('5000.00'))

    def test_budget_calculations_and_warnings(self):
        # Create budget for 1000
        budget = Budget.objects.create(
            user=self.user1,
            category='Food',
            amount=Decimal('1000.00'),
            month=self.today.month,
            year=self.today.year
        )

        # Before any expenses
        self.assertEqual(budget.spent_amount, Decimal('0.00'))
        self.assertEqual(budget.remaining_amount, Decimal('1000.00'))
        self.assertEqual(budget.percentage_used, Decimal('0.0'))
        self.assertFalse(budget.is_warning)
        self.assertFalse(budget.is_exceeded)

        # Add expense of 850 (85% -> warning)
        Transaction.objects.create(
            user=self.user1,
            title='Groceries',
            amount=Decimal('850.00'),
            transaction_type=Transaction.TYPE_EXPENSE,
            category='Food',
            transaction_date=self.today
        )

        self.assertEqual(budget.spent_amount, Decimal('850.00'))
        self.assertEqual(budget.remaining_amount, Decimal('150.00'))
        self.assertEqual(budget.percentage_used, Decimal('85.0'))
        self.assertTrue(budget.is_warning)
        self.assertFalse(budget.is_exceeded)

        # Add another expense of 200 (Total 1050 -> exceeded)
        Transaction.objects.create(
            user=self.user1,
            title='Snacks',
            amount=Decimal('200.00'),
            transaction_type=Transaction.TYPE_EXPENSE,
            category='Food',
            transaction_date=self.today
        )

        self.assertEqual(budget.spent_amount, Decimal('1050.00'))
        self.assertEqual(budget.remaining_amount, Decimal('-50.00'))
        self.assertTrue(budget.is_exceeded)

    def test_budget_user_isolation(self):
        b2 = Budget.objects.create(
            user=self.user2,
            category='Shopping',
            amount=Decimal('2000.00'),
            month=self.today.month,
            year=self.today.year
        )
        # user1 cannot retrieve user2's budget
        res = self.client.get(f'/api/budgets/{b2.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_budget_summary_endpoint(self):
        Budget.objects.create(
            user=self.user1,
            category='Rent',
            amount=Decimal('10000.00'),
            month=self.today.month,
            year=self.today.year
        )
        res = self.client.get(f'/api/budgets/summary/?month={self.today.month}&year={self.today.year}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_budget'], 10000.00)
        self.assertEqual(res.data['budget_count'], 1)

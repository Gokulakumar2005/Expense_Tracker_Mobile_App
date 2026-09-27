from decimal import Decimal
from datetime import date
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Transaction

User = get_user_model()

class TransactionsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            first_name='User',
            last_name='One',
            password='password123'
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            first_name='User',
            last_name='Two',
            password='password123'
        )

        # Authenticate user1
        self.client.force_authenticate(user=self.user1)

        self.tx_data = {
            'title': 'Monthly Salary',
            'amount': '50000.00',
            'transaction_type': 'INCOME',
            'category': 'Salary',
            'description': 'Direct bank deposit',
            'transaction_date': str(date.today())
        }

    def test_create_transaction_success(self):
        response = self.client.post('/api/transactions/', self.tx_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Monthly Salary')
        self.assertEqual(Decimal(str(response.data['amount'])), Decimal('50000.00'))
        self.assertEqual(response.data['user'], self.user1.id)

    def test_create_transaction_invalid_amount(self):
        data = self.tx_data.copy()
        data['amount'] = '-100.00'
        response = self.client.post('/api/transactions/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_data_isolation(self):
        # Create a transaction belonging to user2
        tx_user2 = Transaction.objects.create(
            user=self.user2,
            title='User 2 Secret Expense',
            amount=Decimal('500.00'),
            transaction_type='EXPENSE',
            category='Shopping',
            transaction_date=date.today()
        )

        # User 1 tries to list transactions - user2's transaction must NOT appear
        response = self.client.get('/api/transactions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data.get('results', response.data)]
        self.assertNotIn(tx_user2.id, ids)

        # User 1 tries to retrieve user 2's transaction directly - must return 404
        detail_response = self.client.get(f'/api/transactions/{tx_user2.id}/')
        self.assertEqual(detail_response.status_code, status.HTTP_404_NOT_FOUND)

        # User 1 tries to delete user 2's transaction - must return 404
        del_response = self.client.delete(f'/api/transactions/{tx_user2.id}/')
        self.assertEqual(del_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Transaction.objects.filter(id=tx_user2.id).exists())

    def test_update_transaction(self):
        tx = Transaction.objects.create(
            user=self.user1,
            title='Old Title',
            amount=Decimal('100.00'),
            transaction_type='EXPENSE',
            category='Food',
            transaction_date=date.today()
        )
        response = self.client.put(f'/api/transactions/{tx.id}/', {
            'title': 'New Title',
            'amount': '150.00',
            'transaction_type': 'EXPENSE',
            'category': 'Food',
            'transaction_date': str(date.today())
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'New Title')
        self.assertEqual(Decimal(str(response.data['amount'])), Decimal('150.00'))

    def test_delete_transaction(self):
        tx = Transaction.objects.create(
            user=self.user1,
            title='To Delete',
            amount=Decimal('50.00'),
            transaction_type='EXPENSE',
            category='Bills',
            transaction_date=date.today()
        )
        response = self.client.delete(f'/api/transactions/{tx.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Transaction.objects.filter(id=tx.id).exists())

    def test_filter_and_search_transactions(self):
        Transaction.objects.create(
            user=self.user1,
            title='Grocery shopping',
            amount=Decimal('200.00'),
            transaction_type='EXPENSE',
            category='Food',
            transaction_date=date.today()
        )
        Transaction.objects.create(
            user=self.user1,
            title='Freelance project',
            amount=Decimal('1500.00'),
            transaction_type='INCOME',
            category='Freelance',
            transaction_date=date.today()
        )

        # Filter by type INCOME
        res_income = self.client.get('/api/transactions/?transaction_type=INCOME')
        results = res_income.data.get('results', res_income.data)
        self.assertTrue(all(item['transaction_type'] == 'INCOME' for item in results))

        # Search by keyword
        res_search = self.client.get('/api/transactions/?search=Grocery')
        results = res_search.data.get('results', res_search.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], 'Grocery shopping')

    def test_get_categories_list(self):
        response = self.client.get('/api/transactions/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('expense_categories', response.data)
        self.assertIn('income_categories', response.data)
        self.assertIn('Food', response.data['expense_categories'])

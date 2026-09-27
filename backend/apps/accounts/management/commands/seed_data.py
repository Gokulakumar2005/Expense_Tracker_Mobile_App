from decimal import Decimal
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.transactions.models import Transaction
from apps.budgets.models import Budget

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds sample user, transactions, and budgets for evaluation and testing.'

    def handle(self, *args, **options):
        email = 'demo@pockettrack.com'
        password = 'PocketTrack@2026'

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': 'Alex',
                'last_name': 'Morgan',
                'is_active': True,
            }
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created demo user: {email} / {password}"))
        else:
            self.stdout.write(self.style.WARNING(f"Demo user {email} already exists."))

        today = date.today()
        current_year = today.year
        current_month = today.month

        # Seed Budgets for current month
        budgets_data = [
            {'category': 'Food', 'amount': Decimal('8000.00')},
            {'category': 'Transport', 'amount': Decimal('3000.00')},
            {'category': 'Shopping', 'amount': Decimal('4000.00')},
            {'category': 'Entertainment', 'amount': Decimal('2000.00')},
            {'category': 'Bills', 'amount': Decimal('5000.00')},
            {'category': 'Subscriptions', 'amount': Decimal('1200.00')},
        ]

        for b in budgets_data:
            Budget.objects.get_or_create(
                user=user,
                category=b['category'],
                month=current_month,
                year=current_year,
                defaults={'amount': b['amount']}
            )

        self.stdout.write(self.style.SUCCESS("Seeded monthly category budgets."))

        # Seed Transactions
        tx_data = [
            # Incomes
            {
                'title': 'Monthly Salary Deposit',
                'amount': Decimal('65000.00'),
                'transaction_type': Transaction.TYPE_INCOME,
                'category': 'Salary',
                'description': 'Direct bank deposit from employer',
                'transaction_date': date(current_year, current_month, 1),
            },
            {
                'title': 'Freelance Web Design',
                'amount': Decimal('18000.00'),
                'transaction_type': Transaction.TYPE_INCOME,
                'category': 'Freelance',
                'description': 'Milestone payment for client website redesign',
                'transaction_date': date(current_year, current_month, 10),
            },
            # Expenses
            {
                'title': 'House Rent',
                'amount': Decimal('16000.00'),
                'transaction_type': Transaction.TYPE_EXPENSE,
                'category': 'Rent',
                'description': 'Monthly apartment rent transfer',
                'transaction_date': date(current_year, current_month, 2),
            },
            {
                'title': 'Supermarket Groceries',
                'amount': Decimal('4200.00'),
                'transaction_type': Transaction.TYPE_EXPENSE,
                'category': 'Food',
                'description': 'Organic vegetables, fruits, and pantry items',
                'transaction_date': date(current_year, current_month, 5),
            },
            {
                'title': 'Metro Rail Pass & Fuel',
                'amount': Decimal('2100.00'),
                'transaction_type': Transaction.TYPE_EXPENSE,
                'category': 'Transport',
                'description': 'Commute pass recharge and petrol refill',
                'transaction_date': date(current_year, current_month, 8),
            },
            {
                'title': 'Electricity & Water Bill',
                'amount': Decimal('2850.00'),
                'transaction_type': Transaction.TYPE_EXPENSE,
                'category': 'Bills',
                'description': 'Monthly utility bill payments',
                'transaction_date': date(current_year, current_month, 12),
            },
            {
                'title': 'Casual Dinner with Friends',
                'amount': Decimal('1850.00'),
                'transaction_type': Transaction.TYPE_EXPENSE,
                'category': 'Food',
                'description': 'Weekend dinner at Italian bistro',
                'transaction_date': date(current_year, current_month, 16),
            },
            {
                'title': 'Streaming Services & Cloud',
                'amount': Decimal('999.00'),
                'transaction_type': Transaction.TYPE_EXPENSE,
                'category': 'Subscriptions',
                'description': 'Netflix and Spotify premium family plan',
                'transaction_date': date(current_year, current_month, 18),
            },
            {
                'title': 'New Running Shoes',
                'amount': Decimal('3499.00'),
                'transaction_type': Transaction.TYPE_EXPENSE,
                'category': 'Shopping',
                'description': 'Nike road running shoes on discount',
                'transaction_date': date(current_year, current_month, 21),
            },
            {
                'title': 'Movie Night & Snacks',
                'amount': Decimal('850.00'),
                'transaction_type': Transaction.TYPE_EXPENSE,
                'category': 'Entertainment',
                'description': 'IMAX cinema tickets and popcorn',
                'transaction_date': date(current_year, current_month, 24),
            },
        ]

        # Avoid duplicating if already seeded
        if Transaction.objects.filter(user=user).count() < len(tx_data):
            for tx in tx_data:
                Transaction.objects.create(user=user, **tx)
            self.stdout.write(self.style.SUCCESS(f"Seeded {len(tx_data)} transactions."))
        else:
            self.stdout.write(self.style.WARNING("Transactions already exist for demo user."))

        self.stdout.write(self.style.SUCCESS("Seeding completed successfully!"))

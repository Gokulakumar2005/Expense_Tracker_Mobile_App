from decimal import Decimal
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone

class Transaction(models.Model):
    """Transaction model representing Income and Expense records."""

    TYPE_INCOME = 'INCOME'
    TYPE_EXPENSE = 'EXPENSE'

    TRANSACTION_TYPES = (
        (TYPE_INCOME, 'Income'),
        (TYPE_EXPENSE, 'Expense'),
    )

    EXPENSE_CATEGORIES = [
        'Food',
        'Transport',
        'Shopping',
        'Bills',
        'Entertainment',
        'Health',
        'Education',
        'Travel',
        'Rent',
        'Subscriptions',
        'Other',
    ]

    INCOME_CATEGORIES = [
        'Salary',
        'Freelance',
        'Investment',
        'Business',
        'Gift',
        'Other',
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions',
        db_index=True
    )
    title = models.CharField(max_length=200)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    transaction_type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES,
        db_index=True
    )
    category = models.CharField(max_length=50, db_index=True)
    description = models.TextField(blank=True, default='')
    transaction_date = models.DateField(default=timezone.now, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
        ordering = ['-transaction_date', '-created_at']
        indexes = [
            models.Index(fields=['user', '-transaction_date']),
            models.Index(fields=['user', 'transaction_type']),
            models.Index(fields=['user', 'category']),
        ]

    def __str__(self):
        return f"{self.transaction_type}: {self.title} ({self.amount}) - {self.user.email}"

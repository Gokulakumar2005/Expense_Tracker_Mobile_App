from decimal import Decimal
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Sum
from apps.transactions.models import Transaction

class Budget(models.Model):
    """Budget model representing monthly category budgets for a user."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='budgets',
        db_index=True
    )
    category = models.CharField(max_length=50, db_index=True)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    month = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        db_index=True
    )
    year = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(2000), MaxValueValidator(2100)],
        db_index=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Budget'
        verbose_name_plural = 'Budgets'
        ordering = ['-year', '-month', 'category']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'category', 'month', 'year'],
                name='unique_user_category_month_year_budget'
            )
        ]
        indexes = [
            models.Index(fields=['user', 'year', 'month']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.category} ({self.month}/{self.year}): {self.amount}"

    @property
    def spent_amount(self):
        """Calculates total expense spent in this category for this month and year."""
        total = Transaction.objects.filter(
            user=self.user,
            transaction_type=Transaction.TYPE_EXPENSE,
            category__iexact=self.category,
            transaction_date__month=self.month,
            transaction_date__year=self.year
        ).aggregate(total=Sum('amount'))['total']
        return total or Decimal('0.00')

    @property
    def remaining_amount(self):
        """Calculates remaining budget amount (can be negative if overspent)."""
        return self.amount - self.spent_amount

    @property
    def percentage_used(self):
        """Calculates percentage of budget used."""
        if self.amount <= Decimal('0.00'):
            return Decimal('0.0')
        spent = self.spent_amount
        pct = (spent / self.amount) * Decimal('100.0')
        return round(pct, 1)

    @property
    def is_exceeded(self):
        """Returns True if user has spent more than budgeted."""
        return self.spent_amount > self.amount

    @property
    def is_warning(self):
        """Returns True if budget usage is between 80% and 100%."""
        return Decimal('80.0') <= self.percentage_used <= Decimal('100.0')

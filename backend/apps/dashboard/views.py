import calendar
from decimal import Decimal
from datetime import datetime, date
from django.utils import timezone
from django.db.models import Sum, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from apps.transactions.models import Transaction
from apps.transactions.serializers import TransactionSerializer
from apps.budgets.models import Budget
from apps.budgets.serializers import BudgetSerializer

class DashboardView(APIView):
    """
    GET /api/dashboard/
    Calculates and returns overall financial summary, current month stats,
    budget progress, recent transactions, and category breakdown.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        current_year = now.year
        current_month = now.month

        # Total income & total expense for all time
        total_income = Transaction.objects.filter(
            user=user,
            transaction_type=Transaction.TYPE_INCOME
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        total_expense = Transaction.objects.filter(
            user=user,
            transaction_type=Transaction.TYPE_EXPENSE
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        total_balance = total_income - total_expense

        # Current month income & expenses
        monthly_income = Transaction.objects.filter(
            user=user,
            transaction_type=Transaction.TYPE_INCOME,
            transaction_date__year=current_year,
            transaction_date__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        monthly_expense = Transaction.objects.filter(
            user=user,
            transaction_type=Transaction.TYPE_EXPENSE,
            transaction_date__year=current_year,
            transaction_date__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Current month budgets
        current_budgets = Budget.objects.filter(
            user=user,
            year=current_year,
            month=current_month
        )

        monthly_budget = current_budgets.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        budget_spent = Decimal('0.00')
        for b in current_budgets:
            budget_spent += b.spent_amount

        if monthly_budget > Decimal('0.00'):
            remaining_budget = monthly_budget - budget_spent
            budget_percentage = min(100.0, round(float((budget_spent / monthly_budget) * Decimal('100.0')), 1))
        else:
            remaining_budget = monthly_income - monthly_expense
            budget_percentage = 0.0

        # Recent transactions (latest 5)
        recent_txs = Transaction.objects.filter(user=user).order_by(
            '-transaction_date', '-created_at'
        )[:5]
        recent_serialized = TransactionSerializer(recent_txs, many=True).data

        # Category summary for current month expenses
        category_qs = Transaction.objects.filter(
            user=user,
            transaction_type=Transaction.TYPE_EXPENSE,
            transaction_date__year=current_year,
            transaction_date__month=current_month
        ).values('category').annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('id')
        ).order_by('-total_amount')

        category_summary = []
        for cat in category_qs:
            amount = cat['total_amount'] or Decimal('0.00')
            pct = round(float((amount / monthly_expense) * Decimal('100.0')), 1) if monthly_expense > Decimal('0.00') else 0.0
            category_summary.append({
                'category': cat['category'],
                'total_amount': float(amount),
                'percentage': pct,
                'transaction_count': cat['transaction_count']
            })

        data = {
            'total_balance': float(total_balance),
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'monthly_income': float(monthly_income),
            'monthly_expense': float(monthly_expense),
            'monthly_budget': float(monthly_budget),
            'remaining_budget': float(remaining_budget),
            'budget_spent': float(budget_spent),
            'budget_percentage': budget_percentage,
            'recent_transactions': recent_serialized,
            'category_summary': category_summary,
            'current_month': current_month,
            'current_year': current_year,
            'current_month_name': calendar.month_name[current_month],
        }

        return Response(data, status=status.HTTP_200_OK)

class ReportsView(APIView):
    """
    GET /api/dashboard/reports/
    Generates reports with category breakdown, income vs expense, monthly trends,
    and budget usage for the selected period.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()

        # Period query params
        period = request.query_params.get('period', 'current_month')
        month_param = request.query_params.get('month')
        year_param = request.query_params.get('year')

        if month_param and year_param:
            try:
                target_month = int(month_param)
                target_year = int(year_param)
                period_label = f"{calendar.month_name[target_month]} {target_year}"
            except ValueError:
                target_month = now.month
                target_year = now.year
                period_label = f"{calendar.month_name[target_month]} {target_year}"
        elif period == 'previous_month':
            if now.month == 1:
                target_month = 12
                target_year = now.year - 1
            else:
                target_month = now.month - 1
                target_year = now.year
            period_label = f"{calendar.month_name[target_month]} {target_year}"
        else: # default current_month
            target_month = now.month
            target_year = now.year
            period_label = f"{calendar.month_name[target_month]} {target_year}"

        # Transactions for period
        tx_qs = Transaction.objects.filter(
            user=user,
            transaction_date__year=target_year,
            transaction_date__month=target_month
        )

        income_total = tx_qs.filter(
            transaction_type=Transaction.TYPE_INCOME
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        expense_total = tx_qs.filter(
            transaction_type=Transaction.TYPE_EXPENSE
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        net_savings = income_total - expense_total
        savings_rate = round(float((net_savings / income_total) * Decimal('100.0')), 1) if income_total > Decimal('0.00') else 0.0

        # Category breakdown for expenses
        cat_qs = tx_qs.filter(
            transaction_type=Transaction.TYPE_EXPENSE
        ).values('category').annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('id')
        ).order_by('-total_amount')

        category_breakdown = []
        for cat in cat_qs:
            amount = cat['total_amount'] or Decimal('0.00')
            pct = round(float((amount / expense_total) * Decimal('100.0')), 1) if expense_total > Decimal('0.00') else 0.0
            category_breakdown.append({
                'category': cat['category'],
                'total_amount': float(amount),
                'percentage': pct,
                'transaction_count': cat['transaction_count']
            })

        # Monthly trends for the past 6 months
        monthly_trends = []
        for i in range(5, -1, -1):
            # Calculate month and year for i months ago
            m = now.month - i
            y = now.year
            while m <= 0:
                m += 12
                y -= 1

            m_income = Transaction.objects.filter(
                user=user,
                transaction_type=Transaction.TYPE_INCOME,
                transaction_date__year=y,
                transaction_date__month=m
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            m_expense = Transaction.objects.filter(
                user=user,
                transaction_type=Transaction.TYPE_EXPENSE,
                transaction_date__year=y,
                transaction_date__month=m
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            monthly_trends.append({
                'month': m,
                'year': y,
                'month_name': calendar.month_abbr[m],
                'income': float(m_income),
                'expense': float(m_expense),
                'net_savings': float(m_income - m_expense),
            })

        # Budgets for target month/year
        budgets = Budget.objects.filter(
            user=user,
            year=target_year,
            month=target_month
        )
        budget_usage = BudgetSerializer(budgets, many=True).data

        return Response({
            'period': period,
            'period_label': period_label,
            'target_month': target_month,
            'target_year': target_year,
            'income_total': float(income_total),
            'expense_total': float(expense_total),
            'net_savings': float(net_savings),
            'savings_rate': savings_rate,
            'category_breakdown': category_breakdown,
            'monthly_trends': monthly_trends,
            'budget_usage': budget_usage,
        }, status=status.HTTP_200_OK)

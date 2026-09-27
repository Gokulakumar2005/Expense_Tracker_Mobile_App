from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Budget
from .serializers import BudgetSerializer
from apps.transactions.models import Transaction

class BudgetListCreateView(generics.ListCreateAPIView):
    """
    GET /api/budgets/
    List budgets for authenticated user, with optional month and year filtering.

    POST /api/budgets/
    Create a new budget category for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BudgetSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Budget.objects.filter(user=user)

        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')

        if month:
            try:
                m_int = int(month)
                if 1 <= m_int <= 12:
                    queryset = queryset.filter(month=m_int)
            except ValueError:
                pass

        if year:
            try:
                y_int = int(year)
                queryset = queryset.filter(year=y_int)
            except ValueError:
                pass

        return queryset.order_by('-year', '-month', 'category')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/budgets/<id>/
    PUT /api/budgets/<id>/
    PATCH /api/budgets/<id>/
    DELETE /api/budgets/<id>/
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Budget deleted successfully.'},
            status=status.HTTP_200_OK
        )

class BudgetSummaryView(APIView):
    """
    GET /api/budgets/summary/?month=9&year=2026
    Returns overall monthly budget aggregation.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()

        month = request.query_params.get('month')
        year = request.query_params.get('year')

        try:
            m_int = int(month) if month else now.month
            y_int = int(year) if year else now.year
        except ValueError:
            m_int = now.month
            y_int = now.year

        budgets = Budget.objects.filter(user=user, month=m_int, year=y_int)
        total_budget = Decimal('0.00')
        total_spent = Decimal('0.00')
        exceeded_count = 0
        warning_count = 0

        for b in budgets:
            total_budget += b.amount
            spent = b.spent_amount
            total_spent += spent
            if b.is_exceeded:
                exceeded_count += 1
            elif b.is_warning:
                warning_count += 1

        remaining = total_budget - total_spent
        pct = (total_spent / total_budget * Decimal('100.0')) if total_budget > Decimal('0.00') else Decimal('0.0')

        return Response({
            'month': m_int,
            'year': y_int,
            'total_budget': float(total_budget),
            'total_spent': float(total_spent),
            'remaining_budget': float(remaining),
            'percentage_used': round(float(pct), 1),
            'budget_count': budgets.count(),
            'exceeded_count': exceeded_count,
            'warning_count': warning_count,
        }, status=status.HTTP_200_OK)

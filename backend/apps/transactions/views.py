from decimal import Decimal
from datetime import datetime
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Transaction
from .serializers import TransactionSerializer

class TransactionListCreateView(generics.ListCreateAPIView):
    """
    GET /api/transactions/
    List user transactions with filtering, search, and ordering.

    POST /api/transactions/
    Create a new transaction for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Transaction.objects.filter(user=user)

        # Filter by transaction type (INCOME / EXPENSE)
        tx_type = self.request.query_params.get('transaction_type')
        if tx_type:
            queryset = queryset.filter(transaction_type=tx_type.strip().upper())

        # Filter by category
        category = self.request.query_params.get('category')
        if category and category.lower() != 'all':
            queryset = queryset.filter(category__iexact=category.strip())

        # Filter by exact date
        exact_date = self.request.query_params.get('date')
        if exact_date:
            try:
                parsed_date = datetime.strptime(exact_date, '%Y-%m-%d').date()
                queryset = queryset.filter(transaction_date=parsed_date)
            except ValueError:
                pass

        # Filter by month and year
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month:
            try:
                m_int = int(month)
                if 1 <= m_int <= 12:
                    queryset = queryset.filter(transaction_date__month=m_int)
            except ValueError:
                pass
        if year:
            try:
                y_int = int(year)
                queryset = queryset.filter(transaction_date__year=y_int)
            except ValueError:
                pass

        # Date range filtering
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            try:
                s_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(transaction_date__gte=s_date)
            except ValueError:
                pass
        if end_date:
            try:
                e_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(transaction_date__lte=e_date)
            except ValueError:
                pass

        # Search by title or description
        search = self.request.query_params.get('search')
        if search:
            s = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=s) | Q(description__icontains=s)
            )

        # Ordering
        ordering = self.request.query_params.get('ordering', 'newest')
        ordering_map = {
            'newest': ['-transaction_date', '-created_at'],
            'oldest': ['transaction_date', 'created_at'],
            'highest': ['-amount', '-transaction_date'],
            'lowest': ['amount', '-transaction_date'],
        }
        order_fields = ordering_map.get(ordering.lower(), ['-transaction_date', '-created_at'])
        return queryset.order_by(*order_fields)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/transactions/<id>/
    PUT /api/transactions/<id>/
    PATCH /api/transactions/<id>/
    DELETE /api/transactions/<id>/

    Handles retrieving, updating, and deleting a single transaction for authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        # Strict isolation: users can ONLY access their own transactions
        return Transaction.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Transaction deleted successfully.'},
            status=status.HTTP_200_OK
        )

class CategoryListView(APIView):
    """
    GET /api/transactions/categories/
    Returns list of standard categories for expenses and incomes.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'expense_categories': Transaction.EXPENSE_CATEGORIES,
            'income_categories': Transaction.INCOME_CATEGORIES,
        }, status=status.HTTP_200_OK)

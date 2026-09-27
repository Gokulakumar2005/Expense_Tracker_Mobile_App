from rest_framework import serializers
from apps.transactions.serializers import TransactionSerializer

class CategorySummarySerializer(serializers.Serializer):
    category = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    percentage = serializers.FloatField()
    transaction_count = serializers.IntegerField()

class MonthlyTrendSerializer(serializers.Serializer):
    month = serializers.IntegerField()
    year = serializers.IntegerField()
    month_name = serializers.CharField()
    income = serializers.DecimalField(max_digits=12, decimal_places=2)
    expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_savings = serializers.DecimalField(max_digits=12, decimal_places=2)

class DashboardResponseSerializer(serializers.Serializer):
    total_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_budget = serializers.DecimalField(max_digits=12, decimal_places=2)
    remaining_budget = serializers.DecimalField(max_digits=12, decimal_places=2)
    budget_spent = serializers.DecimalField(max_digits=12, decimal_places=2)
    budget_percentage = serializers.FloatField()
    recent_transactions = TransactionSerializer(many=True)
    category_summary = CategorySummarySerializer(many=True)

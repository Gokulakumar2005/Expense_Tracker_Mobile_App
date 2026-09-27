from decimal import Decimal
from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model CRUD operations."""

    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    formatted_amount = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id',
            'user',
            'title',
            'amount',
            'formatted_amount',
            'transaction_type',
            'category',
            'description',
            'transaction_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'formatted_amount']

    def get_formatted_amount(self, obj):
        return f"{obj.amount:,.2f}"

    def validate_title(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Title cannot be blank.")
        return val

    def validate_category(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Category cannot be blank.")
        return val

    def validate_transaction_type(self, value):
        val = value.strip().upper()
        if val not in [Transaction.TYPE_INCOME, Transaction.TYPE_EXPENSE]:
            raise serializers.ValidationError("Transaction type must be 'INCOME' or 'EXPENSE'.")
        return val

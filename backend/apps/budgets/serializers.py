from decimal import Decimal
from rest_framework import serializers
from .models import Budget

class BudgetSerializer(serializers.ModelSerializer):
    """Serializer for Budget CRUD operations and calculated financial progress."""

    spent = serializers.DecimalField(source='spent_amount', max_digits=12, decimal_places=2, read_only=True)
    remaining = serializers.DecimalField(source='remaining_amount', max_digits=12, decimal_places=2, read_only=True)
    percentage_used = serializers.FloatField(read_only=True)
    is_exceeded = serializers.BooleanField(read_only=True)
    is_warning = serializers.BooleanField(read_only=True)

    class Meta:
        model = Budget
        fields = [
            'id',
            'user',
            'category',
            'amount',
            'month',
            'year',
            'spent',
            'remaining',
            'percentage_used',
            'is_exceeded',
            'is_warning',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'spent',
            'remaining',
            'percentage_used',
            'is_exceeded',
            'is_warning',
            'created_at',
            'updated_at',
        ]

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Budget amount must be greater than 0.")
        return value

    def validate_category(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Category cannot be blank.")
        return val

    def validate(self, attrs):
        request = self.context.get('request')
        user = getattr(request, 'user', None)

        category = attrs.get('category', getattr(self.instance, 'category', None))
        month = attrs.get('month', getattr(self.instance, 'month', None))
        year = attrs.get('year', getattr(self.instance, 'year', None))

        if user and category and month and year:
            existing = Budget.objects.filter(
                user=user,
                category__iexact=category.strip(),
                month=month,
                year=year
            )
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError(
                    f"A budget for '{category}' already exists for {month}/{year}."
                )

        return attrs

from django.contrib import admin
from .models import Budget

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'category', 'amount', 'month', 'year', 'spent_amount', 'remaining_amount', 'created_at')
    list_filter = ('year', 'month', 'category')
    search_fields = ('category', 'user__email')
    ordering = ('-year', '-month', 'category')

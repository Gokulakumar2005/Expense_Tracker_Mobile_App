from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'transaction_type', 'category', 'amount', 'transaction_date', 'created_at')
    list_filter = ('transaction_type', 'category', 'transaction_date', 'created_at')
    search_fields = ('title', 'description', 'user__email')
    ordering = ('-transaction_date', '-created_at')
    date_hierarchy = 'transaction_date'

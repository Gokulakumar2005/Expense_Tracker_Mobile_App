from django.urls import path
from .views import (
    TransactionListCreateView,
    TransactionDetailView,
    CategoryListView
)

urlpatterns = [
    path('', TransactionListCreateView.as_view(), name='transaction_list_create'),
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('<int:pk>/', TransactionDetailView.as_view(), name='transaction_detail'),
]

from django.urls import path
from .views import (
    BudgetListCreateView,
    BudgetDetailView,
    BudgetSummaryView,
)

urlpatterns = [
    path('', BudgetListCreateView.as_view(), name='budget_list_create'),
    path('summary/', BudgetSummaryView.as_view(), name='budget_summary'),
    path('<int:pk>/', BudgetDetailView.as_view(), name='budget_detail'),
]

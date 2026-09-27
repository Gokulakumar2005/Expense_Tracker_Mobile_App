"""
URL configuration for PocketTrack backend.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/transactions/', include('apps.transactions.urls')),
    path('api/budgets/', include('apps.budgets.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
]

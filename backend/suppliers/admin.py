from django.contrib import admin
from .models import Supplier

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'contact_email', 'phone', 'created_at')
    search_fields = ('name', 'contact_email', 'owner__username')
    list_filter = ('created_at',)
    ordering = ('-created_at',)

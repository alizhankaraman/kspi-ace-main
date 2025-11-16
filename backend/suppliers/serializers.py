from rest_framework import serializers
from .models import Supplier, LinkRequest

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'owner', 'is_active']
        read_only_fields = ['id', 'owner']

class LinkRequestSerializer(serializers.ModelSerializer):
    consumer_name = serializers.CharField(source='consumer.username', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = LinkRequest
        fields = ['id', 'consumer', 'consumer_name', 'supplier', 'supplier_name', 'status', 'created_at']
        read_only_fields = ['consumer', 'status', 'created_at']
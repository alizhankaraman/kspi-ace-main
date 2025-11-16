from django.db import models
from users.models import User
from django.conf import settings

class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='owned_suppliers',
    )
    is_active = models.BooleanField(default=True) # Owner or manager can suspend the supplier account
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({'Active and business is gettin bigger' if self.is_active else 'Inactive'})"

class LinkRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('blocked', 'Blocked'),
    ]

    consumer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='link_requests'
    )
    supplier = models.ForeignKey(
        'suppliers.Supplier',
        on_delete=models.CASCADE,
        related_name='link_requests'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # only one request per consumer
    class Meta:
        unique_together = ('consumer', 'supplier')  

    def __str__(self):
        return f"{self.consumer.username} → {self.supplier.name} ({self.status})"
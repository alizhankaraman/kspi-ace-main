from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('manager', 'Manager'),
        ('sales', 'Sales'),
        ('consumer', 'Consumer'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='consumer')
    # One supplier can have multiple users
    supplier = models.ForeignKey(
        'suppliers.Supplier',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees'
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

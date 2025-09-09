from django.conf import settings
from django.db import models

class FormTemplate(models.Model):
    name = models.CharField(max_length=150, unique=True)
    # Structure example:
    # {"fields":[{"label":"Employee ID","type":"number","required":true}, ...]}
    schema = models.JSONField(default=dict)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_forms")
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Employee(models.Model):
    form = models.ForeignKey(FormTemplate, on_delete=models.PROTECT, related_name="employees")
    data = models.JSONField(default=dict)   # dynamic key-value based on form.schema.fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_employees")
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        # Try to show a meaningful display name if available
        return str(self.data.get("Full Name") or self.data.get("Name") or f"Employee#{self.pk}")

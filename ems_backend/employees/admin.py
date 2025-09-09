from django.contrib import admin
from .models import FormTemplate, Employee

@admin.register(FormTemplate)
class FormTemplateAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "is_active", "updated_at", "created_by")
    search_fields = ("name",)

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("id", "form", "is_active", "updated_at", "created_by")
    search_fields = ("form__name",)

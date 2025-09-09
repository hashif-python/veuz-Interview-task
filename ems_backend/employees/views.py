from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import FormTemplate, Employee
from .serializers import FormTemplateSerializer, EmployeeSerializer

class IsActiveDefault(permissions.BasePermission):
    def has_permission(self, request, view):
        return True

class FormTemplateViewSet(viewsets.ModelViewSet):
    queryset = FormTemplate.objects.all().order_by("-updated_at")
    serializer_class = FormTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.filter(is_active=True).order_by("-updated_at")
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        """
        Supports dynamic filtering by query params that match data keys.
        Example: /api/employees/?Full%20Name=John&Department=Sales
        """
        qs = self.get_queryset()
        params = request.query_params.copy()
        # reserved params like page, page_size etc can be ignored here automatically
        filters = {k: v for k, v in params.items() if k.lower() not in {"page", "page_size"} and v}

        if filters:
            filtered = []
            for emp in qs:
                ok = True
                for k, v in filters.items():
                    val = str(emp.data.get(k, "")).lower()
                    if v.lower() not in val:
                        ok = False
                        break
                if ok:
                    filtered.append(emp)
            qs = filtered

        page = self.paginate_queryset(qs)
        if page is not None:
            ser = self.get_serializer(page, many=True)
            return self.get_paginated_response(ser.data)
        ser = self.get_serializer(qs, many=True)
        return Response(ser.data)

    @action(detail=True, methods=["DELETE"], url_path="soft-delete")
    def soft_delete(self, request, pk=None):
        emp = self.get_object()
        emp.is_active = False
        emp.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)

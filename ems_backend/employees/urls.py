# employees/urls.py
from rest_framework.routers import DefaultRouter
from .views import FormTemplateViewSet, EmployeeViewSet

router = DefaultRouter()
router.register(r"forms", FormTemplateViewSet, basename="formtemplate")
router.register(r"employees", EmployeeViewSet, basename="employee")

urlpatterns = router.urls  # ✅ CORRECT: this is a list of URLPattern objects

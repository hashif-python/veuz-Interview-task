from rest_framework import serializers
from .models import FormTemplate, Employee

SUPPORTED_TYPES = {"text", "number", "date", "password", "email", "tel", "textarea", "select", "checkbox"}

class FormTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormTemplate
        fields = ["id", "name", "schema", "is_active", "updated_at"]

    def validate_schema(self, schema):
        if "fields" not in schema or not isinstance(schema["fields"], list):
            raise serializers.ValidationError("schema must include a list 'fields'.")
        for f in schema["fields"]:
            if "label" not in f or "type" not in f:
                raise serializers.ValidationError("each field must include 'label' and 'type'.")
            if f["type"] not in SUPPORTED_TYPES:
                raise serializers.ValidationError(f"unsupported field type: {f['type']}")
            # optional: required flag
            if "required" in f and not isinstance(f["required"], bool):
                raise serializers.ValidationError("'required' must be boolean if provided.")
        return schema

    def create(self, validated_data):
        user = self.context["request"].user
        return FormTemplate.objects.create(created_by=user, **validated_data)

class EmployeeSerializer(serializers.ModelSerializer):
    form_name = serializers.CharField(source="form.name", read_only=True)

    class Meta:
        model = Employee
        fields = ["id", "form", "form_name", "data", "is_active", "updated_at"]

    def validate(self, attrs):
        form = attrs.get("form") or getattr(self.instance, "form", None)
        data = attrs.get("data")

        if not form:
            raise serializers.ValidationError("form is required.")

        fields = form.schema.get("fields", [])
        labels = [f["label"] for f in fields]

        # Basic validation: required fields present
        for f in fields:
            if f.get("required"):
                if f["label"] not in data or data.get(f["label"]) in [None, "", []]:
                    raise serializers.ValidationError({f["label"]: "This field is required."})

        # Optional: type checks for basic types
        for f in fields:
            label = f["label"]; ftype = f["type"]
            if label in data and data[label] is not None:
                val = data[label]
                if ftype == "number":
                    try:
                        float(val)
                    except Exception:
                        raise serializers.ValidationError({label: "Must be a number."})
                # Add more granular checks as needed

        # Remove unknown keys to keep it tidy (optional)
        cleaned = {k: v for k, v in data.items() if k in labels}
        attrs["data"] = cleaned
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        return Employee.objects.create(created_by=user, **validated_data)

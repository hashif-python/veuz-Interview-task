import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { CustomForm, Employee, FormField } from '../../types';
import { Save, ArrowLeft, User } from 'lucide-react';

type ApiForm = {
  id: number;
  name: string;
  schema: { fields: FormField[] };
  updated_at: string;
};

const EmployeeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [forms, setForms] = useState<CustomForm[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({}); // keys = field.label
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch forms (from API)
  useEffect(() => {
    const loadForms = async () => {
      try {
        const res = await api.get('/api/forms/');
        const list: ApiForm[] = Array.isArray(res.data) ? res.data : res.data.results;
        const mapped: CustomForm[] = (list || []).map((f) => ({
          id: String(f.id),
          name: f.name,
          fields: f.schema?.fields || [],
          createdAt: f.updated_at,
        }));
        setForms(mapped);
      } catch (e) {
        console.error('Failed to load forms', e);
      }
    };
    loadForms();
  }, []);

  // When editing, fetch employee and hydrate
  useEffect(() => {
    const init = async () => {
      if (!isEditing || !id) {
        setPageLoading(false);
        return;
      }
      try {
        const res = await api.get(`/api/employees/${id}/`);
        const emp: { id: number; form: number; data: Record<string, any> } = res.data;
        const formId = String(emp.form);
        setSelectedFormId(formId);
        setFormData(emp.data); // already keyed by label from backend
      } catch (e) {
        console.error('Failed to load employee', e);
      } finally {
        setPageLoading(false);
      }
    };
    init();
  }, [isEditing, id]);

  // When selectedFormId or forms change, set selected form and initial data if creating
  useEffect(() => {
    const form = forms.find((f) => f.id === selectedFormId) || null;
    setSelectedForm(form);

    if (form && !isEditing) {
      // Build empty data keyed by label
      const initial: Record<string, any> = {};
      form.fields.forEach((field) => {
        initial[field.label] = '';
      });
      setFormData(initial);
    }
  }, [selectedFormId, forms, isEditing]);

  const validateRequired = (form: CustomForm, data: Record<string, any>) => {
    const newErrors: Record<string, string> = {};
    form.fields.forEach((field) => {
      if (field.required) {
        const v = data[field.label];
        if (v === undefined || v === null || String(v).trim() === '') {
          newErrors[field.label] = `${field.label} is required`;
        }
      }
    });
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;
    setLoading(true);
    setErrors({});

    const newErrors = validateRequired(selectedForm, formData);
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        form: Number(selectedForm.id),
        data: formData, // keys must be labels
        is_active: true,
      };

      if (isEditing && id) {
        await api.put(`/api/employees/${id}/`, payload);
      } else {
        await api.post(`/api/employees/`, payload);
      }
      navigate('/employees');
    } catch (err) {
      console.error('Failed to submit employee', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (label: string, value: any) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
    if (errors[label]) setErrors((e) => ({ ...e, [label]: '' }));
  };

  const renderField = (field: FormField) => {
    const label = field.label;
    const value = formData[label] ?? '';
    const hasError = Boolean(errors[label]);
    const baseClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
      }`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(label, e.target.value)}
            className={`${baseClasses} h-24 resize-none`}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(label, e.target.value)}
            className={baseClasses}
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(label, e.target.value)}
            className={baseClasses}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  if (pageLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <User className="w-8 h-8 mr-3 text-blue-600" />
              {isEditing ? 'Edit Employee' : 'Add New Employee'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing ? 'Update employee information' : 'Create a new employee record'}
            </p>
          </div>
          <button onClick={() => navigate('/employees')} className="text-gray-600 hover:text-gray-800 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to List
          </button>
        </div>

        {!isEditing && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Form Template</label>
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a form template</option>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.name} ({form.fields.length} fields)
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedForm && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-1">Form: {selectedForm.name}</h3>
              <p className="text-sm text-blue-700">{selectedForm.fields.length} fields</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {selectedForm.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                  {errors[field.label] && <p className="mt-1 text-sm text-red-600">{errors[field.label]}</p>}
                </div>
              ))}
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {isEditing ? 'Update Employee' : 'Create Employee'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/employees')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {forms.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Form Templates Available</h3>
            <p className="text-gray-600 mb-4">Create a form template first to add employees.</p>
            <button
              onClick={() => navigate('/forms')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Form Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeForm;

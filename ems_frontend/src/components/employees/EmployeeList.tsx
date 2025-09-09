import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Employee, CustomForm } from '../../types';
import { Users, Search, Plus, Edit, Trash2, Filter, Calendar, User } from 'lucide-react';

type ApiForm = { id: number; name: string; schema: { fields: any[] }; updated_at: string };
type ApiEmployee = { id: number; form: number; form_name: string; data: Record<string, any>; updated_at: string; is_active: boolean };

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load forms and employees
  useEffect(() => {
    const load = async () => {
      try {
        const [formsRes, empRes] = await Promise.all([api.get('/api/forms/'), api.get('/api/employees/')]);

        // Forms
        const formsList: ApiForm[] = Array.isArray(formsRes.data) ? formsRes.data : formsRes.data.results;
        const mappedForms: CustomForm[] = (formsList || []).map((f) => ({
          id: String(f.id),
          name: f.name,
          fields: f.schema?.fields || [],
          createdAt: f.updated_at,
        }));
        setForms(mappedForms);

        // Employees (supports pagination in backend; handle both shapes)
        const empList: ApiEmployee[] = Array.isArray(empRes.data) ? empRes.data : empRes.data.results || [];
        setEmployees(empList);
      } catch (e) {
        console.error('Failed to load employees/forms', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filtering on client side (optional)
  const filteredEmployees = useMemo(() => {
    let data = employees;

    if (selectedForm) data = data.filter((e) => String(e.form) === selectedForm);

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter((e) =>
        Object.values(e.data || {}).some((v) => v && String(v).toLowerCase().includes(q)),
      );
    }
    return data;
  }, [employees, searchTerm, selectedForm]);

  // Server-side filter (optional improvement)
  // You can call GET /api/employees/?Label1=foo&Label2=bar to leverage backend filtering by labels.

  const serverFilter = async (labelToValue: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(labelToValue).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    const url = `/api/employees/${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await api.get(url);
    const list: ApiEmployee[] = Array.isArray(res.data) ? res.data : res.data.results || [];
    setEmployees(list);
  };

  const softDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      await api.delete(`/api/employees/${id}/soft-delete/`);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      console.error('Failed to delete employee', e);
    }
  };

  const getFormName = (idNum: number) => forms.find((f) => f.id === String(idNum))?.name || 'Unknown Form';

  const getFirstFields = (formId: number) => {
    const form = forms.find((f) => f.id === String(formId));
    return form ? form.fields.slice(0, 3) : [];
  };

  const getDisplayValue = (data: Record<string, any>, label: string) => {
    const value = data?.[label];
    if (!value) return '-';
    const s = String(value);
    return s.length > 50 ? s.slice(0, 50) + '...' : s;
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              Employee Management
            </h1>
            <p className="text-gray-600 mt-2">Manage your organization's employee records</p>
          </div>
          <Link
            to="/employees/create"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Employee
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70"
            >
              <option value="">All Forms</option>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600">
              {filteredEmployees.length} of {employees.length} employees
            </span>
          </div>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Employee #{String(employee.id).slice(-4)}</h3>
                    <p className="text-sm text-gray-600">{getFormName(employee.form)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link to={`/employees/edit/${employee.id}`} className="text-blue-600 hover:text-blue-800 p-1">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button onClick={() => softDelete(employee.id)} className="text-red-600 hover:text-red-800 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {getFirstFields(employee.form).map((field) => (
                  <div key={field.id} className="flex items-start justify-between">
                    <span className="text-sm text-gray-500 font-medium">{field.label}:</span>
                    <span className="text-sm text-gray-900 text-right flex-1 ml-2">
                      {getDisplayValue(employee.data, field.label)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Updated: {new Date(employee.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-12 text-center">
          <Users className="w-24 h-24 mx-auto mb-6 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {employees.length === 0 ? 'No Employees Yet' : 'No Employees Found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {employees.length === 0
              ? 'Get started by creating your first employee record.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {employees.length === 0 && (
            <Link
              to="/employees/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Employee
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;

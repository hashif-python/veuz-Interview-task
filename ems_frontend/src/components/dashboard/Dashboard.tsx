import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { Users, FileText, Plus, Calendar } from "lucide-react";

// API shapes from backend
type ApiForm = {
  id: number;
  name: string;
  schema: { fields: Array<{ id?: string; label: string; type: string }> };
  updated_at: string;
};
type ApiEmployee = {
  id: number;
  form: number;
  form_name: string;
  data: Record<string, any>;
  updated_at: string;
  is_active: boolean;
};

// UI shape you already use for forms
type CustomForm = {
  id: string;
  name: string;
  fields: Array<{ id?: string; label: string; type: string }>;
  createdAt?: string;
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch forms + employees from API
  useEffect(() => {
    const load = async () => {
      try {
        const [formsRes, empRes] = await Promise.all([
          api.get("/api/forms/"),
          api.get("/api/employees/"),
        ]);

        // Forms (supports both paginated & non-paginated)
        const formList: ApiForm[] = Array.isArray(formsRes.data)
          ? formsRes.data
          : formsRes.data.results || [];
        const mappedForms: CustomForm[] = (formList || []).map((f) => ({
          id: String(f.id),
          name: f.name,
          fields: f.schema?.fields || [],
          createdAt: f.updated_at,
        }));
        setForms(mappedForms);

        // Employees (supports both paginated & non-paginated)
        const empList: ApiEmployee[] = Array.isArray(empRes.data)
          ? empRes.data
          : empRes.data.results || [];
        setEmployees(empList);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Stats
  const { totalEmployees, totalForms, recentEmpCount, recentEmpList } = useMemo(() => {
    const totalForms = forms.length;
    const activeEmployees = employees.filter((e) => e.is_active !== false);
    const totalEmployees = activeEmployees.length;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recent = activeEmployees
      .filter((e) => new Date(e.updated_at) > oneWeekAgo)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    const recentEmpList = recent.slice(0, 5);
    const recentEmpCount = recent.length;

    return { totalEmployees, totalForms, recentEmpCount, recentEmpList };
  }, [forms, employees]);

  const getFormName = (formId: number) =>
    forms.find((f) => f.id === String(formId))?.name || "Unknown Form";

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold">
          Welcome back{user?.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-blue-100 mt-2">
          Here’s a quick overview of your employee management data.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Form Templates</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalForms}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent Updates (7 days)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{recentEmpCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Employees + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Employees */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Recent Employees
            </h2>
            <Link to="/employees" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentEmpList.length > 0 ? (
              recentEmpList.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Employee #{String(emp.id).slice(-4)}
                    </p>
                    <p className="text-sm text-gray-500">{getFormName(emp.form)}</p>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(emp.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent employee activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/employees/create"
              className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Add New Employee</p>
                <p className="text-sm text-gray-600">Create a new employee record</p>
              </div>
            </Link>

            <Link
              to="/forms"
              className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Manage Forms</p>
                <p className="text-sm text-gray-600">Create and edit form templates</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Forms Overview */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-600" />
            Form Templates
          </h2>
          <Link to="/forms" className="text-green-600 hover:text-green-800 text-sm font-medium">
            Manage Forms
          </Link>
        </div>

        {forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.slice(0, 6).map((form) => (
              <div
                key={form.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{form.name}</h3>
                    <p className="text-sm text-gray-500">{form.fields.length} fields</p>
                  </div>
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Updated {new Date(form.createdAt ?? form.id).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No form templates created yet</p>
            <Link
              to="/forms"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block"
            >
              Create your first form
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

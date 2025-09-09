import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "../../api/axios";
import { CustomForm, FormField } from "../../types";
import { v4 as uuidv4 } from "uuid";
import {
  Plus,
  Trash2,
  Save,
  FileText,
  Settings,
  Type,
  Hash,
  Calendar,
  Lock,
  Mail,
  AlignLeft,
  GripVertical,
  Loader2,
} from "lucide-react";

/* =========================
   Sortable Field Item
========================= */
const SortableField: React.FC<{
  field: FormField;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ field, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.id,
  });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition]
  );

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "text":
        return Type;
      case "number":
        return Hash;
      case "email":
        return Mail;
      case "password":
        return Lock;
      case "date":
        return Calendar;
      case "textarea":
        return AlignLeft;
      default:
        return Type;
    }
  };
  const Icon = getFieldIcon(field.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 rounded-lg p-4 border-2 border-transparent flex items-center justify-between"
      {...attributes}
    >
      <div className="flex items-center space-x-3">
        <button
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
          aria-label="Drag handle"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
        <Icon className="w-5 h-5 text-gray-600" />
        <div>
          <div className="font-medium text-gray-900">{field.label}</div>
          <div className="text-sm text-gray-500 capitalize">{field.type}</div>
        </div>
      </div>
      <div className="flex space-x-2">
        <button onClick={onEdit} className="text-blue-600 hover:text-blue-800">
          <Settings className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="text-red-600 hover:text-red-800">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* =========================
   Field Modal
========================= */
interface FieldModalProps {
  field: FormField | null;
  onSave: (field: FormField) => void;
  onClose: () => void;
}

const FieldModal: React.FC<FieldModalProps> = ({ field, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<FormField>>({
    type: "text",
    label: "",
    placeholder: "",
    required: false,
    options: [],
    ...field,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label?.trim() || !formData.type) return;

    onSave({
      id: field?.id || uuidv4(), // stable uuid for new fields
      type: formData.type,
      label: formData.label.trim(),
      placeholder: formData.placeholder,
      required: Boolean(formData.required),
      options: formData.type === "select" ? (formData.options || []) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {field ? "Edit Field" : "Add New Field"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as FormField["type"] })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="email">Email</option>
              <option value="password">Password</option>
              <option value="date">Date</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
            </select>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={formData.label || ""}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter field label"
              required
            />
          </div>

          {/* Placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={formData.placeholder || ""}
              onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter placeholder text"
            />
          </div>

          {/* Select Options */}
          {formData.type === "select" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (one per line)
              </label>
              <textarea
                value={(formData.options || []).join("\n")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    options: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder={"Option 1\nOption 2\nOption 3"}
              />
            </div>
          )}

          {/* Required */}
          <div className="flex items-center">
            <input
              id="required"
              type="checkbox"
              checked={Boolean(formData.required)}
              onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 text-sm text-gray-700">
              Required field
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {field ? "Update Field" : "Add Field"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================
   Main FormBuilder
========================= */
const FormBuilder: React.FC = () => {
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [currentForm, setCurrentForm] = useState<CustomForm | null>(null);
  const [formName, setFormName] = useState("");
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [loading, setLoading] = useState(false);

  // message/toast state
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [saving, setSaving] = useState(false);

  // name modal
  const [showNameModal, setShowNameModal] = useState(false);
  const [newFormName, setNewFormName] = useState("");

  // dnd sensors
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // fetch forms
  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/forms/");
        const list = Array.isArray(res.data) ? res.data : res.data.results || [];
        const loaded: CustomForm[] = list.map((f: any) => ({
          id: f.id.toString(),
          name: f.name,
          fields: f.schema?.fields || [],
          createdAt: f.updated_at,
        }));
        setForms(loaded);
      } catch (err) {
        console.error("Failed to fetch forms", err);
        setMessage("Failed to load forms.");
        setMessageType("error");
      } finally {
        setLoading(false);
        setTimeout(() => setMessage(null), 3000);
      }
    };
    fetchForms();
  }, []);

  // save form
  const saveForm = async () => {
    if (!currentForm || !formName.trim()) return;

    const payload = {
      name: formName.trim(),
      schema: { fields: currentForm.fields },
      is_active: true,
    };

    try {
      setSaving(true);
      if (currentForm.id.startsWith("temp-")) {
        const res = await api.post("/api/forms/", payload);
        const saved: CustomForm = {
          id: res.data.id.toString(),
          name: res.data.name,
          fields: res.data.schema.fields || [],
          createdAt: res.data.updated_at,
        };
        // replace temp in list
        setForms((prev) => prev.map((f) => (f.id === currentForm.id ? saved : f)));
        setCurrentForm(saved);
      } else {
        const res = await api.put(`/api/forms/${currentForm.id}/`, payload);
        const updated: CustomForm = {
          id: res.data.id.toString(),
          name: res.data.name,
          fields: res.data.schema.fields || [],
          createdAt: res.data.updated_at,
        };
        setForms((prev) => prev.map((f) => (f.id === currentForm.id ? updated : f)));
        setCurrentForm(updated);
      }
      setMessage("Form saved successfully!");
      setMessageType("success");
    } catch (err) {
      console.error("Failed to save form", err);
      setMessage("Failed to save form. Please try again.");
      setMessageType("error");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // create new (ask name first)
  const createNewForm = () => {
    setNewFormName("");
    setShowNameModal(true);
  };

  const confirmCreateForm = () => {
    const name = newFormName.trim();
    if (!name) return;
    const temp: CustomForm = {
      id: `temp-${uuidv4()}`,
      name,
      fields: [],
      createdAt: new Date().toISOString(),
    };
    setForms((prev) => [...prev, temp]);
    setCurrentForm(temp);
    setFormName(name);
    setShowNameModal(false);
  };

  // add / edit field
  const addField = (field: FormField) => {
    if (!currentForm) return;

    const newFields = editingField
      ? currentForm.fields.map((f) => (f.id === editingField.id ? field : f))
      : [...currentForm.fields, { ...field, id: uuidv4() }];

    setCurrentForm({ ...currentForm, fields: newFields });
    setShowFieldModal(false);
    setEditingField(null);
  };

  // delete field
  const deleteField = (fieldId: string) => {
    if (!currentForm) return;
    setCurrentForm({
      ...currentForm,
      fields: currentForm.fields.filter((f) => f.id !== fieldId),
    });
  };

  // dnd end
  const handleDragEnd = (event: DragEndEvent) => {
    if (!currentForm) return;
    const { active, over } = event;
    if (!active?.id || !over?.id || active.id === over.id) return;

    const oldIndex = currentForm.fields.findIndex((f) => f.id === active.id);
    const newIndex = currentForm.fields.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(currentForm.fields, oldIndex, newIndex);
    setCurrentForm({ ...currentForm, fields: reordered });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <FileText className="w-8 h-8 mr-3 text-blue-600" />
          Form Builder
        </h1>
        <p className="text-gray-600">Design dynamic forms for employee management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forms List */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Forms</h2>
            <button
              onClick={createNewForm}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New
            </button>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${messageType === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
                }`}
            >
              {message}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-2">
              {forms.map((form) => (
                <button
                  key={form.id}
                  onClick={() => {
                    setCurrentForm(form);
                    setFormName(form.name);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${currentForm?.id === form.id
                    ? "bg-blue-100 border-2 border-blue-300"
                    : "bg-gray-50 hover:bg-gray-100"
                    }`}
                >
                  <div className="font-medium text-gray-900">{form.name}</div>
                  <div className="text-sm text-gray-500">{form.fields.length} fields</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Form Editor */}
        <div className="lg:col-span-2 space-y-4">
          {currentForm ? (
            <>
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="text-2xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                      placeholder="Form Name"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowFieldModal(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Field
                    </button>
                    <button
                      onClick={saveForm}
                      disabled={saving}
                      className={`text-white px-4 py-2 rounded-lg transition-colors flex items-center ${saving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* DnD Area */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={currentForm.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {currentForm.fields.map((field) => (
                        <SortableField
                          key={field.id}
                          field={field}
                          onEdit={() => {
                            setEditingField(field);
                            setShowFieldModal(true);
                          }}
                          onDelete={() => deleteField(field.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {currentForm.fields.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No fields added yet. Click "Add Field" to get started.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-12 text-center">
              <FileText className="w-24 h-24 mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Form Selected</h3>
              <p className="text-gray-600 mb-6">
                Select a form from the list or create a new one to get started.
              </p>
              <button
                onClick={createNewForm}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Form
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Field Modal */}
      {showFieldModal && (
        <FieldModal
          field={editingField}
          onSave={addField}
          onClose={() => {
            setShowFieldModal(false);
            setEditingField(null);
          }}
        />
      )}

      {/* Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">New Form Template</h3>
            <input
              type="text"
              value={newFormName}
              onChange={(e) => setNewFormName(e.target.value)}
              placeholder="Enter form name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={confirmCreateForm}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;

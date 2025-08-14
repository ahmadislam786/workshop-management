import { useState, useEffect } from "react";
import type { Technician } from "../../types";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Wrench,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";

export const TechnicianList: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    phone: "",
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("technicians")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTechnicians(data || []);
    } catch {
      toast.error("Failed to fetch technicians");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTechnician) {
        const { error } = await supabase
          .from("technicians")
          .update(formData)
          .eq("id", editingTechnician.id);

        if (error) throw error;
        toast.success("Technician updated successfully");
      } else {
        const { error } = await supabase.from("technicians").insert([formData]);

        if (error) throw error;
        toast.success("Technician created successfully");
      }

      setShowForm(false);
      setEditingTechnician(null);
      resetForm();
      fetchTechnicians();
    } catch {
      toast.error("Failed to save technician");
    }
  };

  const handleEdit = (technician: Technician) => {
    setEditingTechnician(technician);
    setFormData({
      name: technician.name,
      email: technician.email,
      specialization: technician.specialization || "",
      phone: technician.phone || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this technician?")) return;

    try {
      const { error } = await supabase
        .from("technicians")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Technician deleted successfully");
      fetchTechnicians();
    } catch {
      toast.error("Failed to delete technician");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      specialization: "",
      phone: "",
    });
  };

  const filteredTechnicians = technicians.filter(
    (technician) =>
      technician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.specialization
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Technicians</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Technician
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search technicians..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingTechnician ? "Edit Technician" : "New Technician"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <Input
                placeholder="Specialization"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
              />
              <Input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {editingTechnician ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTechnician(null);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredTechnicians.length === 0 ? (
        <div className="text-center py-12">
          <Wrench className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500 text-lg">No technicians found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTechnicians.map((technician) => (
            <div
              key={technician.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {technician.name}
                      </h3>
                      {technician.specialization && (
                        <p className="text-sm text-blue-600 font-medium">
                          {technician.specialization}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {technician.email}
                    </div>
                    {technician.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {technician.phone}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        Available for assignments
                      </span>
                    </div>
                    <div className="flex items-center bg-blue-100 px-2 py-1 rounded-full">
                      <Wrench className="h-3 w-3 text-blue-600 mr-1" />
                      <span className="text-xs font-medium text-blue-700">
                        {technician.job_count} jobs
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(technician)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(technician.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

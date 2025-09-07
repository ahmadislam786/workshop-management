import React, { useState } from "react";
import { useTechnicianSkills } from "@/hooks/useTechnicianSkills";
import { useLanguage } from "@/contexts/language-context";
import { Input } from "@/components/ui/Input";
import { Search, User, Wrench, Target, Award, TrendingUp } from "lucide-react";

export const TechnicianSkillsManager: React.FC = () => {
  const { t } = useLanguage();
  const { skills, technicianSkills, loading } = useTechnicianSkills();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all",
    "engine",
    "mechanical",
    "body",
    "tires",
    "safety",
    "diagnostics",
  ];

  const getSkillCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      engine: "bg-red-100 text-red-800 border-red-200",
      mechanical: "bg-blue-100 text-blue-800 border-blue-200",
      body: "bg-green-100 text-green-800 border-green-200",
      tires: "bg-yellow-100 text-yellow-800 border-yellow-200",
      safety: "bg-purple-100 text-purple-800 border-purple-200",
      diagnostics: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const filteredTechnicians = technicianSkills.filter(tech => {
    const matchesSearch =
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.skills.some(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" ||
      tech.skill_categories.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("technicians.skillsManager")}
          </h2>
          <p className="text-gray-600 mt-1">
            {t("technicians.skillsManagerDesc")}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">
              {technicianSkills.length} {t("technicians.title")}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600">
              {skills.length} {t("technicians.skills")}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={t("technicians.searchSkills")}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category === "all" ? t("technicians.allCategories") : category}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("technicians.availableSkills")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {skills.map(skill => (
            <div
              key={skill.id}
              className={`p-3 rounded-lg border ${getSkillCategoryColor(
                skill.category
              )}`}
            >
              <div className="font-medium text-sm">{skill.name}</div>
              <div className="text-xs opacity-75 mt-1">{skill.category}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTechnicians.map(technician => (
          <div
            key={technician.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {technician.name}
                  </h3>
                  <p className="text-sm text-gray-600">{technician.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Wrench className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {technician.job_count}
                </span>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  {t("technicians.skills")} ({technician.skill_count})
                </h4>
                <span className="text-gray-500 text-sm">
                  {t("technicians.manage")}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {technician.skills.slice(0, 4).map(skill => (
                  <span
                    key={skill.id}
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getSkillCategoryColor(
                      skill.category
                    )}`}
                  >
                    {skill.name}
                  </span>
                ))}
                {technician.skills.length > 4 && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    +{technician.skills.length - 4} {t("technicians.more")}
                  </span>
                )}
              </div>
            </div>

            {/* Skill Categories */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {t("technicians.specializations")}
                </span>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">
                    {technician.skill_categories.length}{" "}
                    {t("technicians.categories")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTechnicians.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500 text-lg">
            {t("technicians.noTechniciansFound")}
          </p>
          <p className="text-gray-400 text-sm">
            {t("technicians.tryDifferentSearch")}
          </p>
        </div>
      )}
    </div>
  );
};

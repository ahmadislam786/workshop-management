import React, { useState } from "react";
import { useTechnicianSkills } from "@/hooks/useTechnicianSkills";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Search,
  User,
  Wrench,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
} from "lucide-react";

interface Job {
  id: string;
  service_type: string;
  customer_name: string;
  vehicle_info: string;
  status: string;
  scheduled_start?: string;
  scheduled_end?: string;
}

interface SkillRecommendation {
  technician_id: string;
  technician_name: string;
  email: string;
  matched_skills: string;
  skill_match_count: number;
  total_skills: number;
  match_percentage: number;
}

export const SkillBasedJobAssignment: React.FC = () => {
  const { t } = useLanguage();
  const { skills, technicianSkills, loading, findTechniciansBySkills } =
    useTechnicianSkills();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Sample jobs for demonstration
  const sampleJobs: Job[] = [
    {
      id: "job-001",
      service_type: "Brake Service",
      customer_name: "Hans Mueller",
      vehicle_info: "BMW 3 Series (M-AB 123)",
      status: "pending",
      scheduled_start: "2024-01-15T09:00:00Z",
    },
    {
      id: "job-002",
      service_type: "Timing Belt Replacement",
      customer_name: "Maria Schmidt",
      vehicle_info: "Mercedes C-Class (M-CD 456)",
      status: "pending",
    },
    {
      id: "job-003",
      service_type: "Suspension Check",
      customer_name: "Peter Weber",
      vehicle_info: "Audi A4 (M-EF 789)",
      status: "pending",
    },
    {
      id: "job-004",
      service_type: "Glass Replacement",
      customer_name: "Anna Fischer",
      vehicle_info: "Volkswagen Golf (M-GH 012)",
      status: "pending",
    },
    {
      id: "job-005",
      service_type: "Vehicle Inspection",
      customer_name: "Thomas Wagner",
      vehicle_info: "Ford Focus (M-IJ 345)",
      status: "pending",
    },
  ];

  const extractSkillsFromJob = (serviceType: string): string[] => {
    const serviceTypeLower = serviceType.toLowerCase();
    const extractedSkills: string[] = [];

    if (serviceTypeLower.includes("brake")) extractedSkills.push("brakes");
    if (serviceTypeLower.includes("timing"))
      extractedSkills.push("timing belt");
    if (serviceTypeLower.includes("suspension"))
      extractedSkills.push("suspension");
    if (serviceTypeLower.includes("glass")) extractedSkills.push("glass");
    if (serviceTypeLower.includes("tire") || serviceTypeLower.includes("tyre"))
      extractedSkills.push("tyres");
    if (serviceTypeLower.includes("inspection"))
      extractedSkills.push("inspection");
    if (serviceTypeLower.includes("body")) extractedSkills.push("body work");
    if (
      serviceTypeLower.includes("failure") ||
      serviceTypeLower.includes("diagnostic")
    )
      extractedSkills.push("failure search");

    return extractedSkills.length > 0 ? extractedSkills : ["failure search"];
  };

  const handleJobSelect = async (job: Job) => {
    setSelectedJob(job);
    const requiredSkills = extractSkillsFromJob(job.service_type);
    setSelectedSkills(requiredSkills);

    try {
      const recommendations = await findTechniciansBySkills(requiredSkills);
      setRecommendations(recommendations);
      setShowRecommendations(true);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
    }
  };

  const handleSkillToggle = async (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];

    setSelectedSkills(newSkills);

    if (newSkills.length > 0) {
      try {
        const recommendations = await findTechniciansBySkills(newSkills);
        setRecommendations(recommendations);
      } catch (error) {
        console.error("Failed to get recommendations:", error);
      }
    }
  };

  const getSkillCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      engine: "bg-red-100 text-red-800",
      mechanical: "bg-blue-100 text-blue-800",
      body: "bg-green-100 text-green-800",
      tires: "bg-yellow-100 text-yellow-800",
      safety: "bg-purple-100 text-purple-800",
      diagnostics: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getMatchQuality = (percentage: number) => {
    if (percentage >= 80) return { color: "text-green-600", icon: CheckCircle };
    if (percentage >= 60) return { color: "text-yellow-600", icon: Clock };
    return { color: "text-red-600", icon: AlertCircle };
  };

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
            {t("jobs.skillBasedAssignment")}
          </h2>
          <p className="text-gray-600 mt-1">
            {t("jobs.skillBasedAssignmentDesc")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">
            {technicianSkills.length} {t("technicians.title")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Jobs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("jobs.availableJobs")}
          </h3>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={t("jobs.searchJobs")}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sampleJobs
              .filter(
                job =>
                  job.service_type
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  job.customer_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  job.vehicle_info
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map(job => (
                <div
                  key={job.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedJob?.id === job.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                  onClick={() => handleJobSelect(job)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {job.service_type}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.customer_name} • {job.vehicle_info}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        {extractSkillsFromJob(job.service_type).map(skill => (
                          <span
                            key={skill}
                            className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          job.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : job.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Skill Selection & Recommendations */}
        <div className="space-y-4">
          {selectedJob && (
            <>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("jobs.requiredSkills")}
              </h3>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {selectedJob.service_type}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {selectedJob.customer_name} • {selectedJob.vehicle_info}
                </p>

                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <button
                      key={skill.id}
                      onClick={() => handleSkillToggle(skill.name)}
                      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                        selectedSkills.includes(skill.name)
                          ? "bg-blue-600 text-white"
                          : getSkillCategoryColor(skill.category)
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {showRecommendations && (
            <>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("jobs.recommendedTechnicians")}
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recommendations.map(rec => {
                  const matchQuality = getMatchQuality(rec.match_percentage);
                  const MatchIcon = matchQuality.icon;

                  return (
                    <div
                      key={rec.technician_id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {rec.technician_name}
                            </h4>
                            <p className="text-sm text-gray-600">{rec.email}</p>
                            <div className="flex items-center mt-2 space-x-2">
                              <Wrench className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {rec.matched_skills}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-1">
                            <MatchIcon
                              className={`h-4 w-4 ${matchQuality.color}`}
                            />
                            <span
                              className={`text-sm font-medium ${matchQuality.color}`}
                            >
                              {rec.match_percentage}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-xs text-gray-500">
                              {rec.skill_match_count}/{rec.total_skills}{" "}
                              {t("jobs.skills")}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              // Handle job assignment (implementation elsewhere)
                            }}
                          >
                            {t("jobs.assign")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

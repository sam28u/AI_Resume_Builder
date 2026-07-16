export type Profile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
};

export type Education = {
  id: string;
  userId: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
};

export type Experience = {
  id: string;
  userId: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string | null;
  descriptionBullets: string[];
};

export type SkillItem = {
  name: string;
  proficiency?: "beginner" | "intermediate" | "advanced" | "expert";
  yearsOfExperience?: number;
};

export type Skill = {
  id: string;
  userId: string;
  category: string;
  items: SkillItem[];
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  userId: string;
  name: string;
  description: string;
  technologies: string[];
  link: string | null;
  githubLink: string | null;
};

export type Resume = {
  id: string;
  userId: string;
  jobDescription: string;
  generatedContent: any;
  createdAt: string;
};

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};
export const setAccessToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
};

export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
  }
};
async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken();
  let res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401 || res.status === 500) {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      setAccessToken(refreshData.accessToken);
      res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
          Authorization: `Bearer ${refreshData.accessToken}`,
        },
      });
    } else {
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }
  return res;
}

async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetchWithAuth(url, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error at ${url}`);
  }
  return res.json();
}

export const getProfile = () => apiRequest<Profile | null>("/api/profile");

export const updateProfileBasicInfo = (data: {
  firstName?: string;
  lastName?: string;
}) =>
  apiRequest<Profile>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const updateProfileSocials = (data: {
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}) =>
  apiRequest<Profile>("/api/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getEducations = () =>
  apiRequest<{ education: Education[] }>("/api/education").then(
    (res) => res.education,
  );

export const createEducation = (data: Omit<Education, "id" | "userId">) =>
  apiRequest<{ education: Education }>("/api/education", {
    method: "POST",
    body: JSON.stringify(data),
  }).then((res) => res.education);

export const updateEducation = (data: Partial<Education> & { id: string }) =>
  apiRequest<{ education: Education }>("/api/education", {
    method: "PATCH",
    body: JSON.stringify(data),
  }).then((res) => res.education);

export const deleteEducation = (id: string) =>
  apiRequest<{ message: string }>(`/api/education?id=${id}`, {
    method: "DELETE",
  });

export const getExperiences = () => apiRequest<Experience[]>("/api/experience");

export const createExperience = (data: Omit<Experience, "id" | "userId">) =>
  apiRequest<Experience>("/api/experience", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateExperience = (data: Partial<Experience> & { id: string }) =>
  apiRequest<Experience>("/api/experience", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteExperience = (id: string) =>
  apiRequest<{ message: string }>("/api/experience", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });

export const getProjects = () => apiRequest<Project[]>("/api/project");

export const createProject = (data: Omit<Project, "id" | "userId">) =>
  apiRequest<Project>("/api/project", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateProject = (data: Partial<Project> & { projectId: string }) =>
  apiRequest<Project>("/api/project", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteProject = (projectId: string) =>
  apiRequest<{ message: string }>(`/api/project?projectId=${projectId}`, {
    method: "DELETE",
  });

export const getSkills = () => apiRequest<Skill[]>("/api/skill");

export const createSkillCategory = (data: {
  category: string;
  items: SkillItem[];
}) =>
  apiRequest<Skill>("/api/skill", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateSkillCategory = (data: {
  skillId: string;
  category?: string;
  items?: SkillItem[];
}) =>
  apiRequest<Skill>("/api/skill", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteSkillCategory = (skillId: string) =>
  apiRequest<{ message: string }>(`/api/skill?skillId=${skillId}`, {
    method: "DELETE",
  });

export const addSkillItem = (data: { skillId: string; item: SkillItem }) =>
  apiRequest<Skill>("/api/skill/item", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteSkillItem = (skillId: string, itemName: string) =>
  apiRequest<Skill>(
    `/api/skill/item?skillId=${skillId}&itemName=${encodeURIComponent(itemName)}`,
    { method: "DELETE" },
  );

export const getResumes = () => apiRequest<Resume[]>("/api/resumes");

export const createResume = (data: {
  jobDescription: string;
  generatedContent: any;
}) =>
  apiRequest<Resume>("/api/resumes", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getUserEmail = () => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      return userObj.email; // Here is your email!
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const generateAndDownloadResume = async (
  jobDescription: string,
  filename: string = "tailored-resume.pdf",
): Promise<void> => {
  const token = getAccessToken();

  const res = await fetch("/api/generate-resume", {
    // Adjust the URL if your API route is different
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ jobDescription }),
  });

  if (res.status === 401) {
    // Attempt token refresh logic as defined in your fetchWithAuth helper
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      setAccessToken(refreshData.accessToken);

      // Retry the request with the new token
      const retryRes = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshData.accessToken}`,
        },
        body: JSON.stringify({ jobDescription }),
      });

      if (!retryRes.ok) {
        throw new Error("Failed to generate resume after token refresh");
      }

      return handlePdfDownload(retryRes, filename);
    } else {
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Authentication failed");
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate resume");
  }

  return handlePdfDownload(res, filename);
};

// Helper function to handle the Blob conversion and download trigger
const handlePdfDownload = async (
  response: Response,
  filename: string,
): Promise<void> => {
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

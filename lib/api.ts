export type Resume = {
  id: string;
  jobDescription: string;
  generatedContent: string;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  createdAt: string;
}

export type Profile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link?: string;
  githubLink?: string;
};

export type Skill = {
  id: string;
  name: string;
  category?: string;
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

export const getResumes = () => apiRequest<Resume[]>("/api/resumes");
export const getProfile = () => apiRequest<Profile>("/api/profile");
export const getExperiences = () => apiRequest<Experience[]>("/api/experience");
export const getEducations = () => apiRequest<Education[]>("/api/education");
export const getProjects = () => apiRequest<Project[]>("/api/project");
export const getSkills = () => apiRequest<Skill[]>("/api/skill");
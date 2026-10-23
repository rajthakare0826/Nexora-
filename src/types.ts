export interface UserProfile {
  fullName?: string;
  currentRole?: string;
  targetRole?: string;
  experienceYears?: string;
  skills?: string[];
  education?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  modelUsed?: string;
  botRole?: string;
}

export interface ResumeAnalysis {
  id?: string;
  userId: string;
  timestamp: number;
  fileName?: string;
  targetRole: string;
  sequence?: "fresher" | "experienced" | "switcher";
  sequenceFeedback?: string;
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses?: string[];
  improvements: string[];
  missingKeywords: string[];
  recommendedRoles?: string[];
  extractedText?: string;
  sectionAnalysis: {
    contact: string;
    experience: string;
    skills: string;
    education: string;
  };
  suggestedFormatting: string;
}

export interface RoadmapPhase {
  phaseName: string;
  duration: string;
  description: string;
  milestones: string[];
  recommendedTopics: string[];
  actionableProject: {
    title: string;
    brief: string;
  };
  freeResources: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

export interface CareerRoadmap {
  id?: string;
  userId: string;
  timestamp: number;
  career: string;
  currentLevel: string;
  title: string;
  description: string;
  phases: RoadmapPhase[];
  estimatedSalaryRange: string;
  requiredCertifications: string[];
  nextStepsAdvice: string;
}

export interface InterviewQA {
  phase?: string;
  question: string;
  answer: string;
  feedback?: {
    rating: number; // out of 100
    score?: number; // out of 10
    categoryScores?: {
      technical?: number;
      problemSolving?: number;
      communication?: number;
      programming?: number;
      projectKnowledge?: number;
      behavioral?: number;
    };
    strengths: string[];
    gaps?: string[];
    weaknesses?: string[];
    modelAnswer: string;
    communicationTips?: string;
    confidenceTips?: string;
    nextQuestion?: string;
    nextPhase?: string;
    adaptiveNote?: string;
  };
}

export interface InterviewFinalReport {
  overallScore: number; // 0-100
  breakdown: {
    technical: number; // /30
    problemSolving: number; // /20
    communication: number; // /15
    programming: number; // /15
    projectKnowledge: number; // /10
    behavioral: number; // /10
  };
  top3Strengths: string[];
  top3ImprovementAreas: string[];
  technologiesToRevise: string[];
  questionsToPractice: string[];
  personalized7DayPlan: Array<{
    day: number;
    title: string;
    focus: string;
    tasks: string[];
  }>;
  struggledQuestions: string[];
  recommendedTopics: string[];
  transcriptSummary: string;
  hiringReadiness: "Strong Hire" | "Hire" | "Leaning Hire" | "Consider" | "Needs Improvement";
  justification: string;
  integrityObservations?: string[];
}

export interface InterviewSession {
  id?: string;
  userId: string;
  timestamp: number;
  candidateName?: string;
  role: string;
  experienceLevel?: string;
  yearsOfExperience?: string;
  technicalSkills?: string;
  resumeText?: string;
  interviewType?: string;
  difficulty?: string;
  durationMinutes?: number;
  company?: string;
  qaList: InterviewQA[];
  currentQuestion: string;
  isCompleted: boolean;
  averageScore?: number;
  finalReport?: InterviewFinalReport | any;
}

export interface MissingSkill {
  name: string;
  category: string;
  importance: "High" | "Medium" | "Low";
  description: string;
}

export interface SkillGapLearningStep {
  step: string;
  title: string;
  duration: string;
  topics: string[];
  resources: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

export interface SkillGapProject {
  title: string;
  description: string;
  skillsAcquired: string[];
  complexity: "Beginner" | "Intermediate" | "Advanced";
}

export interface SkillGapCertification {
  name: string;
  issuer: string;
  estimatedCost: string;
  valueToCareer: string;
}

export interface SkillGapReport {
  id?: string;
  userId: string;
  timestamp: number;
  targetCareer: string;
  currentEducation: string;
  currentSkills: string[];
  missingSkills: MissingSkill[];
  learningPath: SkillGapLearningStep[];
  recommendedProjects: SkillGapProject[];
  recommendedCertifications: SkillGapCertification[];
  estimatedLearningTime: string;
  careerReadinessScore: number;
  overallSummary: string;
}

export interface GeneratedResume {
  id?: string;
  userId?: string;
  timestamp: number;
  targetRole: string;
  sequence: "fresher" | "experienced" | "switcher";
  templateStyle: "modern" | "classic" | "minimal";
  fullName: string;
  markdownResume: string;
  atsScoreEstimate: number;
  atsHighlights: string[];
  proTips: string[];
  structuredData?: {
    personalInfo: {
      fullName: string;
      email: string;
      phone: string;
      location: string;
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
    summary: string;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      gpa?: string;
      coursework?: string;
    }>;
    skills: {
      languages: string[];
      frameworks: string[];
      databasesCloud: string[];
      developerTools: string[];
      coreCompetencies: string[];
    };
    projects: Array<{
      title: string;
      techStack: string;
      link?: string;
      bulletPoints: string[];
    }>;
    experience: Array<{
      role: string;
      company: string;
      duration: string;
      location?: string;
      bulletPoints: string[];
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      year?: string;
    }>;
    achievements: string[];
  };
}

export interface ResumeBuilderFormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  targetRole: string;
  sequence: "fresher" | "experienced" | "switcher";
  templateStyle: "modern" | "classic" | "minimal";
  careerObjective: string;
  degree: string;
  institution: string;
  gradYear: string;
  gpa: string;
  coursework: string;
  skillsLanguages: string;
  skillsFrameworks: string;
  skillsDatabases: string;
  skillsTools: string;
  project1Title: string;
  project1Stack: string;
  project1Desc: string;
  project1Link: string;
  project2Title: string;
  project2Stack: string;
  project2Desc: string;
  project2Link: string;
  experienceRole: string;
  experienceCompany: string;
  experienceDuration: string;
  experienceDesc: string;
  certifications: string;
  achievements: string;
  customInstructions: string;
}

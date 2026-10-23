import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mammoth from "mammoth";
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, orderBy } from "firebase/firestore";
import { 
  db,
  getMicrosoftConfig, 
  saveMicrosoftConfig, 
  disconnectMicrosoft, 
  getMicrosoftAuthUrl, 
  handleMicrosoftAuthCallback, 
  appendContactToExcel, 
  getExcelContactTickets, 
  updateExcelTicketStatus, 
  syncFirestoreTicketsToExcel 
} from "./server/microsoftExcel";
import {
  getGoogleConfig,
  saveGoogleConfig,
  disconnectGoogle,
  getGoogleAuthUrl,
  handleGoogleAuthCallback,
  appendContactToGoogleSheets,
  updateGoogleRowStatus,
  syncAllFirestoreContactsToGoogleSheets
} from "./server/googleSheets";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload size limit for base64 resume uploads
app.use(express.json({ limit: "15mb" }));

// Lazy initializer for GoogleGenAI
let aiInstance: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it via the Secrets settings.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

// -----------------------------------------------------------------
// 1. CHAT ENDPOINT (Multi-turn conversation with Gemini & Role System Instructions)
// -----------------------------------------------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userProfile, model: requestedModel, role: requestedRole } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiAI();

    // Map allowed models: gemini-3.1-pro-preview for complex tasks, gemini-3.5-flash for general, gemini-3.1-flash-lite for fast tasks
    const validModels = ["gemini-3.1-pro-preview", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
    let targetModel = validModels.includes(requestedModel) ? requestedModel : "gemini-3.5-flash";

    // Build role-specific system instruction
    const userProfileContext = userProfile ? `\nUser Profile Context:\n${JSON.stringify(userProfile, null, 2)}\n` : "";
    
    let roleInstruction = "";
    switch (requestedRole) {
      case "tech_interviewer":
        roleInstruction = `You are "Nexora Tech Interviewer", a Principal Software Engineer & FAANG-level Technical Interview Bar Raiser.
Your role:
- Conduct rigorous, realistic coding and system design interview evaluations.
- Probe candidate problem-solving logic, algorithm selection, and edge case handling.
- When evaluating solutions or code snippets, always analyze Time and Space Complexity in Big-O notation.
- Suggest architectural trade-offs, scalability patterns (caching, sharding, message queues), and clean code refactoring.
- Challenge the user with thought-provoking follow-up questions to test deep comprehension.
- End every response with 2-3 focused "⚡ Technical Exercises" or problem-solving tasks.`;
        break;

      case "resume_specialist":
        roleInstruction = `You are "Nexora Resume & ATS Architect", an Executive Technical Recruiter and Talent Acquisition Lead.
Your role:
- Critically audit resumes, bullet points, and project summaries for maximum ATS (Applicant Tracking System) impact.
- Transform passive descriptions into active accomplishments using the Google X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]".
- Identify missing high-frequency tech keywords, action verbs, and quantify business metrics ($ revenue saved, % latency reduction, QPS throughput).
- Provide side-by-side Before vs. After bullet point rewrites.
- End every response with "📋 Actionable Resume Refinements" with 3 immediate edits to execute.`;
        break;

      case "behavioral_coach":
        roleInstruction = `You are "Nexora Executive HR & Behavioral Coach", an HR Director and Leadership Development Specialist.
Your role:
- Coach candidates on behavioral, leadership, and culture-fit interview questions.
- Strictly train candidates to structure responses using the STAR method (Situation, Task, Action, Result) with explicit markdown headers.
- Help candidates identify red flags in their stories (rambling, negative blame, lack of clear personal contribution).
- Provide feedback on communication tone, executive presence, and emotional intelligence (EQ).
- End every response with "⭐ STAR Practice Prompt" for their next drill.`;
        break;

      case "concept_explainer":
        roleInstruction = `You are "Nexora Concept Demystifier", an award-winning Computer Science and Cloud Computing Educator.
Your role:
- Explain complex, intimidating software and AI concepts (Transformers, Vector Embeddings, Kubernetes, Raft consensus, OAuth2, GraphQL, Zero-Trust Architecture) in crystal-clear, jargon-free English.
- Always lead with a vivid, memorable, intuitive real-world analogy before introducing the technical mechanics.
- Keep explanations structured, engaging, and digestible without sacrificing technical precision.
- Include a quick "🧠 Mental Model Summary" and 2 practical real-world use cases in production.`;
        break;

      case "career_coach":
      default:
        roleInstruction = `You are "Nexora Career Coach", an elite, empathetic Senior IT & AI Career Coach, HR Consultant, and Professional Development Specialist.
Your mission is to provide highly personalized, actionable, encouraging, and practical career guidance.

You MUST strictly follow these directives:
1. ASK FOLLOW-UP QUESTIONS: If you need more background, ask 1-2 friendly, direct clarifying questions.
2. HYPER-PERSONALIZATION: Anchor advice around the candidate's exact education, skills, target role, and experience level.
3. STEP-BY-STEP ROADMAPS: Structure learning paths chronologically with estimated timelines and milestone topics.
4. FREE LEARNING RESOURCES: Recommend top-tier, completely free courses and documentations (CS50, FreeCodeCamp, Microsoft Learn, YouTube).
5. PORTFOLIO PROJECTS: Propose unique, production-grade project ideas with tech architectures and key APIs.
6. CERTIFICATIONS: Recommend recognized, industry-respected certifications matching their path.
7. CLEAR "NEXT STEPS" SECTION: Every response MUST end with a dedicated markdown section labeled "📋 Next Steps" featuring 3-4 concrete action items.`;
        break;
    }

    const fullSystemInstruction = `${roleInstruction}
${userProfileContext}
Formatting:
- Use clear Markdown headings (###), bold key phrases, and structured bullet points.
- Maintain a highly professional, encouraging, practical, and elite coaching tone.`;

    // Format chat history for Gemini API preserving multi-turn continuity
    const contents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    let actualModelUsed = targetModel;
    let responseText = "";

    try {
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: contents,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: targetModel === "gemini-3.1-pro-preview" ? 0.4 : 0.7,
        }
      });
      responseText = response.text || "I was unable to formulate a response. Please try asking again.";
    } catch (modelError: any) {
      // If a complex model (e.g. gemini-3.1-pro-preview) triggers a quota or permission issue, fallback gracefully to gemini-3.5-flash
      if (targetModel !== "gemini-3.5-flash") {
        console.warn(`Model ${targetModel} failed, falling back to gemini-3.5-flash:`, modelError.message);
        actualModelUsed = "gemini-3.5-flash";
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contents,
          config: {
            systemInstruction: fullSystemInstruction,
            temperature: 0.7,
          }
        });
        responseText = fallbackResponse.text || "I was unable to formulate a response. Please try asking again.";
      } else {
        throw modelError;
      }
    }

    res.json({
      role: "assistant",
      content: responseText,
      modelUsed: actualModelUsed
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during career counseling." });
  }
});

// -----------------------------------------------------------------
// 2. RESUME ANALYZER ENDPOINT
// -----------------------------------------------------------------
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { resumeText, fileBase64, fileName, mimeType, targetRole, sequence = "fresher" } = req.body;
    const ai = getGeminiAI();

    let parts: any[] = [];
    let isDocx = false;
    let extractedDocxText = "";

    // Support DOCX files through Mammoth text extraction on the server
    if (fileBase64 && (mimeType?.includes("officedocument") || fileName?.toLowerCase().endsWith(".docx"))) {
      isDocx = true;
      try {
        const buffer = Buffer.from(fileBase64, "base64");
        const mammothResult = await mammoth.extractRawText({ buffer });
        extractedDocxText = mammothResult.value;
      } catch (err: any) {
        console.error("Mammoth DOCX parsing failed:", err);
        return res.status(400).json({ error: "Failed to extract text from your DOCX file. Please upload a standard PDF or copy-paste text." });
      }
    }

    const sequenceInstruction = sequence === "fresher"
      ? `The candidate is targeting the "Fresher" resume sequence (Entry-Level / Student / College Graduate / 0-2 yrs experience).
In the standard "Fresher" resume sequence:
- Optimal Section Order: 1. Contact Information & Links -> 2. Career Objective / Summary -> 3. Education & Academic Performance -> 4. Technical Skills & Tools -> 5. Academic & Capstone Projects -> 6. Internships / Training -> 7. Certifications -> 8. Extracurriculars & Achievements.
- DO NOT penalize the candidate for lacking 5+ years of full-time corporate experience.
- Emphasize academic projects, tech stack breadth, problem-solving, coursework, certifications, and GitHub/Portfolio links.
- Provide targeted sequence feedback in "sequenceFeedback" evaluating how well the resume conforms to the recommended Fresher section sequence.`
      : `The candidate has selected the "${sequence}" resume sequence. Evaluate ATS performance, keyword density, and section flow according to this profile. Provide targeted sequence advice under "sequenceFeedback".`;

    if (fileBase64 && mimeType && !isDocx) {
      // PDF or other natively supported multimodal format
      parts.push({
        inlineData: {
          data: fileBase64,
          mimeType: mimeType
        }
      });
      parts.push({
        text: `You are an elite ATS (Applicant Tracking System) Analyzer and Senior HR Recruiter. 
Analyze this uploaded resume for the target career role: "${targetRole || "General/Not Specified"}".
Selected Resume Sequence Profile: "${sequence}".

${sequenceInstruction}

Perform a rigorous ATS evaluation and deliver the result strictly as a valid JSON object. Do not include any markdown wrap like \`\`\`json outside of standard JSON output, just pure JSON or standard JSON markdown block.

You MUST extract the full text of the resume and return it under the "extractedText" field.
Suggest suitable IT and AI job roles for this person's profile, and highlight both strengths and weaknesses clearly.

The output JSON MUST follow this exact schema:
{
  "atsScore": number (0 to 100),
  "summary": "overall concise 2-3 sentence overview",
  "sequence": "${sequence}",
  "sequenceFeedback": "Detailed feedback on section ordering and adherence to the ${sequence} resume sequence",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "improvements": ["actionable improvement 1", "actionable improvement 2", "actionable improvement 3"],
  "missingKeywords": ["keyword 1", "keyword 2"],
  "recommendedRoles": ["suitable IT/AI job role 1", "suitable IT/AI job role 2", "suitable IT/AI job role 3"],
  "extractedText": "the full extracted readable text from the resume PDF, preserved with newlines",
  "sectionAnalysis": {
    "contact": "Excellent / Needs detail...",
    "experience": "Critique of career progression/internships/projects and active verb usage...",
    "skills": "Critique of technical or professional skills list...",
    "education": "Critique of formatting and completeness..."
  },
  "suggestedFormatting": "Short advice on resume template, styling, and structural format."
}`
      });
    } else {
      // Text input or Extracted DOCX text
      const activeText = isDocx ? extractedDocxText : resumeText;
      parts.push({
        text: `You are an elite ATS (Applicant Tracking System) Analyzer and Senior HR Recruiter.
Analyze the following text resume for the target career role: "${targetRole || "General/Not Specified"}".
Selected Resume Sequence Profile: "${sequence}".

${sequenceInstruction}

Resume Text:
---
${activeText}
---

Perform a rigorous ATS evaluation and deliver the result strictly as a valid JSON object. Do not include any markdown wrap like \`\`\`json outside of standard JSON output, just pure JSON or standard JSON markdown block.

The output JSON MUST follow this exact schema:
{
  "atsScore": number (0 to 100),
  "summary": "overall concise 2-3 sentence overview",
  "sequence": "${sequence}",
  "sequenceFeedback": "Detailed feedback on section ordering and adherence to the ${sequence} resume sequence",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "improvements": ["actionable improvement 1", "actionable improvement 2", "actionable improvement 3"],
  "missingKeywords": ["keyword 1", "keyword 2"],
  "recommendedRoles": ["suitable IT/AI job role 1", "suitable IT/AI job role 2", "suitable IT/AI job role 3"],
  "extractedText": "the full clean readable text from the resume, preserved with newlines",
  "sectionAnalysis": {
    "contact": "Excellent / Needs detail...",
    "experience": "Critique of career progression/internships/projects and active verb usage...",
    "skills": "Critique of technical or professional skills list...",
    "education": "Critique of formatting and completeness..."
  },
  "suggestedFormatting": "Short advice on resume template, styling, and structural format."
}`
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: parts,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const textOutput = response.text || "{}";
    try {
      const parsedData = JSON.parse(textOutput);
      res.json(parsedData);
    } catch (parseErr) {
      // Clean potential JSON markdown blocks and parse
      const cleaned = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleaned));
    }
  } catch (error: any) {
    console.error("Resume Analyzer Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during resume analysis." });
  }
});

// -----------------------------------------------------------------
// 2B. AI RESUME BUILDER / GENERATOR ENDPOINT
// -----------------------------------------------------------------
app.post("/api/generate-resume", async (req, res) => {
  try {
    const {
      formData,
      sequence = "fresher",
      targetRole = "Software Engineer",
      templateStyle = "modern"
    } = req.body;

    if (!formData || !formData.fullName) {
      return res.status(400).json({ error: "Candidate full name and details are required." });
    }

    const ai = getGeminiAI();

    const sequenceGuidelines = sequence === "fresher"
      ? `FRESHER / STUDENT / ENTRY-LEVEL RESUME SEQUENCE (0-2 Years):
1. CONTACT INFORMATION (Name, Location, Email, Phone, LinkedIn, GitHub, Portfolio)
2. CAREER OBJECTIVE / FRESHER SUMMARY (2-3 punchy lines highlighting degree, core technologies, and eagerness to add value to the target role)
3. EDUCATION & ACADEMIC PERFORMANCE (Degree, College/University, Grad Year, GPA/Percentage, Key Coursework: DSA, DBMS, OS, Web Technologies, etc.)
4. TECHNICAL SKILLS (Categorized cleanly: Programming Languages, Frameworks & Libraries, Databases & Cloud, Developer Tools & Practices)
5. ACADEMIC & CAPSTONE PROJECTS (2-3 rich projects with Title, Tech Stack, Links, and 2-3 XYZ bullet points with action verbs and metrics)
6. INTERNSHIPS / INDUSTRIAL TRAINING / FREELANCE (if any)
7. CERTIFICATIONS & VERIFIED CREDENTIALS (AWS, Meta, HackerRank, Coursera, LeetCode)
8. ACHIEVEMENTS & EXTRACURRICULARS (Hackathons, Coding Contests, Tech Club Leadership)`
      : sequence === "experienced"
      ? `EXPERIENCED PROFESSIONAL RESUME SEQUENCE (3+ Years):
1. CONTACT INFORMATION
2. EXECUTIVE SUMMARY (Years of experience, core domains, leadership & system architecture achievements)
3. PROFESSIONAL WORK EXPERIENCE (Reverse chronological with quantified metrics, revenue, latency, and team leadership)
4. KEY PROJECTS & ARCHITECTURE HIGHLIGHTS
5. TECHNICAL SKILLS & TOOLING
6. EDUCATION & INDUSTRY CERTIFICATIONS`
      : `CAREER SWITCHER / TRANSITION RESUME SEQUENCE:
1. CONTACT INFORMATION
2. CAREER TRANSITION SUMMARY (Connecting past domain expertise with newly acquired software engineering skills)
3. CORE TECHNICAL & TRANSFERABLE SKILLS
4. FEATURED PORTFOLIO PROJECTS & CAPSTONES (Hands-on demonstration of the new tech stack)
5. TECHNICAL CERTIFICATIONS & IMMERSION BOOTCAMPS
6. PREVIOUS PROFESSIONAL HISTORY (Framed around leadership, problem-solving, and quantifiable wins)`;

    const prompt = `You are an elite Silicon Valley Tech Recruiter, ATS Optimization Specialist, and Senior Resume Architect.
Your task is to craft an exceptional, 100% ATS-Compliant, professionally structured resume tailored for the role: "${targetRole}".

Candidate Input Data:
---
Full Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone}
Location: ${formData.location || "City, Country"}
LinkedIn: ${formData.linkedin || ""}
GitHub: ${formData.github || ""}
Portfolio: ${formData.portfolio || ""}
Target Role: ${targetRole}
Resume Sequence Profile: ${sequence}
Template Style: ${templateStyle}

Candidate Objective / Notes: ${formData.careerObjective || "Eager to contribute and build scalable software solutions."}

Education:
- Degree: ${formData.degree || "Bachelor of Technology in Computer Science"}
- Institution: ${formData.institution || "Engineering University"}
- Graduation Year: ${formData.gradYear || "2025"}
- GPA / Score: ${formData.gpa || "3.8 / 4.0"}
- Coursework: ${formData.coursework || "Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks, Cloud Computing"}

Technical Skills Input:
- Languages: ${formData.skillsLanguages || "JavaScript, TypeScript, Python, Java, SQL"}
- Frameworks: ${formData.skillsFrameworks || "React.js, Node.js, Express.js, Tailwind CSS"}
- Databases & Cloud: ${formData.skillsDatabases || "PostgreSQL, MongoDB, Firebase, AWS S3"}
- Tools: ${formData.skillsTools || "Git, GitHub Actions, Docker, VS Code, REST APIs, Postman"}

Projects Input:
- Project 1: ${formData.project1Title || "Collaborative Task Management Web App"} | Stack: ${formData.project1Stack || "React, Node.js, MongoDB, Socket.io"} | Link: ${formData.project1Link || "github.com/candidate/project-1"}
  Notes: ${formData.project1Desc || "Real-time task board with user authentication and drag-drop features."}
- Project 2: ${formData.project2Title || "AI-Powered Smart Code Reviewer"} | Stack: ${formData.project2Stack || "Python, FastAPI, OpenAI/Gemini API, React"} | Link: ${formData.project2Link || "github.com/candidate/ai-reviewer"}
  Notes: ${formData.project2Desc || "Automated syntax and performance scanner with instant feedback."}

Experience / Internships:
- Role: ${formData.experienceRole || "Software Engineering Intern"}
- Company: ${formData.experienceCompany || "Tech Innovations Inc."}
- Duration: ${formData.experienceDuration || "Summer 2024 (3 Months)"}
- Notes: ${formData.experienceDesc || "Assisted in building UI components, writing unit tests, and optimizing database queries."}

Certifications & Achievements:
- Certifications: ${formData.certifications || "AWS Certified Cloud Practitioner, Meta Front-End Developer Certificate"}
- Achievements: ${formData.achievements || "Top 10 Finalist in National Hackathon (150+ teams), Solved 300+ LeetCode problems"}

Special User Instructions: ${formData.customInstructions || "Make every bullet point punchy using strong action verbs (Architected, Engineered, Optimized, Implemented) and include quantifiable metrics."}
---

SEQUENCE TO ENFORCE:
${sequenceGuidelines}

RULES:
1. Polish and elevate all raw descriptions into high-impact, professional resume bullet points using the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".
2. Never invent fake companies or degrees, but enhance the wording, technical clarity, and metric realism of the candidate's provided details.
3. Ensure the markdown formatting is crystal clean, readable, single/two-page standard ATS markdown without weird symbols.
4. Output strictly a valid JSON object matching the schema below.

JSON Schema:
{
  "fullName": "${formData.fullName}",
  "targetRole": "${targetRole}",
  "sequence": "${sequence}",
  "templateStyle": "${templateStyle}",
  "atsScoreEstimate": number (e.g. 94 to 98),
  "atsHighlights": [
    "High keyword match for ${targetRole}",
    "Action-driven XYZ bullet points with measurable impact",
    "Section ordering strictly compliant with ${sequence} ATS standard",
    "Clean single-column ATS scannable typography layout"
  ],
  "proTips": [
    "Tailor the Career Objective slightly for specific job descriptions",
    "Keep GitHub and LinkedIn hyperlinks active on PDF export",
    "Bring physical copies or save as ATS-compliant PDF without embedded graphics"
  ],
  "markdownResume": "COMPLETE_FULL_MARKDOWN_STRING_OF_THE_RESUME",
  "structuredData": {
    "personalInfo": {
      "fullName": "${formData.fullName}",
      "email": "${formData.email}",
      "phone": "${formData.phone}",
      "location": "${formData.location || ""}",
      "linkedin": "${formData.linkedin || ""}",
      "github": "${formData.github || ""}",
      "portfolio": "${formData.portfolio || ""}"
    },
    "summary": "Polished career summary/objective string",
    "education": [
      {
        "degree": "...",
        "institution": "...",
        "year": "...",
        "gpa": "...",
        "coursework": "..."
      }
    ],
    "skills": {
      "languages": ["..."],
      "frameworks": ["..."],
      "databasesCloud": ["..."],
      "developerTools": ["..."],
      "coreCompetencies": ["..."]
    },
    "projects": [
      {
        "title": "...",
        "techStack": "...",
        "link": "...",
        "bulletPoints": ["bullet 1 with action verb and metrics", "bullet 2"]
      }
    ],
    "experience": [
      {
        "role": "...",
        "company": "...",
        "duration": "...",
        "location": "...",
        "bulletPoints": ["bullet 1", "bullet 2"]
      }
    ],
    "certifications": [
      {
        "name": "...",
        "issuer": "...",
        "year": "..."
      }
    ],
    "achievements": ["achievement 1", "achievement 2"]
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    const textOutput = response.text || "{}";
    try {
      const parsedData = JSON.parse(textOutput);
      res.json(parsedData);
    } catch (parseErr) {
      const cleaned = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleaned));
    }
  } catch (error: any) {
    console.error("Resume Builder Generator Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI resume." });
  }
});

// -----------------------------------------------------------------
// 3. ROADMAP GENERATOR ENDPOINT
// -----------------------------------------------------------------
app.post("/api/generate-roadmap", async (req, res) => {
  try {
    const { career, currentLevel, timelineWeeks } = req.body;
    if (!career) {
      return res.status(400).json({ error: "Target career path is required." });
    }

    const ai = getGeminiAI();

    const systemPrompt = `You are a visionary principal engineer and career learning advisor.
Generate a comprehensive, structural, and hyper-actionable learning roadmap to transition from level "${currentLevel || "Beginner"}" into a professional "${career}".
Target estimated duration: ${timelineWeeks || 12} weeks.

You must reply with a structured JSON object strictly matching this schema:
{
  "title": "Roadmap title",
  "description": "Short inspiring summary of this journey",
  "phases": [
    {
      "phaseName": "Phase name (e.g. Phase 1: Foundations)",
      "duration": "Duration in weeks",
      "description": "Short explanation of the phase focus",
      "milestones": ["Milestone achievement 1", "Milestone achievement 2"],
      "recommendedTopics": ["Topic 1", "Topic 2", "Topic 3"],
      "actionableProject": {
        "title": "Build a XYZ project",
        "brief": "Detailed brief of what to build to prove mastery in this phase."
      },
      "freeResources": [
        {
          "name": "Resource source name (e.g. FreeCodeCamp, Microsoft Learn, Coursera Free, Google AI)",
          "type": "Video course / Interactive Lab / Tutorial",
          "url": "Suggestive high-quality link or search keyword"
        }
      ]
    }
  ],
  "estimatedSalaryRange": "Estimated annual starting & mid-level salary",
  "requiredCertifications": ["Cert 1", "Cert 2"],
  "nextStepsAdvice": "Encouraging final coaching tips."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a career transition learning roadmap for career: "${career}", starting from level: "${currentLevel || "Beginner"}". Total weeks target: ${timelineWeeks || 12}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    const textOutput = response.text || "{}";
    try {
      res.json(JSON.parse(textOutput));
    } catch {
      const cleaned = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleaned));
    }
  } catch (error: any) {
    console.error("Roadmap Generator Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during roadmap generation." });
  }
});

// -----------------------------------------------------------------
// 4. INTERVIEW ASSISTANT ENDPOINT
// -----------------------------------------------------------------
app.post("/api/interview-feedback", async (req, res) => {
  try {
    const { role, question, userAnswer, history } = req.body;
    if (!role || !question) {
      return res.status(400).json({ error: "Role and question are required." });
    }

    const ai = getGeminiAI();

    const systemPrompt = `You are a senior recruiter conducting a professional mock interview for a "${role}" role.
Analyze the user's answer to the mock question and provide insightful feedback, constructive scores, and the next realistic interview question.

Provide your feedback strictly in this JSON format:
{
  "rating": number (0 to 100),
  "strengths": ["strength 1", "strength 2"],
  "gaps": ["improvement gap 1", "improvement gap 2"],
  "modelAnswer": "A highly professional, expert-level response to the question.",
  "nextQuestion": "The next question in the interview sequence (behavioral, technical, or HR)."
}`;

    const promptText = `
Role being interviewed for: ${role}
Question asked: "${question}"
User's Answer: "${userAnswer || "[No answer provided/skipped]"}"
Previous questions and answers sequence history: ${JSON.stringify(history || [])}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.4
      }
    });

    const textOutput = response.text || "{}";
    try {
      res.json(JSON.parse(textOutput));
    } catch {
      const cleaned = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleaned));
    }
  } catch (error: any) {
    console.error("Interview Feedback Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during interview simulation." });
  }
});

// START A SIMULATED INTERVIEW
app.post("/api/interview/start", async (req, res) => {
  try {
    const { 
      candidateName, 
      role, 
      experienceLevel, 
      yearsOfExperience, 
      technicalSkills, 
      resumeText, 
      difficulty, 
      durationMinutes,
      company 
    } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: "Role is required." });
    }

    // According to Nexora AI specification:
    // When the interview starts, the interviewer begins Phase 1 — Introduction:
    // "Hello, welcome to Nexora AI. Let's begin your interview. Please introduce yourself."
    const greeting = candidateName && candidateName.trim()
      ? `Hello ${candidateName.trim()}, welcome to Nexora AI. Let's begin your interview. Please introduce yourself.`
      : `Hello, welcome to Nexora AI. Let's begin your interview. Please introduce yourself.`;

    res.json({
      question: greeting,
      phase: "PHASE 1 — INTRODUCTION",
      interviewerGreeting: greeting,
      durationMinutes: durationMinutes || 30,
      estimatedQuestions: durationMinutes === 15 ? 5 : durationMinutes === 45 ? 12 : durationMinutes === 60 ? 15 : 8
    });
  } catch (error: any) {
    console.error("Interview Start Error:", error);
    res.status(500).json({ error: error.message || "Failed to start interview." });
  }
});

// EVALUATE ANSWER AND GET NEXT ADAPTIVE QUESTION
app.post("/api/interview/answer", async (req, res) => {
  try {
    const { 
      candidateName,
      role, 
      experienceLevel, 
      yearsOfExperience,
      technicalSkills,
      resumeText,
      difficulty, 
      durationMinutes,
      company, 
      question, 
      userAnswer, 
      history, 
      questionIndex, 
      totalQuestions,
      currentPhase
    } = req.body;

    if (!role || !question) {
      return res.status(400).json({ error: "Role and question are required." });
    }

    const ai = getGeminiAI();
    const systemPrompt = `You are an expert Senior IT Technical Interviewer for "Nexora AI", conducting a realistic, interactive LIVE IT COMPANY-STYLE INTERVIEW.
You represent a top-tier tech enterprise interviewing for the role of: "${role}".

INTERVIEW OBJECTIVES & RULES:
1. Conduct a complete simulated IT job interview based on the candidate's profile:
   - Target Job Role: ${role}
   - Candidate Name: ${candidateName || "Candidate"}
   - Experience Level: ${experienceLevel || "Fresher"} (${yearsOfExperience || "0"} years)
   - Skills: ${technicalSkills || "General Software Engineering"}
   - Difficulty Level: ${difficulty || "INTERMEDIATE"} (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
   - Target Duration: ${durationMinutes || 30} minutes
   ${company ? `- Target Company Context: ${company}` : ""}
   ${resumeText ? `- Candidate Resume Excerpt:\n${resumeText.slice(0, 1000)}` : ""}

2. INTERVIEW FLOW PHASES:
   - PHASE 1 — INTRODUCTION: Candidate introduction and background.
   - PHASE 2 — RESUME / INTRODUCTION ROUND: Deep dive into candidate's projects, architecture, challenges, contributions, tools.
   - PHASE 3 — TECHNICAL ROUND: Core technical questions aligned with role (OOP, Data Structures, Algorithms, DBMS/SQL, OS, System Design, React, Node, Python, Cloud, etc.).
   - PHASE 4 — CODING / PROBLEM SOLVING: Algorithmic, data structure, or architectural problem. Request approach first before code. If candidate struggled, give a small hint.
   - PHASE 5 — SCENARIO BASED QUESTIONS: Real production scenarios (e.g., API latency spikes after deployment, production customer bug triage, architectural trade-offs, developer disagreement).
   - PHASE 6 — HR / BEHAVIORAL ROUND: Strengths, areas of improvement, teamwork, handling failure, 3-5 year roadmap, company culture.

3. ADAPTIVE FOLLOW-UP ENGINE (CRUCIAL):
   Analyze the candidate's answer:
   - Strong answer -> increase difficulty or probe edge cases / scale.
   - Average answer -> ask a moderate follow-up.
   - Weak answer -> ask a simpler probing question to test baseline fundamentals.
   - Incorrect answer -> ask the candidate to explain their reasoning before judging.
   - Very short / vague answer -> ask for specific clarification or concrete examples.
   - Excellent answer -> move toward advanced enterprise/company-level questions.
   NEVER repeat the same question. Dynamically follow up on technologies or projects they mentioned.

4. INTERVIEWER BEHAVIOR:
   - Ask exactly ONE question at a time.
   - Do NOT ask multiple questions at once.
   - Do NOT make it feel like a robotic quiz. Act like a polite, sharp, human interviewer.
   - Keep nextQuestion concise, spoken, and natural for voice conversation (1-2 sentences).
   - Determine whether to stay in current phase for a deep follow-up or transition to the next phase based on progress (${questionIndex} of ${totalQuestions}).
   - If questionIndex >= totalQuestions, mark nextQuestion as "" (interview concluding).

Return strictly a valid JSON object matching this schema:
{
  "score": number (0 to 10),
  "categoryScores": {
    "technical": number (0 to 30),
    "problemSolving": number (0 to 20),
    "communication": number (0 to 15),
    "programming": number (0 to 15),
    "projectKnowledge": number (0 to 10),
    "behavioral": number (0 to 10)
  },
  "adaptiveSignal": "Strong" | "Average" | "Weak" | "Incorrect" | "Short" | "Excellent",
  "adaptiveNote": "Brief 1-sentence interviewer reasoning for how this answer influenced the next question",
  "strengths": ["Clear strength 1", "Strength 2"],
  "weaknesses": ["Improvement point 1", "Improvement point 2"],
  "modelAnswer": "A professional, expert-level response using the STAR method or clean technical explanation.",
  "communicationTips": "Constructive advice on clarity, pacing, or structure.",
  "confidenceTips": "Advice on tone, articulation, and assertiveness.",
  "spokenFeedback": "A natural 1-sentence human interviewer transition phrase (e.g., 'Good point on database indexing. Let's dig into how you handle caching.')",
  "nextQuestion": "The single next adaptive question (leave empty if questionIndex >= totalQuestions)",
  "nextPhase": "PHASE 1 — INTRODUCTION" | "PHASE 2 — RESUME / PROJECTS" | "PHASE 3 — TECHNICAL ROUND" | "PHASE 4 — CODING / PROBLEM SOLVING" | "PHASE 5 — SCENARIO BASED QUESTIONS" | "PHASE 6 — HR / BEHAVIORAL ROUND"
}`;

    const promptText = `
Candidate Name: ${candidateName || "Candidate"}
Role: ${role}
Current Phase: ${currentPhase || "PHASE 1 — INTRODUCTION"}
Current Question Index: Question ${questionIndex} of ${totalQuestions}
Question Asked: "${question}"
Candidate's Answer: "${userAnswer || "[Candidate left response empty or skipped]"}"

Previous Interview Transcript & Flow:
${JSON.stringify(history || [], null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.5
      }
    });

    const textOutput = response.text || "{}";
    try {
      res.json(JSON.parse(textOutput));
    } catch {
      const cleaned = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleaned));
    }
  } catch (error: any) {
    console.error("Interview Evaluation Error:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate answer." });
  }
});

// GENERATE COMPREHENSIVE INTERVIEW REPORT WITH 100-POINT FRAMEWORK
app.post("/api/interview/report", async (req, res) => {
  try {
    const { 
      candidateName,
      role, 
      experienceLevel, 
      yearsOfExperience,
      technicalSkills,
      difficulty, 
      durationMinutes,
      company, 
      history,
      integritySignals
    } = req.body;

    if (!role || !history || !Array.isArray(history)) {
      return res.status(400).json({ error: "Role and history array are required." });
    }

    const ai = getGeminiAI();
    const systemPrompt = `You are the Senior Executive Hiring Panel and AI Evaluation Director at "Nexora AI".
You are evaluating a candidate who just completed a simulated IT company interview for the role of: "${role}".

Candidate Profile:
- Candidate Name: ${candidateName || "Candidate"}
- Target Role: ${role}
- Experience Level: ${experienceLevel || "Fresher"} (${yearsOfExperience || "0"} years)
- Technical Skills: ${technicalSkills || "Software Development"}
- Difficulty: ${difficulty || "INTERMEDIATE"}
- Interview Duration: ${durationMinutes || 30} minutes
${company ? `- Company Context: ${company}` : ""}
${integritySignals && integritySignals.length > 0 ? `- Monitored Signals: ${JSON.stringify(integritySignals)}` : ""}

EVALUATION FRAMEWORK (STRICT 100-POINT SYSTEM):
1. Technical Knowledge: Score out of 30
2. Problem Solving: Score out of 20
3. Communication: Score out of 15
4. Programming / Logic: Score out of 15
5. Project Knowledge: Score out of 10
6. Behavioral / HR: Score out of 10
Overall Score = Sum of all 6 category scores (max 100).

Strict Rules:
- Do not give scores based on personality, appearance, accent, gender, race, or protected characteristics.
- Evaluate strictly on answers given in the transcript.
- Identify TOP 3 STRENGTHS and TOP 3 IMPROVEMENT AREAS.
- Identify specific TECHNOLOGIES TO REVISE.
- Identify specific QUESTIONS TO PRACTICE.
- Generate a PERSONALIZED 7-DAY PREPARATION PLAN (Day 1 through Day 7) with targeted actions.
- Provide a summary of the interview transcript, questions where the candidate struggled, and hiring readiness ("Strong Hire", "Hire", "Leaning Hire", "Consider", or "Needs Improvement").
- Format neutral integrity observations if signals exist (e.g., "Steady visual focus maintained throughout the session with consistent conversational cadence.").

Output strictly a valid JSON matching this schema:
{
  "overallScore": number (0 to 100),
  "breakdown": {
    "technical": number (0 to 30),
    "problemSolving": number (0 to 20),
    "communication": number (0 to 15),
    "programming": number (0 to 15),
    "projectKnowledge": number (0 to 10),
    "behavioral": number (0 to 10)
  },
  "top3Strengths": [
    "Strength 1 with exact justification",
    "Strength 2 with exact justification",
    "Strength 3 with exact justification"
  ],
  "top3ImprovementAreas": [
    "Improvement area 1 with exact advice",
    "Improvement area 2 with exact advice",
    "Improvement area 3 with exact advice"
  ],
  "technologiesToRevise": [
    "Technology 1 (e.g. PostgreSQL Indexing & B-Trees)",
    "Technology 2 (e.g. React Fiber & Re-render Optimization)",
    "Technology 3"
  ],
  "questionsToPractice": [
    "Practice question 1",
    "Practice question 2",
    "Practice question 3",
    "Practice question 4"
  ],
  "personalized7DayPlan": [
    { "day": 1, "title": "Core Foundations Review", "focus": "...", "tasks": ["Task 1", "Task 2"] },
    { "day": 2, "title": "Deep Dive into Projects & Architecture", "focus": "...", "tasks": ["Task 1", "Task 2"] },
    { "day": 3, "title": "Data Structures & Algorithmic Practice", "focus": "...", "tasks": ["Task 1", "Task 2"] },
    { "day": 4, "title": "System Design & Production Scenarios", "focus": "...", "tasks": ["Task 1", "Task 2"] },
    { "day": 5, "title": "Database Optimization & SQL Query Tuning", "focus": "...", "tasks": ["Task 1", "Task 2"] },
    { "day": 6, "title": "STAR Method Behavioral & Scenario Polish", "focus": "...", "tasks": ["Task 1", "Task 2"] },
    { "day": 7, "title": "Mock Re-Run & Final Company Readiness", "focus": "...", "tasks": ["Task 1", "Task 2"] }
  ],
  "struggledQuestions": [
    "Question where the candidate faltered or was vague",
    "Another question needing revision"
  ],
  "recommendedTopics": [
    "Topic 1",
    "Topic 2",
    "Topic 3"
  ],
  "transcriptSummary": "A concise executive recap of how the candidate introduced themselves, navigated technical questions, solved the coding/logic prompt, and responded to HR inquiries.",
  "hiringReadiness": "Strong Hire" | "Hire" | "Leaning Hire" | "Consider" | "Needs Improvement",
  "justification": "A comprehensive hiring panel evaluation detailing candidate potential, demonstrated competency, and key focus items.",
  "integrityObservations": [
    "Candidate engaged in active dialogue with consistent response pacing.",
    "No anomalous behavior or unauthorized assistance observed."
  ]
}`;

    const promptText = `
Complete Interview History for candidate "${candidateName || "Candidate"}" for role "${role}":
${JSON.stringify(history, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    const textOutput = response.text || "{}";
    try {
      res.json(JSON.parse(textOutput));
    } catch {
      const cleaned = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleaned));
    }
  } catch (error: any) {
    console.error("Interview Report Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate report." });
  }
});

// -----------------------------------------------------------------
// 5. SKILL GAP ANALYZER ENDPOINT
// -----------------------------------------------------------------
app.post("/api/analyze-skills", async (req, res) => {
  try {
    const { targetCareer, currentEducation, currentSkills } = req.body;
    if (!targetCareer) {
      return res.status(400).json({ error: "Target Career is required." });
    }

    const ai = getGeminiAI();

    const systemPrompt = `You are a world-class IT and AI Technical Recruiter and Career Development Advisor.
Analyze the user's career path gap between where they are currently and their target career objective, and provide a deep gap analysis and learning path.

Input Details:
- Target Career: ${targetCareer}
- Current Education: ${currentEducation || "Not Specified / Self-taught"}
- Current Skills: ${Array.isArray(currentSkills) ? currentSkills.join(", ") : (currentSkills || "None Specified")}

Generate a comprehensive, structurally sound, and hyper-actionable Skill Gap Analysis Report. You must reply with a structured JSON object strictly matching this schema:
{
  "targetCareer": "The exact target career analyzed",
  "currentEducation": "Short summary of current educational background fit",
  "currentSkills": ["The list of parsed and validated current relevant skills"],
  "missingSkills": [
    {
      "name": "Skill Name",
      "category": "e.g., Languages / Frontend / Cloud / DevOps / Core Computer Science",
      "importance": "High",
      "description": "Specific reason why this skill is needed for this target career"
    }
  ],
  "learningPath": [
    {
      "step": "Step 1",
      "title": "Module or Concept Topic Title",
      "duration": "Duration in weeks or months",
      "topics": ["Detail topic 1", "Detail topic 2", "Detail topic 3"],
      "resources": [
        {
          "name": "Resource source name (e.g., Coursera, FreeCodeCamp, MDN, Microsoft Learn)",
          "type": "Video / Interactive / Book / Doc",
          "url": "Suggestive high-quality reference or search keyword"
        }
      ]
    }
  ],
  "recommendedProjects": [
    {
      "title": "A highly relevant portfolio project",
      "description": "Comprehensive design brief explaining what to build, tech stack to use, and why this project bridges the skill gaps",
      "skillsAcquired": ["Skill 1", "Skill 2"],
      "complexity": "Intermediate"
    }
  ],
  "recommendedCertifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing company (e.g., Google, Amazon, Microsoft, CompTIA)",
      "estimatedCost": "Approximate cost, e.g., $150, or Free",
      "valueToCareer": "How this certification impacts their job prospects for this specific role"
    }
  ],
  "estimatedLearningTime": "Total estimated duration to bridge the gap (e.g., '3 to 6 months')",
  "careerReadinessScore": 35,
  "overallSummary": "A highly professional, encouraging, and realistic evaluation of their current starting point and the difficulty/outlook of transitioning into their target role."
}

Ensure "missingSkills" objects' "importance" has values: "High", "Medium", or "Low" only.
Ensure "recommendedProjects" objects' "complexity" has values: "Beginner", "Intermediate", or "Advanced" only.
Ensure "careerReadinessScore" is a valid number from 0 to 100.
Always return complete JSON without truncation.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Perform a skill gap analysis for Target Career: "${targetCareer}", Current Education: "${currentEducation || "Not Specified"}", Current Skills: "${Array.isArray(currentSkills) ? currentSkills.join(", ") : (currentSkills || "None")}".`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    const textOutput = response.text || "{}";
    try {
      res.json(JSON.parse(textOutput));
    } catch {
      const cleaned = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleaned));
    }
  } catch (error: any) {
    console.error("Skill Gap Analyzer Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during skill gap analysis." });
  }
});

// =================================================================
// MICROSOFT EXCEL ONLINE & CONTACT FORM INTEGRATION ENDPOINTS
// =================================================================

// 1. Contact Form Submission (Logs to Firestore + Syncs to Excel)
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    // A. Save submission in dedicated Firestore "contacts" collection
    const contactData = {
      fullName: name,
      email: email,
      subject: req.body.subject || "General Inquiry",
      message: message,
      createdAt: serverTimestamp(),
      status: "New"
    };
    const contactsCol = collection(db, "contacts");
    await addDoc(contactsCol, contactData);

    // B. Keep logging activity to Firestore collection
    const activityData = {
      name,
      email,
      activity: "Contact Form Submitted",
      timestamp: Date.now(),
      status: "Success",
      device: "Desktop",
      browser: "Chrome",
      os: "Windows",
      details: `Message: "${message}"`,
    };
    
    const activitiesCol = collection(db, "activities");
    await addDoc(activitiesCol, activityData);

    // C. Append row to Excel spreadsheet if authenticated
    const excelSynced = await appendContactToExcel(name, email, message, "New");

    // D. Append row to Google Sheets if authenticated
    const googleSynced = await appendContactToGoogleSheets(name, email, message, "New");

    res.json({ success: true, excelSynced, googleSynced });
  } catch (error: any) {
    console.error("Contact form endpoint error:", error);
    res.status(500).json({ error: error.message || "An error occurred during contact submission." });
  }
});

// 2. Fetch Microsoft Connection & Config Status
app.get("/api/microsoft/config", async (req, res) => {
  try {
    const config = await getMicrosoftConfig();
    if (!config) {
      return res.json({ configured: false, connected: false });
    }
    res.json({
      configured: !!config.clientId && !!config.clientSecret,
      clientId: config.clientId || "",
      clientSecret: config.clientSecret ? "••••••••••••••••" : "", // masked
      redirectUri: config.redirectUri || "",
      connected: !!config.refreshToken,
      connectedEmail: config.connectedEmail || "",
      connectedName: config.connectedName || "",
      excelFilePath: config.excelFilePath || "/CareerPilot_Inquiries.xlsx"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Save Microsoft Credentials Config
app.post("/api/microsoft/config", async (req, res) => {
  try {
    const { clientId, clientSecret, redirectUri, excelFilePath } = req.body;
    const configUpdate: any = {};
    if (clientId !== undefined) configUpdate.clientId = clientId;
    if (clientSecret !== undefined && clientSecret !== "••••••••••••••••") configUpdate.clientSecret = clientSecret;
    if (redirectUri !== undefined) configUpdate.redirectUri = redirectUri;
    if (excelFilePath !== undefined) configUpdate.excelFilePath = excelFilePath;

    await saveMicrosoftConfig(configUpdate);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Retrieve Microsoft Login Auth URL
app.get("/api/microsoft/auth", async (req, res) => {
  try {
    const customRedirect = req.query.redirectUri as string;
    const authUrl = await getMicrosoftAuthUrl(customRedirect);
    res.json({ authUrl });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 5. Microsoft OAuth Auth Code Callback
app.get("/api/microsoft/callback", async (req, res) => {
  try {
    const code = req.query.code as string;
    const customRedirect = req.query.redirectUri as string;

    if (!code) {
      return res.status(400).send("Authorization code is missing.");
    }

    await handleMicrosoftAuthCallback(code, customRedirect);

    res.send(`
      <html>
        <head>
          <title>Microsoft Connected</title>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: "MICROSOFT_AUTH_SUCCESS" }, "*");
              window.close();
            } else {
              window.location.href = "/?microsoft_connected=true";
            }
          </script>
        </head>
        <body style="font-family: sans-serif; background: #050a15; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; padding: 24px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="width: 56px; height: 56px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <svg style="width: 28px; height: 28px; color: #10b981;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 style="color: #ffffff; margin: 0 0 8px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.025em;">Integration Successful</h2>
            <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 0 0 20px 0;">Your Microsoft account has been connected securely. The system will now sync contact inquiries to Excel Online in real-time.</p>
            <button onclick="window.close()" style="background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s; width: 100%;">Close Setup</button>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Microsoft Auth Callback error:", error);
    res.status(500).send(`Authentication error: ${error.message}`);
  }
});

// 6. Disconnect Microsoft Integration
app.post("/api/microsoft/disconnect", async (req, res) => {
  try {
    await disconnectMicrosoft();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Get Excel/Firestore Contact Tickets
app.get("/api/contact/submissions", async (req, res) => {
  try {
    const submissions = await getExcelContactTickets();
    res.json({ submissions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Update Ticket Status (Surgically updates Excel cell value)
app.patch("/api/contact/update-status", async (req, res) => {
  try {
    const { index, status } = req.body;
    if (index === undefined || index === null || !status) {
      return res.status(400).json({ error: "Row index and status values are required." });
    }

    let success = false;
    if (index >= 0) {
      const excelSuccess = await updateExcelTicketStatus(index, status);
      const googleSuccess = await updateGoogleRowStatus(index, status);
      success = excelSuccess || googleSuccess; // Success if either completes or we consider it updated
    } else {
      success = true; // Fallback logs update successfully in UI
    }

    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Bulk Sync Offline/Previous Firestore Inquiries to Excel
app.post("/api/microsoft/sync-all", async (req, res) => {
  try {
    const result = await syncFirestoreTicketsToExcel();
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, syncedCount: result.syncedCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =================================================================
// GOOGLE SHEETS INTEGRATION ENDPOINTS
// =================================================================

// 1. Fetch Google Connection & Config Status
app.get("/api/google/config", async (req, res) => {
  try {
    const config = await getGoogleConfig();
    if (!config) {
      return res.json({ configured: false, connected: false });
    }
    res.json({
      configured: !!config.clientId && !!config.clientSecret,
      clientId: config.clientId || "",
      clientSecret: config.clientSecret ? "••••••••••••••••" : "", // masked
      redirectUri: config.redirectUri || "",
      connected: !!config.refreshToken,
      connectedEmail: config.connectedEmail || "",
      connectedName: config.connectedName || "",
      spreadsheetId: config.spreadsheetId || "",
      spreadsheetName: config.spreadsheetName || "CareerPilot_Inquiries"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Save Google Credentials Config
app.post("/api/google/config", async (req, res) => {
  try {
    const { clientId, clientSecret, redirectUri, spreadsheetName } = req.body;
    const configUpdate: any = {};
    if (clientId !== undefined) configUpdate.clientId = clientId;
    if (clientSecret !== undefined && clientSecret !== "••••••••••••••••") configUpdate.clientSecret = clientSecret;
    if (redirectUri !== undefined) configUpdate.redirectUri = redirectUri;
    if (spreadsheetName !== undefined) configUpdate.spreadsheetName = spreadsheetName;

    await saveGoogleConfig(configUpdate);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Retrieve Google Login Auth URL
app.get("/api/google/auth", async (req, res) => {
  try {
    const customRedirect = req.query.redirectUri as string;
    const authUrl = await getGoogleAuthUrl(customRedirect);
    res.json({ authUrl });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 4. Google OAuth Auth Code Callback
app.get("/api/google/callback", async (req, res) => {
  try {
    const code = req.query.code as string;
    const customRedirect = req.query.redirectUri as string;

    if (!code) {
      return res.status(400).send("Authorization code is missing.");
    }

    await handleGoogleAuthCallback(code, customRedirect);

    res.send(`
      <html>
        <head>
          <title>Google Sheets Connected</title>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS" }, "*");
              window.close();
            } else {
              window.location.href = "/?google_connected=true";
            }
          </script>
        </head>
        <body style="font-family: sans-serif; background: #050a15; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; padding: 24px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="width: 56px; height: 56px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <svg style="width: 28px; height: 28px; color: #10b981;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 style="color: #ffffff; margin: 0 0 8px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.025em;">Google Sheets Connected</h2>
            <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 0 0 20px 0;">Your Google account has been connected securely. The system will now sync contact inquiries to Google Sheets in real-time.</p>
            <button onclick="window.close()" style="background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s; width: 100%;">Close Setup</button>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Google Auth Callback error:", error);
    res.status(500).send(`Authentication error: ${error.message}`);
  }
});

// 5. Disconnect Google Integration
app.post("/api/google/disconnect", async (req, res) => {
  try {
    await disconnectGoogle();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Bulk Sync Offline/Previous Firestore Inquiries to Google Sheets
app.post("/api/google/sync-all", async (req, res) => {
  try {
    const result = await syncAllFirestoreContactsToGoogleSheets();
    res.json({ success: true, syncedCount: result.count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------------------------------------------
// VITE AND STATIC SERVING
// -----------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexora AI Server running on http://localhost:${PORT}`);
  });
}

startServer();

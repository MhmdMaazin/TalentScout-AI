import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CandidateFile, JobConfig, AnalysisResult, ChatMessage, ComparisonResult } from '../types';

// Using gemini-3-pro-preview as requested for high reasoning capability and image understanding
const MODEL_NAME = "gemini-2.5-flash";

export const analyzeCandidates = async (
  jobConfig: JobConfig,
  candidates: CandidateFile[]
): Promise<AnalysisResult[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set REACT_APP_GEMINI_KEY or check environment.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Schema definition for structured output
  const resultSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        candidateId: { type: Type.STRING, description: "The ID provided in the input for this candidate." },
        candidateName: { type: Type.STRING, description: "The name of the candidate extracted from the resume." },
        score: { type: Type.NUMBER, description: "A score from 0 to 100 indicating fit for the role." },
        matchSummary: { type: Type.STRING, description: "A 1-2 sentence summary of why they fit or don't fit." },
        pros: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Top 3 strengths relevant to the job."
        },
        cons: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Top 3 weaknesses or missing skills."
        },
        skillsFound: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of matching skills found in the resume."
        }
      },
      required: ["candidateId", "candidateName", "score", "matchSummary", "pros", "cons", "skillsFound"]
    }
  };

  // Prepare contents. We can mix text and images (multimodal).
  const parts: any[] = [];

  // 1. Add Job Context with enhanced evaluation criteria
  parts.push({
    text: `
      Role: Expert Technical Recruiter
      Task: Analyze the following resumes against the job description with precision and depth.
      
      JOB TITLE: ${jobConfig.title}
      DESCRIPTION: ${jobConfig.description}
      REQUIRED SKILLS: ${jobConfig.requiredSkills.join(", ")}
      MIN EXPERIENCE: ${jobConfig.experienceLevel} years

      SCORING WEIGHTS:
      - Skills Match Importance: ${jobConfig.weights.skills}%
      - Experience Importance: ${jobConfig.weights.experience}%
      - Overall Fit/Reasoning Importance: ${jobConfig.weights.fit}%

      DETAILED EVALUATION CRITERIA:
      
      1. SKILLS MATCH (${jobConfig.weights.skills}%):
         - Count exact matches of required skills
         - Evaluate depth of expertise (years of experience with each skill)
         - Consider transferable skills and related technologies
         - Penalize missing critical skills
         - Score: (Matched Skills / Total Required Skills) * 100, adjusted for depth
      
      2. EXPERIENCE (${jobConfig.weights.experience}%):
         - Verify minimum years requirement is met
         - Assess relevance of past roles to current position
         - Evaluate career progression and growth trajectory
         - Consider industry experience alignment
         - Score: (Years in relevant roles / Required years) * 100, adjusted for relevance
      
      3. OVERALL FIT (${jobConfig.weights.fit}%):
         - Cultural and team fit indicators
         - Problem-solving approach demonstrated in past projects
         - Leadership or collaboration experience
         - Certifications and continuous learning
         - Score: Subjective assessment based on resume quality and alignment

      SCORING INSTRUCTIONS:
      - Calculate weighted score: (Skills_Score * ${jobConfig.weights.skills} + Experience_Score * ${jobConfig.weights.experience} + Fit_Score * ${jobConfig.weights.fit}) / 100
      - Be precise and critical. 100 = perfect match, 0 = no match
      - Provide specific reasoning for scores
      - If resume is an image, use OCR to extract all text accurately
      - Extract the candidate's name from the resume
      - List top 3 strengths and top 3 weaknesses with specific examples
      - Return the result in JSON format matching the schema.
    `
  });

  // 2. Add Candidates
  for (const c of candidates) {
    let candidateContent = `\n--- CANDIDATE ID: ${c.id} ---\n`;
    
    if (c.type === 'pdf' && c.extractedText) {
      candidateContent += `RESUME TEXT:\n${c.extractedText}\n`;
      parts.push({ text: candidateContent });
    } else if (c.type === 'image' && c.previewUrl) {
      // For images, we send the base64 data
      // Remove data:image/png;base64, prefix
      // Robust splitting to handle different mime types in prefix
      const base64Data = c.previewUrl.includes('base64,') 
        ? c.previewUrl.split('base64,')[1] 
        : c.previewUrl;
      
      const mimeType = c.file.type || 'image/png';
      
      parts.push({ text: candidateContent + "(Resume provided as Image/Photo)" }); 
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: resultSchema,
        temperature: 0.1, // Very low temperature for consistent, precise ranking
        systemInstruction: `You are an expert technical recruiter with 15+ years of experience. Your role is to provide accurate, data-driven candidate assessments.

CORE PRINCIPLES:
- Be objective and evidence-based. Only score based on what's explicitly stated in the resume.
- Be precise with scoring. Differentiate between candidates clearly.
- Be thorough in OCR. If resume is an image, extract ALL visible text accurately.
- Be critical but fair. A score of 100 is rare and only for near-perfect matches.
- Be specific in feedback. Provide concrete examples from the resume for each pro and con.

SCORING PHILOSOPHY:
- 90-100: Exceptional match, exceeds requirements
- 80-89: Strong match, meets all key requirements
- 70-79: Good match, meets most requirements with minor gaps
- 60-69: Acceptable match, meets core requirements but has notable gaps
- 50-59: Moderate match, meets some requirements but significant gaps
- Below 50: Poor match, missing critical requirements

Always apply the provided weights consistently across all candidates.`
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(text) as AnalysisResult[];
    
    return parsed;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

export const generateInterviewQuestions = async (
  candidateName: string,
  cons: string[],
  jobTitle: string
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Candidate: ${candidateName}
    Role: ${jobTitle}
    Identified Weaknesses/Gaps: ${cons.join(", ")}

    Task: Generate 5-7 targeted interview questions that:
    1. Directly address each identified weakness or gap
    2. Are specific and technical (not generic)
    3. Probe for concrete examples and past experience
    4. Assess problem-solving approach and learning ability
    5. Are professional but challenging
    
    For each weakness, create a question that:
    - Asks for specific examples from past projects
    - Explores how they would handle similar scenarios
    - Tests their knowledge depth in that area
    
    Format: Return as a numbered list (1. Question, 2. Question, etc.)
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.3 // Slightly higher for more creative questions
    }
  });

  return response.text || "Could not generate questions.";
};

export const generateOutreachEmail = async (
  candidateName: string,
  jobTitle: string,
  type: 'invite' | 'reject'
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Candidate: ${candidateName}
    Role: ${jobTitle}
    Email Type: ${type} (Invite to interview OR Rejection)

    Task: Write a professional, polite, and human-sounding email for this candidate.
    - If Invite: Propose a quick chat, mention their strong profile.
    - If Reject: Be kind, constructive, and keep door open for future.
    Return only the email body text.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt
  });

  return response.text || "Could not generate email.";
};

export const chatWithCandidate = async (
  candidate: CandidateFile,
  jobConfig: JobConfig,
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  // Construct context
  const parts: any[] = [];
  
  parts.push({
    text: `
      You are an AI assistant helping a recruiter. You have access to the candidate's resume.
      Job Title: ${jobConfig.title}
      Candidate Name: ${candidate.name}
      
      User Question: ${newMessage}
      
      Answer based ONLY on the provided resume content below. If the information is not in the resume, say "I couldn't find that information in the resume."
    `
  });

  if (candidate.type === 'pdf' && candidate.extractedText) {
    parts.push({ text: `RESUME TEXT:\n${candidate.extractedText}` });
  } else if (candidate.type === 'image' && candidate.previewUrl) {
      const base64Data = candidate.previewUrl.includes('base64,') 
        ? candidate.previewUrl.split('base64,')[1] 
        : candidate.previewUrl;
      
      parts.push({
        inlineData: {
          mimeType: candidate.file.type || 'image/png',
          data: base64Data
        }
      });
  }

  // Include recent history for continuity (simplified)
  const historyText = history.map(h => `${h.role === 'user' ? 'Recruiter' : 'AI'}: ${h.text}`).join("\n");
  parts.push({ text: `\nConversation History:\n${historyText}\n\nRecruiter: ${newMessage}\nAI:`});

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
        role: 'user',
        parts: parts
    }
  });

  return response.text || "I didn't understand that.";
};

export const compareCandidates = async (
  jobConfig: JobConfig,
  candidates: CandidateFile[]
): Promise<ComparisonResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  // Improved Schema: Request evaluations as a specific array instead of a dynamic map
  // This is much more reliable for the model to generate correctly.
  const comparisonSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      winnerId: { type: Type.STRING, description: "ID of the best candidate." },
      summary: { type: Type.STRING, description: "Reasoning for the winner selection." },
      dimensions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Dimension name e.g. Technical Skills" },
            evaluations: { 
              type: Type.ARRAY,
              description: "List of assessments per candidate",
              items: {
                type: Type.OBJECT,
                properties: {
                    candidateId: { type: Type.STRING },
                    assessment: { type: Type.STRING }
                },
                required: ["candidateId", "assessment"]
              }
            }
          },
          required: ["name", "evaluations"]
        }
      }
    },
    required: ["winnerId", "summary", "dimensions"]
  };

  const parts: any[] = [];
  
  parts.push({
    text: `
      Task: Perform a detailed side-by-side comparison of these candidates for the role: ${jobConfig.title}.
      Required Skills: ${jobConfig.requiredSkills.join(", ")}
      Min Experience: ${jobConfig.experienceLevel} years
      
      COMPARISON DIMENSIONS (evaluate each thoroughly):
      1. "Technical Skills" - Depth and breadth of required technical skills, proficiency levels
      2. "Relevant Experience" - Years in similar roles, industry experience, project complexity
      3. "Education/Certifications" - Degrees, certifications, continuous learning, training
      4. "Overall Fit" - Communication skills, problem-solving approach, team fit, growth potential
      
      For each dimension:
      - Provide specific, comparative assessments for each candidate
      - Reference concrete examples from their resumes
      - Clearly state who is stronger and why
      - Be precise and differentiate between candidates
      
      Winner Selection:
      - Choose the candidate who best matches the role requirements
      - Provide detailed reasoning considering all dimensions
      - Explain trade-offs if applicable
    `
  });

  for (const c of candidates) {
    let content = `\n--- ID: ${c.id} ---\n`;
    if (c.extractedText) content += c.extractedText.substring(0, 3000); // truncate slightly to fit context
    parts.push({ text: content });
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      role: 'user',
      parts: parts
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: comparisonSchema,
    }
  });

  if (!response.text) throw new Error("No comparison generated");
  
  // Transform the safe array response back into the Map structure the UI expects
  const rawData = JSON.parse(response.text) as any;
  
  const transformedDimensions = (rawData.dimensions || []).map((dim: any) => {
    const evalMap: Record<string, string> = {};
    if (Array.isArray(dim.evaluations)) {
        dim.evaluations.forEach((item: any) => {
            if (item.candidateId && item.assessment) {
                evalMap[item.candidateId] = item.assessment;
            }
        });
    }
    return {
        name: dim.name,
        evaluations: evalMap
    };
  });

  return {
    winnerId: rawData.winnerId,
    summary: rawData.summary,
    dimensions: transformedDimensions
  };
};

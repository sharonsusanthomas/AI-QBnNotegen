import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UploadedFile, AIResponseData } from "../types";

// Schema definition for Structured Output
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    notes: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "A concise summary of the material (approx 150 words)." },
        bulletPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Key takeaways in bullet point format."
        },
        detailedNotes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              heading: { type: Type.STRING },
              content: { type: Type.STRING, description: "Detailed explanation of the section." }
            },
            required: ["heading", "content"]
          }
        },
        definitions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              definition: { type: Type.STRING }
            },
            required: ["term", "definition"]
          }
        },
        mindMap: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              subtopics: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["topic", "subtopics"]
          },
          description: "Hierarchical structure for a mind map."
        }
      },
      required: ["summary", "bulletPoints", "detailedNotes", "definitions", "mindMap"]
    },
    assessments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 options for MCQs" },
          correctAnswerIndex: { type: Type.INTEGER, description: "Index (0-3) of the correct answer" },
          explanation: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
          type: { type: Type.STRING, enum: ["MCQ"] }
        },
        required: ["id", "question", "options", "correctAnswerIndex", "explanation", "difficulty", "type"]
      }
    }
  },
  required: ["notes", "assessments"]
};

export class GeminiService {
  private ai: GoogleGenAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.ai = new GoogleGenAI({ apiKey });
  }

  async processDocument(file: UploadedFile): Promise<AIResponseData> {
    const modelId = "gemini-2.5-flash"; // Flash is efficient for large context and structured data

    const prompt = `
      You are an expert educational AI assistant. 
      Analyze the attached study material completely.
      
      Your tasks:
      1. Extract the core knowledge, identifying key concepts, definitions, and hierarchical relationships.
      2. Generate comprehensive study notes including a summary, bullet points, detailed section breakdowns, and key term definitions.
      3. Create a conceptual hierarchy (mind map structure).
      4. Generate a set of 10 assessment questions (MCQs) covering various difficulty levels (Easy, Medium, Hard) to test understanding.
      
      Return the output strictly in the requested JSON format.
    `;

    // Remove data URL prefix for API
    const cleanBase64 = file.data.replace(/^data:(.*,)?/, '');

    try {
      const response = await this.ai.models.generateContent({
        model: modelId,
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.type,
                data: cleanBase64
              }
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.3, // Lower temperature for more factual extraction
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      return JSON.parse(text) as AIResponseData;

    } catch (error) {
      console.error("Gemini Processing Error:", error);
      throw error;
    }
  }

  async chatWithDocument(file: UploadedFile, history: {role: 'user' | 'model', content: string}[], message: string): Promise<string> {
    const cleanBase64 = file.data.replace(/^data:(.*,)?/, '');
    
    // We recreate a single-turn request with history included in prompt context for simplicity in this prototype,
    // or use caching for better performance. For Phase 1, we will send the document + context each time 
    // or use the 'chat' feature if we initialize it with the document. 
    // Given the constraints, let's use a fresh generation with document context + query.

    const prompt = `
      You are a helpful tutor. The user is asking questions about the provided study document.
      Answer the user's question clearly and concisely based ONLY on the document provided.
      If the answer isn't in the document, say so.
      
      Chat History:
      ${history.map(h => `${h.role}: ${h.content}`).join('\n')}
      
      User Question: ${message}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.type,
                data: cleanBase64
              }
            }
          ]
        }
      });

      return response.text || "I couldn't generate an answer.";
    } catch (error) {
      console.error("Chat Error:", error);
      return "Sorry, I encountered an error answering that.";
    }
  }
}

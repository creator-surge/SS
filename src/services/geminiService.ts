import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async generateGrowthInsights(stats: any) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these creator stats and provide 3 actionable growth insights in JSON format: ${JSON.stringify(stats)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              insight: { type: Type.STRING },
              impact: { type: Type.STRING }
            },
            required: ["title", "insight", "impact"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  },

  async optimizeListing(title: string, description: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Optimize this marketplace listing for better conversion. Title: ${title}, Description: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimized_title: { type: Type.STRING },
            optimized_description: { type: Type.STRING }
          },
          required: ["optimized_title", "optimized_description"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }
};

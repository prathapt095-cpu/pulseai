import { GoogleGenAI } from "@google/genai";
import { UserBehavior, ChurnInsight, OutreachMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getChurnInsight(user: UserBehavior): Promise<ChurnInsight> {
  const prompt = `
    Analyze the following user behavior data and provide a churn risk assessment.
    User: ${user.name}
    Login Frequency: ${user.loginFrequency} times/week
    Avg Session Duration: ${user.avgSessionDuration} mins
    Last Active: ${user.lastActive}
    Feature Usage: ${JSON.stringify(user.featureUsage)}

    Return a JSON object with:
    - riskFactors: string[] (reasons why they might churn)
    - recommendation: string (what to say to them)
    - suggestedChannel: "email" | "whatsapp" | "push"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error getting churn insight:", error);
    return {
      userId: user.id,
      riskFactors: ["Inactivity detected"],
      recommendation: "Send a re-engagement email with a special offer.",
      suggestedChannel: "email",
    };
  }
}

export async function generateOutreach(user: UserBehavior, insight: ChurnInsight): Promise<Partial<OutreachMessage>> {
  const prompt = `
    Generate a personalized ${insight.suggestedChannel} message for ${user.name}.
    Context: ${insight.recommendation}
    Risk Factors: ${insight.riskFactors.join(", ")}
    
    The message should be professional yet warm, aiming to bring them back to the platform.
    Return the content as a string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return {
      userId: user.id,
      userName: user.name,
      type: insight.suggestedChannel,
      content: response.text || "We miss you! Come back and see what's new.",
      status: 'pending',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating outreach:", error);
    return {
      userId: user.id,
      userName: user.name,
      type: insight.suggestedChannel,
      content: "We miss you! Come back and see what's new.",
      status: 'pending',
      timestamp: new Date().toISOString(),
    };
  }
}

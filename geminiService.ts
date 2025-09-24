import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

let ai: GoogleGenAI | null = null;

const MISSING_KEY_ERROR_MESSAGE = "The AI helper is currently unavailable. The API key has not been configured for this environment.";

/**
 * Lazily initializes and returns the GoogleGenAI client.
 * This prevents the app from crashing on load if the API key is not set.
 */
const getAiClient = (): GoogleGenAI | null => {
    // Return the cached client if it already exists
    if (ai) {
        return ai;
    }

    // The API key is obtained from environment variables injected by the platform.
    const apiKey = process.env.API_KEY;

    if (apiKey) {
        console.log("Gemini AI Client Initialized.");
        ai = new GoogleGenAI({ apiKey });
        return ai;
    }

    console.warn("Could not initialize Gemini AI Client: API_KEY is missing from environment variables.");
    return null;
}

export const generateApplicationTips = async (jobTitle: string, jobDescription: string): Promise<string> => {
    const localAi = getAiClient();
    if (!localAi) {
        return MISSING_KEY_ERROR_MESSAGE;
    }

    const prompt = `
        As a career coach, provide 3-5 concise, actionable tips for someone applying for the following job. 
        Focus on how they can stand out. Format the response as a simple list.

        Job Title: ${jobTitle}
        Job Description: ${jobDescription}

        Tips:
    `;

    try {
        const response: GenerateContentResponse = await localAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating application tips:", error);
        return "Sorry, I couldn't generate tips at this time. Please try again later.";
    }
};

export const generateVouchRequestMessage = async (userName: string, skills: string[]): Promise<string> => {
    const localAi = getAiClient();
    if (!localAi) {
        return MISSING_KEY_ERROR_MESSAGE;
    }

    const skillsText = skills.length > 1 
        ? skills.slice(0, -1).join(', ') + ' & ' + skills.slice(-1)
        : skills[0];

    const prompt = `
        You are a friendly career assistant for a South African audience.
        Write a short, polite, and effective message (around 50-70 words) that a user can send to a colleague or friend to ask for a "vouch" for specific skills on their VouchWork SA profile.
        The tone should be warm, relatable, and use common South African colloquialisms.

        User's Name: "${userName}"
        Skills to Vouch For: "${skillsText}"

        Instructions:
        1. Start with a friendly South African greeting like "Howzit [Name]," or "Hey [Name],".
        2. Mention that you're building your profile on VouchWork SA to find some local gigs.
        3. Ask them if they would be willing to vouch for the skill(s) mentioned.
        4. Keep it concise and easy to read.
        5. End with a friendly closing like "Thanks a mil," or "Cheers,".
    `;

    try {
        const response: GenerateContentResponse = await localAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating vouch request message:", error);
        return "Sorry, I couldn't generate a message right now. Please try again.";
    }
};

export const generateFairPaySuggestion = async (jobTitle: string, skills: string[], location: string): Promise<string> => {
    const localAi = getAiClient();
    if (!localAi) {
        return MISSING_KEY_ERROR_MESSAGE;
    }

    const prompt = `
        You are an economic analyst specializing in the South African job market for odd jobs and skilled labor.
        Based on the following job details, provide a fair pay range. The output should be a single, concise string.
        For example: "R180 - R250 / hour" or "R4500 - R6000 / project".
        Do not add any extra explanation. Just provide the range.

        Job Title: "${jobTitle}"
        Skills: ${skills.join(', ')}
        Location: ${location}
    `;

    try {
        const response: GenerateContentResponse = await localAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.5,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating fair pay suggestion:", error);
        return "Could not generate a suggestion at this time.";
    }
};
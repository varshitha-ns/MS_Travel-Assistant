import { generateChatCompletion } from "./huggingFaceService.js";

export const extractTripInformation = async (
    currentSession,
    userMessage
) => {

    const systemPrompt = `
You are an information extraction AI.

Your task is ONLY to extract travel information.

Rules:

1. Return ONLY valid JSON.

2. Never explain anything.

3. Never generate itinerary.

4. Only extract information mentioned by the user.

5. Do NOT overwrite existing values unless user explicitly changes them.

The allowed fields are:

{
    "source": string | null,
    "destination": string | null,
    "days": number | null,
    "travellers": number | null,
    "budget": number | null,
    "travelStyle": string | null,
    "hotelPreference": string | null,
    "interests": string[] | null
}
`;

    const userPrompt = `
Current Session:

${JSON.stringify(currentSession, null, 2)}

User Message:

"${userMessage}"
`;

    const response = await generateChatCompletion({
        systemPrompt,
        userPrompt,
        temperature: 0,
        responseFormat: {
            type: "json_object"
        }
    });

    try {

        return JSON.parse(response);

    } catch {

        throw new Error("Invalid JSON returned from LLM.");

    }

};
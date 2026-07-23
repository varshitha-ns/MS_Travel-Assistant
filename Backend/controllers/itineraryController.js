import { HfInference } from '@huggingface/inference';
import { getLiveWeather } from '../services/weatherService.js';


const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

// Using the highly stable, globally supported serverless endpoint
const MODEL_IDENTIFIER = 'Qwen/Qwen2.5-72B-Instruct';

export const generateItinerary = async (req, res) => {
  try {
    const { prompt, userPreferences } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt context is required." });
    }

    // ─── STEP 1: DESTINATION EXTRACTION ───
    const extractionResponse = await hf.chatCompletion({
      model: MODEL_IDENTIFIER,
      messages: [
        {
          role: "user",
          content: `Extract only the destination city or state name from this text: "${prompt}". Respond with only the name of the location, nothing else. Do not add any punctuation or extra words.`
        }
      ],
      max_tokens: 30,
      temperature: 0.1
    });

    const location = extractionResponse.choices[0].message.content.trim();
    console.log(`🤖 Itinerary Agent extracted location target: [${location}]`);

    // ─── STEP 2: SAFE CONCURRENT TOOL RESOLUTION ───
  const weather = await getLiveWeather(location);
    // ─── STEP 3: STRATEGIC ITINERARY GENERATION ───
    const agentPrompt = `
      You are an autonomous travel coordinator agent.
      Destination Target: ${location}
      Live Weather Conditions: ${JSON.stringify(weather)}
     
      User Extra Input: ${userPreferences || "None"}

      CRITICAL LOOPS:
      - If weather indicates "Rain" or "Storm", select indoor venues.
      - Return the final result strictly as a raw, single-line valid JSON object. Do not include markdown formatting like \`\`\`json. Do not include conversational introduction text.

      Expected JSON Structure:
      {
        "destination": "${location}",
        "weatherAlertFlag": ${weather.condition === 'Rain' || weather.condition === 'Storm'},
        "agentAssessmentText": "Write explicit reasoning explaining how live weather and crowd metrics shaped this plan.",
        "steps": [
          { "time": "09:00 AM", "activity": "Morning itinerary activity text", "status": "AI Recommended" },
          { "time": "01:00 PM", "activity": "Afternoon itinerary activity text", "status": "Confirmed" }
        ]
      }
    `;

    const agentResponse = await hf.chatCompletion({
      model: MODEL_IDENTIFIER,
      messages: [
        {
          role: "user",
          content: agentPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    let rawText = agentResponse.choices[0].message.content.trim();
    
    // Clean up any stray markdown blocks if the model fails to follow structural bounds perfectly
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    // Direct JSON delivery mapping
    const parsedItinerary = JSON.parse(rawText);
    return res.status(200).json(parsedItinerary);

  } catch (error) {
    console.error("🚨 Critical failure in the Hugging Face Agent Pipeline:", error);
    return res.status(500).json({ message: `Agent pipeline tracking failure: ${error.message}` });
  }
};
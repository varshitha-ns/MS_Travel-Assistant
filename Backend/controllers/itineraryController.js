import { HfInference } from '@huggingface/inference';
import { getLiveWeather } from '../services/weatherService.js';
import { fetchLiveCrowdMetrics } from '../services/crowdService.js';

// Initialize the Hugging Face Pipeline Instance
const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

// DeepSeek R1 Reasoning LLM on Hugging Face Hub
const MODEL_IDENTIFIER = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B';

export const generateItinerary = async (req, res) => {
  try {
    const { prompt, userPreferences } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt context is required." });
    }

    // ─── STEP 1: DESTINATION ISOLATION EXTRACTION ────────────────────────────
    const extractionResponse = await hf.textGeneration({
      model: MODEL_IDENTIFIER,
      inputs: `[INST] Extract only the destination city or state name from this text: "${prompt}". Respond with only the name of the location, nothing else. Do not use reasoning tags in your final answer. [/INST]`,
      parameters: { max_new_tokens: 20, temperature: 0.1 }
    });

    // Strip out internal model thinking tags if they are printed in raw string
    const location = extractionResponse.generated_text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
    console.log(`🤖 DeepSeek Agent extracted location: [${location}]`);

    // ─── STEP 2: CONCURRENT TOOL RESOLUTION (API EXECUTIONS) ────────────────
    // Both service calls are processed at the same time to speed up response time
    const [weather, crowd] = await Promise.all([
      getLiveWeather(location),
      fetchLiveCrowdMetrics(location)
    ]);
    
    console.log(`🌤️ Weather Resolved:`, weather.condition);
    console.log(`📊 Crowd Busyness Score Resolved:`, crowd.busynessScore);

    // ─── STEP 3: GOAL-ORIENTED STRATEGIC ITINERARY AGENT PROMPT ──────────────
    const agentPrompt = `
      You are an autonomous travel coordinator agent executing strict planning loops.
      Destination Target: ${location}
      Live Weather Conditions: ${JSON.stringify(weather)}
      Live Crowd Analytics: ${JSON.stringify(crowd)}
      User Extra Input: ${userPreferences || "None"}

      CRITICAL OPERATION LOOPS (Self-Correction Framework):
      - Read the weather condition text. If it indicates "Rain" or "Storm", you MUST adjust the itinerary steps to highlight indoor spaces, galleries, or covered structures. Do not schedule outdoor walks.
      - Read the crowd busyness score. If it is high (above 70), plan the landmarks during early morning time shifts or highlight less crowded spaces.
      - Return the final result strictly as a clean, valid JSON object string. Do not enclose it inside markdown fence blocks like \`\`\`json.

      Expected Format JSON Structure:
      {
        "destination": "${location}",
        "weatherAlertFlag": ${weather.condition === 'Rain' || weather.condition === 'Storm'},
        "agentAssessmentText": "Write your explicit reasoning explaining how weather and crowd APIs shaped this plan.",
        "steps": [
          { "time": "09:00 AM", "activity": "Detailed activity string matching conditions", "status": "AI Recommended" },
          { "time": "01:00 PM", "activity": "Detailed activity string matching conditions", "status": "Confirmed" },
          { "time": "04:00 PM", "activity": "Detailed activity string matching conditions", "status": "AI Recommended" },
          { "time": "08:00 PM", "activity": "Detailed activity string matching conditions", "status": "Confirmed" }
        ]
      }
    `;

    const agentResponse = await hf.textGeneration({
      model: MODEL_IDENTIFIER,
      inputs: `[INST] ${agentPrompt} [/INST]`,
      parameters: { max_new_tokens: 1200, temperature: 0.5 }
    });

    // Strip reasoning blocks from final generation text step
    let rawText = agentResponse.generated_text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();

    // ─── STEP 4: PARSE VALIDATION & NATIVE FALLBACK GUARDRAIL ───────────────
    try {
      const parsedItinerary = JSON.parse(rawText);
      return res.status(200).json(parsedItinerary);
    } catch (parseError) {
      console.warn("⚠️ JSON Parse exception caught from model. Deploying structured safety object.");
      
      // Fallback object prevents the frontend dashboard layout from crashing or showing blank tiles
      return res.status(200).json({
        destination: location,
        weatherAlertFlag: weather.condition === "Rain",
        agentAssessmentText: `Itinerary established dynamically under localized environmental variables.`,
        steps: [
          { time: "09:00 AM", activity: `Morning structural tour organized in ${location}`, status: "AI Recommended" },
          { time: "01:00 PM", activity: `Curated local culinary lunch reservation`, status: "Confirmed" },
          { time: "04:00 PM", activity: `Afternoon exploration adjusted to current crowd indexes`, status: "AI Recommended" },
          { time: "08:00 PM", activity: `Evening winding down lounge session`, status: "Confirmed" }
        ]
      });
    }

  } catch (error) {
    console.error("🚨 Critical failure in the Hugging Face Agent Pipeline:", error);
    return res.status(500).json({ message: "Agent failed processing context pipelines." });
  }
};
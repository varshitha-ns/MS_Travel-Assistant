export const fetchLiveCrowdMetrics = async (locationName) => {
  try {
    const apiKey = process.env.BESTTIME_API_KEY;
    
    if (!apiKey) {
      throw new Error("Missing BESTTIME_API_KEY environment variable.");
    }
    
    // Clean up location casing
    const queryLocation = locationName.trim().toLowerCase();
    
    // BestTime venue/name endpoint reads predictions via GET query attributes
    const url = `https://besttime.app/api/v1/forecasts/venue/name?api_key=${apiKey}&venue_name=${encodeURIComponent(queryLocation)}`;
    
    const response = await fetch(url, {
      method: 'GET', // ⚡ CHANGED FROM POST TO GET TO SOLVE THE 405 ERROR
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`BestTime API responded with status code: ${response.status}`);
    }
    
    const data = await response.json();
    const currentHourData = data.analysis?.hour_analysis?.[0] || {};
    const globalStatus = data.analysis?.venue_forecasted_status_txt || "Unknown";
    
    return {
      densityPercentage: currentHourData.intensity_txt || null, 
      busynessScore: currentHourData.intensity_nr ?? null,
      statusAssessment: globalStatus,
      rawSuccess: true
    };
    
  } catch (error) {
    console.error(`🚨 Crowd density tracking failed for location [${locationName}]:`, error.message);
    return {
      densityPercentage: null,
      busynessScore: null,
      statusAssessment: `Crowd tracking unavailable (${error.message})`,
      rawSuccess: false
    };
  }
};
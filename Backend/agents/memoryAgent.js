import TripSession from "../models/TripSession.js";
import { extractTripInformation } from "../services/extractionService.js";

/**
 * Updates the current trip session
 * using the latest user message.
 */

export const updateTripSession = async (
    sessionId,
    userMessage
) => {
    //load existing sesssion
    const session = await Tripsession.findById(sessionId);

    if(!session){
        throw new Error("TripSession not found");
    }

    //Ask AI to extract information from the user message
    const extractedFields = await extractTripInformation(
        session,
        userMessage
    );

    //Update the session with the extracted fields
    mergeSession(session, extractedFields);

    //Save the updated session
    await session.save();
    return session;
};

/**
 *  
 * Merges the extracted fields into the current session.
 * Ensures that existing values are not overwritten unless explicitly changed by the user.
 */     

const mergeSession = (session, extractedFields) => {

   Object.entries(extractedFields).forEach(([key, value]) => {

    if(value === null || value === undefined)
        return;

    if(Array.isArray(value) && value.length === 0)
        return;

    session[key]=value;

});
};
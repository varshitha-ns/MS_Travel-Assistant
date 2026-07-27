import TripSession from "../models/TripSession.js";
import { evaluateTripSession } from "./plannerAgent.js";
import { updateTripSession } from "./memoryAgent.js";

/**
 * Handles the complete conversation flow.
 */
export const handleConversation = async ({
    sessionId,
    userId,
    message
}) => {

    let session;

    /**
     * STEP 1
     * Existing conversation?
     */
    if (sessionId) {

        session = await updateTripSession(
            sessionId,
            message
        );

    }

    /**
     * STEP 2
     * New conversation
     */
    else {

        session = await TripSession.create({

            userId,

            destination: extractDestination(message),

            days: extractDays(message)

        });

    }

    /**
     * STEP 3
     * Ask Planner what to do next.
     */

    const plannerResult =
        await evaluateTripSession(session._id);

    /**
     * STEP 4
     * Still collecting information.
     */

    if (!plannerResult.completed) {

        return {

            type: "QUESTION",

            sessionId: session._id,

            field: plannerResult.nextField,

            message: plannerResult.question

        };

    }

    /**
     * STEP 5
     * Enough information collected.
     */

    return {

        type: "READY",

        session

    };

};

initiaaly my architecture is the user on successfull login come to dashboard where there are two ways 



1 - the user knows where to travel and ask the agent in there to plan a itenary accordingly as specified destination and number of days then the agent after user tells their travel destination asks for budget number of people and start point of their trip (also add fields that are required further only valid)

2 nd case : where user already decides to stay in resort or hotel of their choice then check the availabilty of that place , if available allow them to book it or it is booked 





2 type of user: where he just wabts to plan a trip but dont know about place hence asks for suggesting by agent itself here comes the agent where it asks to travel within the user state itself or any place within india , then based on user previous travel destinations and trvel tatste if present in history any can agent use that to recommend such places or if ge is new one then agent based on weather and other comfort factors suggest the places 







only if both type of users eacg lock in the itenary the agent suggests then with that itenary as blueprint goes next step if l



1st case : looking and recommending for hotels nearbby within budget friendly and number of people that was asked before,



and then if any trekking places are present in itenary or other adventutres games or anythinh involved suggest and recommend to book it a wjolesome pack, if want to try famoos cuisine of that place suggest a place for that to try those type of foods and tell or give intro to culture over there 







                                               
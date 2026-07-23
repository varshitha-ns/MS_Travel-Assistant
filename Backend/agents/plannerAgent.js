import TripSession from "../models/TripSession.js";

/**
 * Order matters.
 * Planner will ask questions in this sequence.
 */
const REQUIRED_FIELDS = [
    {
        field: "source",
        question: "Where will your journey start from?"
    },
    {
        field: "travellers",
        question: "How many travellers are going?"
    },
    {
        field: "budget",
        question: "What is your approximate budget for this trip?"
    },
    {
        field: "travelStyle",
        question: "Is this a Solo, Family, Friends or Couple trip?"
    },
    {
        field: "hotelPreference",
        question: "What type of accommodation do you prefer? (Budget, 3-Star, 5-Star, Resort)"
    },
    {
        field: "interests",
        question: "What are your interests? (Nature, Food, Adventure, History, Shopping...)",
        validator: (value) => Array.isArray(value) && value.length > 0
    }
];

/**
 * Checks whether a field has meaningful data.
 */
const hasValue = (value) => {

    if (Array.isArray(value))
        return value.length > 0;

    return value !== null &&
           value !== undefined &&
           value !== "";
};

/**
 * Finds the next missing field.
 */
const findNextMissingField = (session) => {

    for (const config of REQUIRED_FIELDS) {

        const value = session[config.field];

        if (config.validator) {

            if (!config.validator(value))
                return config;

            continue;
        }

        if (!hasValue(value))
            return config;
    }

    return null;
};

/**
 * Planner Agent
 */
export const evaluateTripSession = async (sessionId) => {

    const session = await TripSession.findById(sessionId);

    if (!session)
        throw new Error("Trip Session not found.");

    const nextField = findNextMissingField(session);

    if (!nextField) {

        return {

            completed: true,

            session

        };
    }

    return {

        completed: false,

        nextField: nextField.field,

        question: nextField.question,

        session

    };
};
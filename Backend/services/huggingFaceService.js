import {HfInference} from "@huggingface/inference";

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

const Model = process.env.HF_MODEL || 'Qwen/Qwen2.5-72B-Instruct';

export const generateChatCompletion = async (
    messages,
    options ={}
) =>{
    try{
    const response = await hf.chatCompletion({
        model: Model,
        messages,
        temperature: options.temperature || 0.2,
        max_tokens: options.max_tokens ?? 600,
        top_p: options.top_p ?? 0.9,
        response_format: options.response_format
    })

    return response.choices[0].message.content;

}catch(error){
    console.error("Hugging Face error:",error);
    throw new Error("Unable to connect with AI model");
}
};
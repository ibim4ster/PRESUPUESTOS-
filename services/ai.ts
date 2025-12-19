import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client with the API key from environment variables.
// Guidelines: MUST use new GoogleGenAI({apiKey: process.env.API_KEY})
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Service to interact with Gemini AI for content generation and enhancement.
 * Follows the @google/genai coding guidelines.
 */
export const aiService = {
    /**
     * Checks if the API key is available in the environment.
     */
    isAvailable: () => !!process.env.API_KEY,

    /**
     * Polishes product descriptions using Gemini 3 Flash.
     * Basic Text Task: 'gemini-3-flash-preview'
     */
    polishDescription: async (text: string): Promise<string> => {
        if (!text || !process.env.API_KEY) return text;
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Mejora profesionalmente la siguiente descripción de producto para una propuesta comercial: "${text}". Responde solo con el texto mejorado.`,
            });
            // Guidelines: use response.text property directly
            return response.text || text;
        } catch (e) {
            console.error("Gemini API Error (polishDescription):", e);
            return text;
        }
    },

    /**
     * Generates a professional introduction for a budget document.
     * Basic Text Task: 'gemini-3-flash-preview'
     */
    generateIntro: async (clientName: string, products: string[]): Promise<string> => {
        if (!process.env.API_KEY) return '';
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Escribe una introducción breve y profesional para un presupuesto comercial dirigido a "${clientName}". Menciona estas soluciones: ${products.join(', ')}.`,
            });
            return response.text || '';
        } catch (e) {
            console.error("Gemini API Error (generateIntro):", e);
            return '';
        }
    },

    /**
     * Generates emails for budget delivery or follow-up.
     * Basic Text Task: 'gemini-3-flash-preview'
     */
    generateEmail: async (type: 'send' | 'followup', clientName: string, budgetNum: string): Promise<{subject: string, body: string}> => {
        if (!process.env.API_KEY) {
            return { 
                subject: `Presupuesto ${budgetNum}`, 
                body: `Estimado ${clientName},\n\nAdjunto le remitimos el presupuesto solicitado.` 
            };
        }
        try {
            const prompt = type === 'send' 
                ? `Redacta un email profesional para enviar el presupuesto ${budgetNum} a ${clientName}.` 
                : `Redacta un email de seguimiento para el presupuesto ${budgetNum} enviado a ${clientName}.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            
            const text = response.text || '';
            const subjectMatch = text.match(/Asunto:\s*(.*)/i);
            const subject = subjectMatch ? subjectMatch[1] : `Presupuesto ${budgetNum} - ${clientName}`;
            const body = text.replace(/Asunto:.*\n?/i, '').trim();

            return { subject, body };
        } catch (e) {
            console.error("Gemini API Error (generateEmail):", e);
            return { 
                subject: `Presupuesto ${budgetNum}`, 
                body: `Estimado ${clientName},\n\nAdjunto le remitimos el presupuesto solicitado.\n\nQuedamos a su disposición.\n\nAtentamente.` 
            };
        }
    },

    /**
     * Analyzes sales performance and gives strategic advice.
     * Complex Text Task: 'gemini-3-pro-preview'
     */
    getSalesAdvice: async (stats: any): Promise<string> => {
        if (!process.env.API_KEY) return "Sigue empujando, ¡estás haciendo un gran trabajo! 🚀";
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `Analiza estas estadísticas de ventas y proporciona un consejo estratégico breve y motivador: ${JSON.stringify(stats)}`,
            });
            return response.text || "Sigue empujando, ¡estás haciendo un gran trabajo! 🚀";
        } catch (e) {
            console.error("Gemini API Error (getSalesAdvice):", e);
            return "Sigue empujando, ¡estás haciendo un gran trabajo! 🚀";
        }
    }
};

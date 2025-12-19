
import { GoogleGenAI } from "@google/genai";

export const aiService = {
    isAvailable: () => !!process.env.API_KEY,

    polishDescription: async (text: string): Promise<string> => {
        if (!process.env.API_KEY) return text;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Mejora comercialmente esta descripción técnica de un producto para un presupuesto profesional. Mantenlo conciso pero atractivo. Texto original: "${text}"`,
            });
            return response.text || text;
        } catch (error) {
            console.error("AI polish error:", error);
            return text;
        }
    },

    generateIntro: async (clientName: string, products: string[]): Promise<string> => {
        if (!process.env.API_KEY) return '';
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Escribe una carta de presentación breve y profesional para un presupuesto dirigido al cliente "${clientName}". Menciona de forma elegante que se incluyen soluciones de: ${products.join(', ')}.`,
            });
            return response.text || '';
        } catch (error) {
            console.error("AI intro error:", error);
            return '';
        }
    },

    generateEmail: async (type: 'send' | 'followup', clientName: string, budgetNum: string): Promise<{subject: string, body: string}> => {
        if (!process.env.API_KEY) {
            return { 
                subject: `Presupuesto ${budgetNum}`, 
                body: `Estimado ${clientName},\n\nAdjunto le remitimos el presupuesto solicitado.\n\nQuedamos a su disposición.\n\nAtentamente.` 
            };
        }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = type === 'send' 
                ? `Redacta el asunto y cuerpo de un email para enviar el presupuesto ${budgetNum} al cliente ${clientName}.`
                : `Redacta un email de seguimiento (follow-up) amable para el presupuesto ${budgetNum} enviado a ${clientName}.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `${prompt} Responde solo en formato JSON con las claves "subject" y "body".`,
            });
            
            const cleaned = response.text?.replace(/```json|```/g, '').trim();
            return JSON.parse(cleaned || '{}');
        } catch (error) {
            return { 
                subject: `Presupuesto ${budgetNum}`, 
                body: `Estimado ${clientName},\n\nAdjunto le remitimos el presupuesto solicitado.\n\nQuedamos a su disposición.\n\nAtentamente.` 
            };
        }
    },

    getSalesAdvice: async (stats: any): Promise<string> => {
        return "Sigue empujando, ¡estás haciendo un gran trabajo! 🚀";
    }
};

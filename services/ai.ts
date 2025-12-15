
import { GoogleGenAI } from "@google/genai";

const AI_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: AI_KEY });

export const aiService = {
    isAvailable: () => !!AI_KEY,

    polishDescription: async (text: string): Promise<string> => {
        if (!AI_KEY) return text;
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Mejora la siguiente descripción de un producto tecnológico para que sea atractiva, profesional y orientada a ventas, pero mantenla concisa (máximo 2 frases): "${text}"`,
            });
            return response.text?.replace(/"/g, '') || text;
        } catch (e) {
            console.error("AI Error:", e);
            return text;
        }
    },

    generateIntro: async (clientName: string, products: string[]): Promise<string> => {
        if (!AI_KEY) return '';
        try {
            const productList = products.join(', ');
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Escribe una breve introducción formal y persuasiva (máximo 3 párrafos cortos) para un presupuesto dirigido a "${clientName}". Estamos ofreciendo: ${productList}. El tono debe ser profesional y enfocado en el valor añadido.`,
            });
            return response.text || '';
        } catch (e) {
            console.error("AI Error:", e);
            return '';
        }
    },

    generateEmail: async (type: 'send' | 'followup', clientName: string, budgetNum: string): Promise<{subject: string, body: string}> => {
        if (!AI_KEY) return { subject: '', body: '' };
        try {
            const prompt = type === 'send' 
                ? `Redacta un asunto y un cuerpo de email para enviar el presupuesto ${budgetNum} al cliente ${clientName}. Tono profesional y amable.`
                : `Redacta un asunto y un cuerpo de email de seguimiento para preguntar al cliente ${clientName} qué le pareció el presupuesto ${budgetNum}. Tono cercano pero respetuoso.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            
            const text = response.text || '{}';
            // Try to extract JSON if wrapped in markdown
            const jsonStr = text.replace(/```json|```/g, '').trim();
            const data = JSON.parse(jsonStr);
            return { subject: data.subject || '', body: data.body || data.content || '' };
        } catch (e) {
            // Fallback manual parsing if JSON fails (unlikely with gemini-2.5-flash json mode but possible)
            return { subject: `Presupuesto ${budgetNum}`, body: `Estimado ${clientName}, adjunto presupuesto.` };
        }
    },

    getSalesAdvice: async (stats: any): Promise<string> => {
        if (!AI_KEY) return "Configura tu API Key para recibir consejos de ventas.";
        try {
            const prompt = `Actúa como un director comercial experto y motivador.
            Analiza estos datos del mes:
            - Ventas Totales: ${stats.totalMonth}€
            - Objetivo: ${stats.goal}€
            - Presupuestos Pendientes: ${stats.pending}
            - Tasa de Cierre (Aceptados): ${stats.accepted}
            
            Dame un consejo estratégico, breve y directo (máximo 2 frases) para mejorar los resultados antes de fin de mes. Usa emojis. Dirígete al vendedor de tú.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text || "Sigue empujando, ¡estás haciendo un gran trabajo! 🚀";
        } catch (e) {
            return "Concéntrate en cerrar los presupuestos pendientes de mayor valor. 💼";
        }
    }
};

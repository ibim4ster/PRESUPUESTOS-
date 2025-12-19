
// AI Service Disabled to fix Vercel Build
// Removed @google/genai dependency

export const aiService = {
    isAvailable: () => false,

    polishDescription: async (text: string): Promise<string> => {
        return text;
    },

    generateIntro: async (clientName: string, products: string[]): Promise<string> => {
        return '';
    },

    generateEmail: async (type: 'send' | 'followup', clientName: string, budgetNum: string): Promise<{subject: string, body: string}> => {
        return { 
            subject: `Presupuesto ${budgetNum}`, 
            body: `Estimado ${clientName},\n\nAdjunto le remitimos el presupuesto solicitado.\n\nQuedamos a su disposición.\n\nAtentamente.` 
        };
    },

    getSalesAdvice: async (stats: any): Promise<string> => {
        return "Sigue empujando, ¡estás haciendo un gran trabajo! 🚀";
    }
};

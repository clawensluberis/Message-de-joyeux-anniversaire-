import { GoogleGenAI, Type } from "@google/genai";
import { BirthdayFormData, Tone } from "../types";

const apiKey = process.env.API_KEY;
// Note: In a production environment, never expose keys on the client side. 
// This is structured for the specific runtime environment requested.
const ai = new GoogleGenAI({ apiKey: apiKey });

export const generateBirthdayWish = async (formData: BirthdayFormData): Promise<{ subject: string; body: string }> => {
  if (!apiKey) {
    throw new Error("Clé API manquante.");
  }

  // Instructions spécifiques basées sur le ton
  let toneInstruction = "";
  switch (formData.tone) {
    case Tone.LATE:
      toneInstruction = "Le message doit commencer par s'excuser avec humour ou élégance pour le retard.";
      break;
    case Tone.SARCASTIC:
      toneInstruction = "Utilise un humour pince-sans-rire, taquin, mais qui reste affectueux au fond.";
      break;
    case Tone.FORMAL:
      toneInstruction = "Reste très poli, vouvoie si c'est un supérieur ou un client, pas d'émojis ou très peu.";
      break;
    case Tone.ENTHUSIASTIC:
      toneInstruction = "Utilise beaucoup de points d'exclamation, des émojis festifs et une énergie débordante.";
      break;
    default:
      toneInstruction = "Adapte le niveau de familiarité à la relation indiquée.";
  }

  const prompt = `
    Rédige un email d'anniversaire en français pour "${formData.recipientName}".
    
    PARAMÈTRES :
    - Relation : ${formData.relationship}
    - Ton : ${formData.tone}
    - Âge : ${formData.age ? formData.age + " ans" : "Non spécifié"}
    - Détails à inclure : ${formData.details || "Aucun détail spécifique, sois créatif."}

    CONSIGNES DE RÉDACTION :
    1. ${toneInstruction}
    2. Structure l'email avec des sauts de ligne clairs entre les paragraphes pour faciliter la lecture.
    3. Utilise des émojis pertinents (🎂, 🎉, etc.) sauf si le ton est 'Formel'.
    4. L'objet de l'email doit être accrocheur et donner envie d'ouvrir.
    5. Termine par une signature adaptée (ex: 'Ton ami', 'Cordialement', etc.) avec un placeholder [Ton Prénom].
    
    Format de sortie attendu : JSON uniquement.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: "L'objet de l'email, court et engageant.",
            },
            body: {
              type: Type.STRING,
              description: "Le corps de l'email formaté avec des sauts de ligne (\\n), des émojis et une structure claire.",
            },
          },
          required: ["subject", "body"],
        },
        systemInstruction: "Tu es un rédacteur professionnel spécialisé dans la communication émotionnelle et sociale. Tu as une excellente maîtrise du français, de la grammaire et des nuances de ton.",
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("Réponse vide de l'IA.");
    }

    const result = JSON.parse(jsonText);
    return {
      subject: result.subject,
      body: result.body
    };

  } catch (error) {
    console.error("Erreur lors de la génération :", error);
    throw new Error("Impossible de générer l'email pour le moment. Veuillez réessayer.");
  }
};
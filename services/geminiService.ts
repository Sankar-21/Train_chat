import { GoogleGenAI } from "@google/genai";

// FIX: Per coding guidelines, the API key must be passed directly from process.env and assumed to be valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAnonymousName = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a fun, anonymous two-word name for a chat user. The format must be 'Adjective Animal'. Examples: Witty Wallaby, Clever Cheetah, Zany Zebra. Provide only the name itself, with no extra text or quotation marks.`,
      config: {
        temperature: 1,
        maxOutputTokens: 10,
        // FIX: Per coding guidelines, when using maxOutputTokens with 'gemini-2.5-flash', a thinkingBudget must be set.
        thinkingConfig: { thinkingBudget: 5 },
      },
    });

    const name = response.text.trim().replace(/"/g, ""); // Clean up response
    if (!name || name.split(" ").length < 2) {
      // Fallback in case of unexpected response
      return "Mystery Mink";
    }
    return name;
  } catch (error) {
    console.error("Error generating anonymous name:", error);
    // Local random name generator fallback
    const adjectives = [
      "Witty",
      "Clever",
      "Zany",
      "Friendly",
      "Mystery",
      "Brave",
      "Jolly",
      "Swift",
      "Gentle",
      "Bold",
      "Lucky",
      "Curious",
      "Sunny",
      "Daring",
      "Calm",
      "Happy",
      "Nimble",
      "Silly",
      "Quiet",
      "Wild",
    ];
    const animals = [
      "Fox",
      "Wallaby",
      "Cheetah",
      "Zebra",
      "Mink",
      "Jaguar",
      "Otter",
      "Panda",
      "Wolf",
      "Rabbit",
      "Lion",
      "Tiger",
      "Bear",
      "Deer",
      "Hawk",
      "Eagle",
      "Seal",
      "Swan",
      "Moose",
      "Lynx",
    ];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const suffix =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8)
        : Math.floor(Math.random() * 1000000);
    return `${adjective} ${animal} ${suffix}`;
  }
};

id: `user_${Date.now()}_${Math.random()}`;

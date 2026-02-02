
import { GoogleGenAI, Type } from "@google/genai";
import { MuscleGroup, CardioPlacement, SessionPlan, Exercise } from "../types";

export const generateWorkout = async (goal: string, type: MuscleGroup, count: number = 4): Promise<Partial<SessionPlan>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Design a high-impact gym session for the following goal: "${goal}". Target Muscle Group: ${type}. Provide exactly ${count} exercises with sets and reps. Also suggest cardio placement (Start/End/None) and duration.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                sets: { type: Type.NUMBER },
                reps: { type: Type.STRING }
              },
              required: ["name", "sets", "reps"]
            }
          },
          cardioPlacement: { type: Type.STRING, description: "Start, End, or None" },
          cardioMinutes: { type: Type.NUMBER },
          plannedDurationMinutes: { type: Type.NUMBER }
        },
        required: ["exercises", "cardioPlacement", "cardioMinutes", "plannedDurationMinutes"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return {
      goalText: goal,
      workoutType: type,
      exerciseCount: data.exercises.length,
      exercises: data.exercises.map((e: any, i: number) => ({
        id: `gen-${i}-${Date.now()}`,
        name: e.name,
        muscleGroup: type,
        sets: e.sets,
        reps: e.reps
      })),
      cardioPlacement: (data.cardioPlacement.toUpperCase() as CardioPlacement) || CardioPlacement.NONE,
      cardioMinutes: data.cardioMinutes,
      plannedDurationMinutes: data.plannedDurationMinutes
    };
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw e;
  }
};

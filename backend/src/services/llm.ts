import { GoogleGenAI } from "@google/genai";

import { prisma } from "../lib/prisma";
import { InternalServerError } from "../utils/errors";

const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const ai = new GoogleGenAI({});

/**
 * Identify required skills for a task based on its title using LLM
 * @param taskTitle - The title of the task
 * @returns Array of skill names that match the task description
 */
export const identifySkillsFromTask = async (taskTitle: string): Promise<string[]> => {
    // Get all available skills from the database
    const availableSkills = await prisma.skill.findMany();
    const skillNames = availableSkills.map((s) => s.name);

    if (skillNames.length === 0) {
        return [];
    }

    const prompt = `You are a task skill analyzer. Given a task title/description, identify which skills from the provided list are required to complete this task.

Available skills: ${skillNames.join(", ")}

Task: "${taskTitle}"

Respond with ONLY a JSON array of skill names that are relevant to this task. If no skills are relevant, return an empty array [].
Example response: ["Frontend", "Backend"] or ["UI/UX Design"] or []

Do not include any other text, just the JSON array.`;

    const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
    });
    const responseText = result.text;

    // Parse the JSON response - try to extract JSON array from response
    let identifiedSkills: string[] = [];
    try {
        // First try direct parsing
        identifiedSkills = responseText ? JSON.parse(responseText) : [];
    } catch {
        // If that fails, try to extract JSON array from the text
        const jsonMatch = responseText?.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            identifiedSkills = JSON.parse(jsonMatch[0]);
        } else {
            throw new InternalServerError("LLM returned invalid format");
        }
    }

    // Validate that the skills exist in our database
    const validSkills = identifiedSkills.filter((skill: string) =>
        skillNames.some((s) => s.toLowerCase() === skill.toLowerCase())
    );

    // Return with proper casing from database
    const result_skills = validSkills.map(
        (skill: string) => skillNames.find((s) => s.toLowerCase() === skill.toLowerCase()) || skill
    );

    return result_skills;
};

/**
 * Get skill IDs from skill names
 * @param skillNames - Array of skill names
 * @returns Array of skill IDs
 */
export const getSkillIdsByNames = async (skillNames: string[]): Promise<string[]> => {
    if (skillNames.length === 0) return [];

    const skills = await prisma.skill.findMany({
        where: {
            name: {
                in: skillNames,
            },
        },
    });

    return skills.map((s) => s.id);
};

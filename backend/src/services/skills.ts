import { prisma } from "../lib/prisma";
import type { Skill } from "../../generated/prisma";
import { NotFoundError } from "../utils/errors";

export const getAllSkills = async () => {
    return await prisma.skill.findMany({
        orderBy: {
            name: "asc",
        },
    });
};

export const getSkill = async (skillId: Skill["id"]) => {
    const skill = await prisma.skill.findUnique({
        where: { id: skillId },
    });

    if (!skill) {
        throw new NotFoundError("Skill not found");
    }

    return skill;
};

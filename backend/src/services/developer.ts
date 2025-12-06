import { prisma } from "../lib/prisma";
import type { Developer, Skill, Task } from "../../generated/prisma";
import { NotFoundError } from "../utils/errors";

export const getAllDevelopers = async (): Promise<
    Array<Developer & { skills: Skill[]; tasks: Task[] }>
> => {
    return await prisma.developer.findMany({
        include: {
            skills: true,
            tasks: true,
        },
        orderBy: {
            name: "asc",
        },
    });
};

export const getDeveloper = async (
    developerId: string
): Promise<Developer & { skills: Skill[]; tasks: Task[] }> => {
    const developer = await prisma.developer.findUnique({
        where: { id: developerId },
        include: {
            skills: true,
            tasks: true,
        },
    });
    if (!developer) throw new NotFoundError("Developer not found");
    return developer;
};

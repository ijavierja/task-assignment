import { prisma } from "../lib/prisma";
import { NotFoundError } from "../utils/errors";

export const getAllDevelopers = async () => {
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

export const getDeveloper = async (developerId: string) => {
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

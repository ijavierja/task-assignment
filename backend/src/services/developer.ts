import { prisma } from "../lib/prisma.js";

export const getAllDevelopers = async () => {
  return await prisma.developer.findMany({
    include: {
      skills: true,
    },
  });
};

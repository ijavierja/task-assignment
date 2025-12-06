 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

jest.unstable_mockModule("../../lib/prisma", () => ({
  prisma: {
    developer: {
      findMany: jest.fn(),
    },
  },
}));

const { getAllDevelopers } = await import("../developer");
const { prisma } = await import("../../lib/prisma");

describe("Developer Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllDevelopers", () => {
    it("should call prisma.developer.findMany with correct parameters", async () => {
      const mockDevelopers = [
        {
          id: "dev1",
          name: "Alice",
          createdAt: new Date(),
          updatedAt: new Date(),
          skills: [
            { id: "skill1", name: "Frontend" },
          ],
        },
      ];

      (prisma.developer.findMany as any).mockResolvedValue(mockDevelopers);

      const result = await getAllDevelopers();

      expect(prisma.developer.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.developer.findMany).toHaveBeenCalledWith({
        include: {
          skills: true,
        }
      });
      expect(result).toEqual(mockDevelopers);
    });

    it("should return developers with skills", async () => {
      const mockDevelopers = [
        {
          id: "dev1",
          name: "Alice",
          createdAt: new Date(),
          updatedAt: new Date(),
          skills: [
            { id: "skill1", name: "Frontend" },
          ],
        },
      ];

      (prisma.developer.findMany as any).mockResolvedValue(mockDevelopers);

      const result = await getAllDevelopers();

      expect(result).toEqual(mockDevelopers);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("skills");
    });

    it("should handle errors gracefully", async () => {
      (prisma.developer.findMany as any).mockRejectedValue(new Error("Database connection failed"));

      await expect(getAllDevelopers()).rejects.toThrow("Database connection failed");
    });
  });
});

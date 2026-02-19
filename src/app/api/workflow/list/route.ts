import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: "",
        },
      });
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json({
      success: true,
      workflows,
    });
  } catch (err) {
    console.error("List workflows error:", err);

    return Response.json(
      { success: false, error: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

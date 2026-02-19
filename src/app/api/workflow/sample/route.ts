import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { sampleWorkflowName, sampleNodes, sampleEdges } from "@/lib/sampleWorkflow";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

// POST /api/workflow/sample - create sample workflow for user
export async function POST() {
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

    // Create sample workflow for this user
    const workflow = await prisma.workflow.create({
      data: {
        name: sampleWorkflowName,
        nodes: JSON.parse(JSON.stringify(sampleNodes)) as Prisma.InputJsonValue,
        edges: JSON.parse(JSON.stringify(sampleEdges)) as Prisma.InputJsonValue,
        userId: user.id,
      },
    });

    return Response.json({
      success: true,
      workflow,
    });
  } catch (err: unknown) {
    console.error("Create sample workflow error:", err);

    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create sample workflow",
      },
      { status: 500 }
    );
  }
}

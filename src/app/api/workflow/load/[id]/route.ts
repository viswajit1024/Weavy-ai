import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
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
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return Response.json(
        { success: false, error: "Missing workflow id" },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id },
    });

    if (!workflow) {
      return Response.json(
        { success: false, error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (workflow.userId !== user.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      workflow,
    });
  } catch (err) {
    console.error("Load workflow error:", err);

    return Response.json(
      { success: false, error: "Failed to load workflow" },
      { status: 500 }
    );
  }
}

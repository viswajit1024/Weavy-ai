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

    const workflow = await prisma.workflow.findUnique({
      where: { id: id },
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
      workflow: {
        name: workflow.name,
        nodes: workflow.nodes,
        edges: workflow.edges,
      },
    });
  } catch (err) {
    return Response.json(
      { success: false, error: "Export failed" },
      { status: 500 }
    );
  }
}

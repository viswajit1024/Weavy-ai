import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
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

    const { id } = await req.json();

    if (!id) {
      return Response.json(
        { success: false, error: "Workflow id is required" },
        { status: 400 }
      );
    }

    const wf = await prisma.workflow.findUnique({
      where: { id },
    });

    if (!wf) {
      return Response.json(
        { success: false, error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (wf.userId !== user.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.workflow.create({
      data: {
        name: `${wf.name} (Copy)`,
        nodes: wf.nodes as Prisma.InputJsonValue,
        edges: wf.edges as Prisma.InputJsonValue,
        userId: user.id,
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Duplicate workflow error:", err);

    return Response.json(
      { success: false, error: "Failed to duplicate workflow" },
      { status: 500 }
    );
  }
}

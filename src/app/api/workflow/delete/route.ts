import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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

    // Verify ownership before deleting
    const workflow = await prisma.workflow.findUnique({
      where: { id },
    });

    if (!workflow || workflow.userId !== user.id) {
      return Response.json(
        { success: false, error: "Workflow not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.workflow.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Delete workflow error:", err);

    return Response.json(
      { success: false, error: "Failed to delete workflow" },
      { status: 500 }
    );
  }
}

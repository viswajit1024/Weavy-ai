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

    const body = await req.json();
    const { id, name } = body;

    if (!id || typeof name !== "string") {
      return Response.json(
        { success: false, error: "Workflow id and name are required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id },
    });

    if (!workflow || workflow.userId !== user.id) {
      return Response.json(
        { success: false, error: "Workflow not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.workflow.update({
      where: { id },
      data: { name },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Rename workflow error:", err);

    return Response.json(
      { success: false, error: "Failed to rename workflow" },
      { status: 500 }
    );
  }
}

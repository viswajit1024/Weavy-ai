import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { ImportWorkflowSchema } from "@/lib/validators/workflowEditor";
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

    const body = await req.json();

    const data = ImportWorkflowSchema.parse(body);

    const workflow = await prisma.workflow.create({
      data: {
        name: `${data.name} (Imported)`,
        nodes: data.nodes as Prisma.InputJsonValue,
        edges: data.edges as Prisma.InputJsonValue,
        userId: user.id,
      },
    });

    return Response.json({
      success: true,
      workflowId: workflow.id,
    });
  } catch (err) {
    console.error("Import workflow error:", err);
    return Response.json(
      { success: false, error: "Failed to import workflow" },
      { status: 500 }
    );
  }
}

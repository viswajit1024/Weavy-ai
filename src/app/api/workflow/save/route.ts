import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { SaveWorkflowSchema } from "@/lib/validators/workflowEditor";

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
    const data = SaveWorkflowSchema.parse(body);

    const workflow = data.id
      ? await prisma.workflow.update({
          where: { 
            id: data.id,
            userId: user.id, // Ensure user owns workflow
          },
          data: {
            name: data.name,
            nodes: data.nodes,
            edges: data.edges,
          },
        })
      : await prisma.workflow.create({
          data: {
            name: data.name,
            nodes: data.nodes,
            edges: data.edges,
            userId: user.id,
          },
        });

    return Response.json({
      success: true,
      workflow,
    });
  } catch (err: any) {
    console.error("Save workflow error:", err);

    return Response.json(
      {
        success: false,
        error:
          err?.issues?.[0]?.message ??
          err.message ??
          "Failed to save workflow",
      },
      { status: 400 }
    );
  }
}

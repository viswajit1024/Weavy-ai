import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import WorkflowEditor from '@/components/workflow/WorkflowEditor';

interface WorkflowPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect('/sign-in');
  }

  // Get or create user
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: '',
      },
    });
  }

  // Handle "new" workflow
  if (id === 'new') {
    return <WorkflowEditor user={JSON.parse(JSON.stringify(user))} workflow={null} />;
  }

  // Get existing workflow
  const workflow = await prisma.workflow.findUnique({
    where: { id },
    include: {
      runs: {
        orderBy: { startedAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!workflow || workflow.userId !== user.id) {
    redirect('/dashboard');
  }

  return (
    <WorkflowEditor
      user={JSON.parse(JSON.stringify(user))}
      workflow={JSON.parse(JSON.stringify(workflow))}
    />
  );
}
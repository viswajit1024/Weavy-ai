import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Plus, Sparkles, Clock, Workflow, Zap, MoreVertical, Trash2, Settings } from 'lucide-react';

export default async function DashboardPage() {
  const { userId } = await auth();

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

  // Get user's workflows
  const workflows: {
    id: string;
    name: string;
    description: string | null;
    updatedAt: Date;
    runs: { status: string }[];
  }[] = await prisma.workflow.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      runs: {
        take: 1,
        orderBy: { startedAt: 'desc' },
      },
    },
  });

  const totalRuns = workflows.reduce((acc: number, w: { runs: unknown[] }) => acc + w.runs.length, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#222222] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              weavy<span className="text-[#8b5cf6]">.ai</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#141414] transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <Link
              href="/workflow/new"
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#141414] border border-[#222222] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Workflow className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-sm text-[#a0a0a0]">Total Workflows</p>
                <p className="text-2xl font-bold text-white">{workflows.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#141414] border border-[#222222] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-[#a0a0a0]">Total Runs</p>
                <p className="text-2xl font-bold text-white">{totalRuns}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#141414] border border-[#222222] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-[#a0a0a0]">Last Activity</p>
                <p className="text-2xl font-bold text-white">
                  {workflows.length > 0 ? 'Today' : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Workflows List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Your Workflows</h2>
          </div>

          {workflows.length === 0 ? (
            <div className="bg-[#141414] border border-[#222222] rounded-xl p-12 text-center">
              <Workflow className="w-16 h-16 text-[#333333] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No workflows yet</h3>
              <p className="text-[#a0a0a0] mb-6">
                Create your first workflow to get started with AI automation
              </p>
              <Link
                href="/workflow/new"
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Workflow
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((workflow) => (
                <Link
                  key={workflow.id}
                  href={`/workflow/${workflow.id}`}
                  className="bg-[#141414] border border-[#222222] rounded-xl p-4 hover:border-[#8b5cf6]/30 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white mb-1 group-hover:text-[#8b5cf6] transition-colors">
                        {workflow.name}
                      </h3>
                      {workflow.description && (
                        <p className="text-sm text-[#a0a0a0] line-clamp-2">
                          {workflow.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#a0a0a0]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(workflow.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {workflow.runs.length > 0 && (
                      <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-xs">
                        {workflow.runs[0].status}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
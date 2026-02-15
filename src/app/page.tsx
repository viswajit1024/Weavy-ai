import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { ArrowRight, Sparkles, Layers, Zap, Play } from 'lucide-react';

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#222222] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              weavy<span className="text-[#8b5cf6]">.ai</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {userId ? (
              <Link
                href="/dashboard"
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-[#a0a0a0] hover:text-white transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#222222] bg-[#141414] text-sm text-[#a0a0a0] mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span>AI-Powered Workflow Builder</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Build powerful AI
            <br />
            <span className="bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent">
              workflows visually
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#a0a0a0] mb-10 max-w-2xl mx-auto leading-relaxed">
            Create complex LLM workflows with visual programming. Connect nodes,
            process media, and automate AI tasks — all in a beautiful interface.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href={userId ? '/dashboard' : '/sign-up'}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-3 rounded-lg font-semibold transition-all text-base flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20"
            >
              Start Building
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="border border-[#222222] hover:border-[#333333] text-white px-8 py-3 rounded-lg font-semibold transition-colors text-base flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Canvas Preview */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl border border-[#222222] bg-[#141414] overflow-hidden shadow-2xl shadow-purple-500/5">
            <div className="aspect-video bg-[#0a0a0a] flex items-center justify-center relative">
              {/* Dot grid background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              {/* Sample workflow visualization */}
              <div className="relative z-10 flex items-center gap-8">
                <div className="bg-[#141414] border border-[#222222] rounded-xl p-4 w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                      <span className="text-blue-400 text-xs font-bold">T</span>
                    </div>
                    <span className="text-sm font-medium text-white">Text Input</span>
                  </div>
                  <div className="text-xs text-[#a0a0a0] bg-[#0a0a0a] rounded p-2">
                    System prompt...
                  </div>
                </div>
                <div className="w-16 h-0.5 bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa]" />
                <div className="bg-[#141414] border border-[#222222] rounded-xl p-4 w-48 border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-white">Run LLM</span>
                  </div>
                  <div className="text-xs text-[#a0a0a0] bg-[#0a0a0a] rounded p-2">
                    Gemini 2.5 Flash
                  </div>
                </div>
                <div className="w-16 h-0.5 bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa]" />
                <div className="bg-[#141414] border border-[#222222] rounded-xl p-4 w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                      <span className="text-green-400 text-xs font-bold">&#10003;</span>
                    </div>
                    <span className="text-sm font-medium text-white">Output</span>
                  </div>
                  <div className="text-xs text-[#a0a0a0] bg-[#0a0a0a] rounded p-2">
                    AI-generated text...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 border-t border-[#222222]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to build AI workflows
            </h2>
            <p className="text-[#a0a0a0] text-lg max-w-2xl mx-auto">
              A complete toolkit for creating, executing, and managing complex AI pipelines
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#141414] border border-[#222222] rounded-2xl p-6 hover:border-[#333333] transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-[#8b5cf6]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Visual Node Editor</h3>
              <p className="text-[#a0a0a0] text-sm leading-relaxed">
                Drag and drop 6 powerful node types — text, image upload, video upload, LLM, crop image, and frame extraction.
              </p>
            </div>
            <div className="bg-[#141414] border border-[#222222] rounded-2xl p-6 hover:border-[#333333] transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#8b5cf6]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Google Gemini Integration</h3>
              <p className="text-[#a0a0a0] text-sm leading-relaxed">
                Power your workflows with Google&apos;s Gemini models. Supports multimodal prompts with text and images.
              </p>
            </div>
            <div className="bg-[#141414] border border-[#222222] rounded-2xl p-6 hover:border-[#333333] transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#8b5cf6]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Parallel Execution</h3>
              <p className="text-[#a0a0a0] text-sm leading-relaxed">
                Independent branches run concurrently via Trigger.dev. Convergence points wait for all dependencies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#222222] px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              weavy<span className="text-[#8b5cf6]">.ai</span>
            </span>
          </div>
          <p className="text-xs text-[#a0a0a0]">
            Built with Next.js, React Flow, and Google Gemini
          </p>
        </div>
      </footer>
    </div>
  );
}
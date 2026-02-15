'use client';

import { useWorkflowStore, type WorkflowState } from '@/stores/workflowStore';
import type { WorkflowRun, NodeRunResult } from '@/types/workflow.types';
import { formatTimestamp, formatDuration } from '@/lib/utils';
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-400" />;
    case 'running':
      return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
    case 'partial':
      return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    default:
      return <Clock className="w-4 h-4 text-[#a0a0a0]" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'text-green-400 bg-green-500/10';
    case 'failed':
      return 'text-red-400 bg-red-500/10';
    case 'running':
      return 'text-yellow-400 bg-yellow-500/10';
    case 'partial':
      return 'text-yellow-400 bg-yellow-500/10';
    default:
      return 'text-[#a0a0a0] bg-[#141414]';
  }
}

function getScopeLabel(scope: string) {
  switch (scope) {
    case 'full':
      return 'Full Workflow';
    case 'selected':
      return 'Selected Nodes';
    case 'single':
      return 'Single Node';
    default:
      return scope;
  }
}

export default function HistoryPanel() {
  const workflowRuns = useWorkflowStore((s: WorkflowState) => s.workflowRuns);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  return (
    <div className="w-72 border-l border-[#222222] bg-[#0a0a0a] flex flex-col shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-[#222222]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#a0a0a0]" />
          <span className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
            Workflow History
          </span>
        </div>
      </div>

      {/* Runs List */}
      <div className="flex-1 overflow-y-auto">
        {workflowRuns.length === 0 ? (
          <div className="p-4 text-center">
            <Clock className="w-8 h-8 text-[#333333] mx-auto mb-2" />
            <p className="text-xs text-[#555555]">No runs yet</p>
            <p className="text-xs text-[#444444] mt-1">
              Run your workflow to see history here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {workflowRuns.map((run: WorkflowRun) => (
              <div key={run.id} className="hover:bg-[#0f0f0f] transition-colors">
                {/* Run Header */}
                <button
                  className="w-full p-3 text-left flex items-center gap-2"
                  onClick={() =>
                    setExpandedRun(expandedRun === run.id ? null : run.id)
                  }
                >
                  {expandedRun === run.id ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#a0a0a0] shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#a0a0a0] shrink-0" />
                  )}
                  {getStatusIcon(run.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white truncate">
                        Run #{run.id.slice(0, 8)}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getStatusColor(
                          run.status
                        )}`}
                      >
                        {run.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#555555]">
                        {formatTimestamp(run.startedAt)}
                      </span>
                      <span className="text-[10px] text-[#444444]">
                        ({getScopeLabel(run.scope)})
                      </span>
                    </div>
                  </div>
                  {run.duration && (
                    <span className="text-[10px] text-[#555555] shrink-0">
                      {formatDuration(run.duration)}
                    </span>
                  )}
                </button>

                {/* Expanded Run Details */}
                {expandedRun === run.id && run.nodeResults && (
                  <div className="px-3 pb-3">
                    <div className="space-y-1.5">
                      {(run.nodeResults as NodeRunResult[]).map(
                        (result: NodeRunResult, idx: number) => (
                          <div
                            key={idx}
                            className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-2"
                          >
                            <div className="flex items-center gap-2">
                              {getStatusIcon(result.status)}
                              <span className="text-xs font-medium text-white flex-1 truncate">
                                {result.nodeLabel || result.nodeType}
                              </span>
                              {result.duration && (
                                <span className="text-[10px] text-[#555555]">
                                  {formatDuration(result.duration)}
                                </span>
                              )}
                            </div>
                            {result.output && (
                              <div className="mt-1.5 text-[10px] text-[#a0a0a0] bg-[#0a0a0a] rounded p-1.5 max-h-20 overflow-y-auto break-all">
                                {typeof result.output === 'string'
                                  ? result.output
                                  : JSON.stringify(result.output, null, 2).slice(0, 200)}
                              </div>
                            )}
                            {result.error && (
                              <div className="mt-1.5 text-[10px] text-red-400 bg-red-500/5 rounded p-1.5">
                                {result.error}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
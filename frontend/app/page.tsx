"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<'idle' | 'extracting' | 'agents' | 'done'>('idle');
  const [agentLog, setAgentLog] = useState<string[]>([]);
  const [caseId, setCaseId] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setStage('extracting');

    const { caseId: id } = await api.uploadJudgment(file);
    setCaseId(id);
    setStage('agents');

    try {
      const response = await api.uploadJudgment(file);
      if (!response.caseId) throw new Error("Upload failed"); // Check for ID

      setCaseId(response.caseId);
      setStage('agents');

      await api.runAgents(id, (event, data) => {
        if (event === 'agent_start') setAgentLog(l => [...l, `${data.agent} working...`]);
        if (event === 'agent_done') setAgentLog(l => [...l, `${data.agent} done`]);
        if (event === 'all_done') {
          setStage('done');
          setTimeout(() => router.push(`/cases/${id}/verify`), 1000);
        }
      });
    } catch (e) {
      alert("Upload failed. Check backend console.");
      setStage('idle');
    };
  };
  return (
    <main className='min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8'>
      <h1 className='text-4xl font-bold text-blue-800 mb-2'>NyayaSetu</h1>
      <p className='text-gray-600 mb-8'>Upload a court judgment to generate a verified action plan</p>

      {stage === 'idle' && (
        <div className='bg-white rounded-xl shadow p-8 w-full max-w-lg'>
          <input type='file' accept='.pdf'
            onChange={e => setFile(e.target.files?.[0] || null)}
            className='mb-4 w-full'
          />
          <button onClick={handleUpload} disabled={!file}
            className='w-full bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50'>
            Upload & Analyse Judgment
          </button>
        </div>
      )}

      {(stage === 'extracting' || stage === 'agents') && (
        <div className='bg-white rounded-xl shadow p-8 w-full max-w-lg'>
          <p className='font-semibold text-blue-800 mb-4'>
            {stage === 'extracting' ? 'Extracting judgment text...' : 'Running AI agents...'}
          </p>
          <div className='space-y-2'>
            {agentLog.map((log, i) => (
              <p key={i} className='text-sm text-gray-700'>{log}</p>
            ))}
          </div>
        </div>
      )}

      {stage === 'done' && (
        <p className='text-green-700 font-semibold text-lg'>
          All agents done! Redirecting to verification...
        </p>
      )}
    </main>
  );
}
const BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const api = {
    uploadJudgment: async (file: File) => {
        const form = new FormData();
        form.append('judgment', file);
        const res = await fetch(`${BASE}/api/ingest/upload`, { method: 'POST', body: form });
        return res.json();
    },

    runAgents: (caseId: string, onEvent: (e: string, d: any) => void) => {
        return fetch(`${BASE}/api/agents/run/${caseId}`, { method: 'POST' })
            .then(res => {
                const reader = res.body!.getReader();
                const decoder = new TextDecoder();
                const pump = async () => {
                    const { done, value } = await reader.read();
                    if (done) return;
                    const chunk = decoder.decode(value);
                    // Parse SSE chunks
                    chunk.split('\n\n').forEach(block => {
                        const eventLine = block.match(/^event: (.+)$/m);
                        const dataLine = block.match(/^data: (.+)$/m);
                        if (eventLine && dataLine) {
                            onEvent(eventLine[1], JSON.parse(dataLine[1]));
                        }
                    });
                    pump();
                };
                pump();
            });
    },

    getVerification: async (caseId: string) =>
        fetch(`${BASE}/api/verify/${caseId}`).then(r => r.json()),

    submitVerification: async (caseId: string, body: object) =>
        fetch(`${BASE}/api/verify/${caseId}/item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(r => r.json()),

    getExistingDecisions: async (caseId: string) => {
        const res = await fetch(`${BASE}/api/verify/${caseId}/decisions`);
        if (!res.ok) return { items: [] };
        return res.json();
    },

    getDashboard: async (caseId: string) =>
        fetch(`${BASE}/api/dashboard/${caseId}`).then(r => r.json()),

    listCases: async () =>
        fetch(`${BASE}/api/dashboard`).then(r => r.json()),
};
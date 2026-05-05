"use client";
import { useState } from "react";

export default function ComplianceCommandCenter() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    const runAIAgent = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3001/api/analyze-cases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courtId: "BHC-GOA" })
            });
            const result = await res.json();
            if (result.success) {
                setData(result);
            } else {
                alert("AI Processing Failed. Check terminal.");
            }
        } catch (error) {
            console.error(error);
            alert("Could not connect to backend. Is it running on port 3001?");
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', padding: '3rem', color: '#0f172a' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '1rem' }}>
                        NyayaSetu Command Center
                    </h1>
                    <p style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '2rem' }}>
                        Automated Legal Compliance Pipeline powered by MCP & Gemini 2.5
                    </p>

                    <button
                        onClick={runAIAgent}
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#94a3b8' : '#2563eb',
                            color: 'white',
                            padding: '1rem 2.5rem',
                            borderRadius: '0.5rem',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'AI Agents Processing...' : 'Scan Court Database'}
                    </button>
                </div>

                {data && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                                Extracted Action Items
                            </h2>

                            {data.analysis.output.action_items.map((item: any, idx: number) => (
                                <div key={idx} style={{ backgroundColor: 'white', borderLeft: '4px solid #16a34a', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700 }}>
                                            {item.directive_id}
                                        </span>
                                        <span style={{ backgroundColor: item.urgency === 'high' ? '#fef2f2' : '#eff6ff', color: item.urgency === 'high' ? '#dc2626' : '#2563eb', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                            {item.urgency} URGENCY
                                        </span>
                                    </div>

                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                                        {item.plain_language}
                                    </h3>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                                        <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #e2e8f0' }}>
                                            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Responsible Dept</span>
                                            <span style={{ fontWeight: 600, color: '#334155' }}>{item.responsible_department}</span>
                                        </div>
                                        <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #e2e8f0' }}>
                                            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Compliance Deadline</span>
                                            <span style={{ fontWeight: 600, color: '#b91c1c' }}>{item.comply_deadline}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                                🔍 Behind the Scenes: Raw MCP Database Hits
                            </h2>
                            <div style={{ backgroundColor: '#1e293b', borderRadius: '0.5rem', padding: '1rem', overflowX: 'auto' }}>
                                <pre style={{ color: '#38bdf8', fontSize: '0.8rem', margin: 0 }}>
                                    {JSON.stringify(data.raw_mcp_data, null, 2)}
                                </pre>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
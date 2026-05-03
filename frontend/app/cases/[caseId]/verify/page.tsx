"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { searchPlugin } from '@react-pdf-viewer/search';

export default function VerifyPage() {
    const { caseId } = useParams() as { caseId: string };
    const router = useRouter();
    const [plan, setPlan] = useState<any>(null);
    const [decisions, setDecisions] = useState<Record<string, string>>({});
    const [reviewerName, setReviewerName] = useState('');

    const searchPluginInstance = searchPlugin();
    const { highlight } = searchPluginInstance;

    useEffect(() => {
        if (caseId) api.getVerification(caseId).then(setPlan);
    }, [caseId]);

    const decide = async (directiveId: string, decision: string) => {
        await api.submitVerification(caseId, { directive_id: directiveId, decision, reviewer_name: reviewerName });
        setDecisions(d => ({ ...d, [directiveId]: decision }));
    };

    const handleHighlight = (quote: string) => {
        if (quote) highlight(quote);
    };

    const allDecided = plan?.output?.action_items?.every((item: any) => decisions[item.directive_id]);

    if (!plan) return <div style={{ padding: '2rem', fontWeight: 600, fontSize: '1.25rem', color: '#0f172a' }}>Loading Analysis...</div>;

    const items = plan?.output?.action_items || [];

    if (items.length === 0) {
        return (
            <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', width: '50vw', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Directives Found</h2>
                    <p style={{ color: '#475569' }}>The system determined there are no actionable compliance directives in this document.</p>
                    <button onClick={() => router.push(`/dashboard`)} style={{ marginTop: '1.5rem', backgroundColor: '#1d4ed8', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.25rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Return to Dashboard</button>
                </div>
                <div style={{ width: '50vw', flexShrink: 0, borderLeft: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                        <Viewer fileUrl={`http://localhost:3001/api/ingest/pdf/${caseId}`} />
                    </Worker>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif' }}>
            <div style={{ width: '50vw', flexShrink: 0, overflowY: 'auto', padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.5rem' }}>Review & Verify</h2>
                <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1.5rem' }}>Verify extracted directives. <span style={{ color: '#2563eb', fontWeight: 600 }}>Click an item to locate source text.</span></p>

                <input placeholder='Reviewer Name' value={reviewerName} onChange={e => setReviewerName(e.target.value)}
                    style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '0.25rem', padding: '0.75rem', fontSize: '0.875rem', marginBottom: '1.5rem', outline: 'none', color: '#0f172a', backgroundColor: 'white' }}
                />

                {items.map((item: any) => (
                    <div key={item.directive_id} onClick={() => handleHighlight(item.source_quote)}
                        style={{ cursor: 'pointer', backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem', borderLeft: decisions[item.directive_id] === 'approved' ? '4px solid #16a34a' : decisions[item.directive_id] === 'rejected' ? '4px solid #dc2626' : '4px solid #3b82f6', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', letterSpacing: '0.05em' }}>{item.directive_id}</span>
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600, backgroundColor: item.urgency === 'critical' ? '#fee2e2' : item.urgency === 'high' ? '#ffedd5' : '#f1f5f9', color: item.urgency === 'critical' ? '#991b1b' : item.urgency === 'high' ? '#9a3412' : '#334155' }}>
                                {item.urgency?.toUpperCase() || 'NORMAL'}
                            </span>
                        </div>

                        <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#0f172a', lineHeight: '1.5', marginBottom: '1rem' }}>{item.plain_language}</p>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                            <div style={{ border: '1px solid #e2e8f0', padding: '0.4rem 0.75rem', borderRadius: '0.25rem' }}><b>Dept:</b> {item.responsible_department}</div>
                            <div style={{ border: '1px solid #e2e8f0', padding: '0.4rem 0.75rem', borderRadius: '0.25rem' }}><b>Deadline:</b> {item.comply_deadline}</div>
                        </div>

                        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Source Evidence</p>
                            <p style={{ fontSize: '0.85rem', color: '#334155', fontStyle: 'italic', borderLeft: '2px solid #cbd5e1', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>"{item.source_quote}"</p>
                            <p style={{ fontSize: '0.8rem', color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}><b>Rationale:</b> {item.urgency_reasoning}</p>
                        </div>

                        {item.penalty_for_non_compliance && item.penalty_for_non_compliance !== 'None explicitly stated' && (
                            <div style={{ backgroundColor: '#fff1f2', borderLeft: '3px solid #e11d48', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
                                <p style={{ fontWeight: 700, color: '#be123c', marginBottom: '0.25rem' }}>Compliance Risk</p>
                                <p style={{ color: '#881337' }}>{item.penalty_for_non_compliance}</p>
                            </div>
                        )}

                        {!decisions[item.directive_id] ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={(e) => { e.stopPropagation(); decide(item.directive_id, 'approved'); }} style={{ flex: 1, backgroundColor: '#16a34a', color: 'white', padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Approve</button>
                                <button onClick={(e) => { e.stopPropagation(); decide(item.directive_id, 'rejected'); }} style={{ flex: 1, backgroundColor: 'white', color: '#dc2626', border: '1px solid #fca5a5', padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                            </div>
                        ) : (
                            <div style={{ padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', backgroundColor: decisions[item.directive_id] === 'approved' ? '#f0fdf4' : '#fef2f2', color: decisions[item.directive_id] === 'approved' ? '#15803d' : '#b91c1c', border: decisions[item.directive_id] === 'approved' ? '1px solid #bbf7d0' : '1px solid #fecaca' }}>
                                {decisions[item.directive_id] === 'approved' ? 'Verified & Approved' : 'Rejected by Reviewer'}
                            </div>
                        )}
                    </div>
                ))}

                {allDecided && items.length > 0 && (
                    <button onClick={() => router.push(`/cases/${caseId}/dashboard`)} style={{ width: '100%', backgroundColor: '#1d4ed8', color: 'white', padding: '1rem', borderRadius: '0.25rem', fontWeight: 700, fontSize: '1rem', marginTop: '1rem', border: 'none', cursor: 'pointer' }}>
                        Publish Verified Plan to Dashboard →
                    </button>
                )}
            </div>

            <div style={{ width: '50vw', backgroundColor: '#f1f5f9', borderLeft: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #cbd5e1', backgroundColor: 'white', color: '#334155', fontWeight: 600, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Source Document Viewer</span>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                        <Viewer fileUrl={`http://localhost:3001/api/ingest/pdf/${caseId}`} plugins={[searchPluginInstance]} />
                    </Worker>
                </div>
            </div>
        </div>
    );
}
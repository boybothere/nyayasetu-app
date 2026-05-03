"use client";
import { useEffect, useState } from "react";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { searchPlugin } from '@react-pdf-viewer/search';
import { api } from "@/lib/api";

export default function DemoApp() {
    const [currentView, setCurrentView] = useState<'dashboard' | 'verify'>('dashboard');
    const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

    const [cases, setCases] = useState<any[]>([]);
    const [plan, setPlan] = useState<any>(null);
    const [decisions, setDecisions] = useState<Record<string, string>>({});
    const [reviewerName, setReviewerName] = useState('');

    const searchPluginInstance = searchPlugin();
    const { highlight } = searchPluginInstance;

    // Hardcoded case for the demo to bypass the missing API method
    useEffect(() => {
        if (currentView === 'dashboard') {
            setCases([{
                case_id: "0b5f3c7a-b24c-4359-9743-4a4cee25b296",
                status: "Pending Verification"
            }]);
        }
    }, [currentView]);

    useEffect(() => {
        if (currentView === 'verify' && activeCaseId) {
            api.getVerification(activeCaseId).then(setPlan);
        }
    }, [currentView, activeCaseId]);

    const handleSelectCase = (id: string) => {
        setActiveCaseId(id);
        setCurrentView('verify');
    };

    const decide = async (directiveId: string, decision: string) => {
        await api.submitVerification(activeCaseId!, { directive_id: directiveId, decision, reviewer_name: reviewerName });
        setDecisions(d => ({ ...d, [directiveId]: decision }));
    };

    const handleHighlight = (quote: string) => {
        if (quote) highlight(quote);
    };

    // ==========================================
    // VIEW 1: THE BLUE PUBLISHED DASHBOARD 
    // ==========================================
    if (currentView === 'dashboard') {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'sans-serif', padding: '2rem', color: '#0f172a' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {/* DEEP BLUE HEADER */}
                    <div style={{ backgroundColor: '#1d4ed8', borderRadius: '0.5rem', padding: '2rem', color: 'white', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>NyayaSetu Compliance Dashboard</h1>
                        <div style={{ display: 'flex', gap: '4rem', fontSize: '0.85rem' }}>
                            <div>
                                <p style={{ color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Case Number</p>
                                <p style={{ fontWeight: 500 }}>WRIT PETITION NO. 79 OF 2015</p>
                            </div>
                            <div>
                                <p style={{ color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Court</p>
                                <p style={{ fontWeight: 500 }}>High Court of Judicature at Bombay, Civil<br />Appellate Jurisdiction</p>
                            </div>
                            <div>
                                <p style={{ color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Order Date</p>
                                <p style={{ fontWeight: 500 }}>2026-04-30</p>
                            </div>
                        </div>
                    </div>

                    {/* INTERACTIVE CASE CARD TO ENTER VERIFY MODE */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                            Needs Verification
                        </h2>
                        {cases.map((c) => (
                            <div key={c.case_id} onClick={() => handleSelectCase(c.case_id)}
                                style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '2px solid #cbd5e1', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', color: 'black', transition: 'border-color 0.2s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                        {c.status}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Case ID: {c.case_id.substring(0, 8)}...</h3>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Click to enter verification protocol.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW 2: PROFESSIONAL VERIFY SCREEN (NO EMOJIS)
    // ==========================================
    if (!plan) return <div style={{ padding: '3rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'black', backgroundColor: 'white', height: '100vh' }}>Loading Analysis...</div>;

    const items = plan?.output?.action_items || [];
    const allDecided = plan?.output?.action_items?.every((item: any) => decisions[item.directive_id]);

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif' }}>
            {/* LEFT SIDE: Review Panel */}
            <div style={{ width: '50vw', flexShrink: 0, overflowY: 'auto', padding: '2rem' }}>
                <button onClick={() => setCurrentView('dashboard')} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', backgroundColor: '#e2e8f0', color: 'black', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    ← Back to Dashboard
                </button>
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
                    <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', textAlign: 'center' }}>
                        <p style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '0.5rem' }}>Verification Complete</p>
                        <p style={{ fontSize: '0.875rem', color: '#1d4ed8' }}>In the actual app, this would route to the final dashboard.</p>
                    </div>
                )}
            </div>

            {/* RIGHT SIDE: PDF */}
            <div style={{ width: '50vw', backgroundColor: '#f1f5f9', borderLeft: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #cbd5e1', backgroundColor: 'white', color: '#334155', fontWeight: 600, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Source Document Viewer</span>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                        <Viewer fileUrl={`http://localhost:3001/api/ingest/pdf/${activeCaseId}`} plugins={[searchPluginInstance]} />
                    </Worker>
                </div>
            </div>
        </div>
    );
}
"use client";

import { UI_DICT, LANGUAGES } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { searchPlugin } from '@react-pdf-viewer/search';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';

export default function VerifyPage() {
    const { caseId } = useParams() as { caseId: string };
    const router = useRouter();
    const [plan, setPlan] = useState<any>(null);
    const [decisions, setDecisions] = useState<Record<string, string>>({});
    const [reviewerName, setReviewerName] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [rejectModal, setRejectModal] = useState({ show: false, directiveId: '', reason: '' });
    const [lang, setLang] = useState<'en' | 'hi' | 'mr'>('en');

    const t = UI_DICT[lang];
    const searchPluginInstance = searchPlugin();
    const { highlight } = searchPluginInstance;

    useEffect(() => {
        if (caseId) {
            api.getVerification(caseId).then(setPlan);
            api.getExistingDecisions(caseId)
                .then((verified: any) => {
                    if (verified?.items && verified.items.length > 0) {
                        const existingDecisions: Record<string, string> = {};
                        verified.items.forEach((item: any) => {
                            existingDecisions[item.directive_id] = item.decision;
                        });
                        setDecisions(existingDecisions);
                        setIsLocked(true);
                    }
                })
                .catch(console.error);
        }
    }, [caseId]);

    const decide = async (directiveId: string, decision: string, reason?: string) => {
        await api.submitVerification(caseId, {
            directive_id: directiveId,
            decision,
            reviewer_name: reviewerName,
            rejection_reason: reason || null
        });
        setDecisions(d => ({ ...d, [directiveId]: decision }));
    };

    const handleHighlight = (quote: string) => {
        if (quote) highlight(quote);
    };

    const items = plan?.output?.action_items || [];
    const allDecided = items.length > 0 && items.every((item: any) => decisions[item.directive_id]);

    if (!plan) return <div style={{ padding: '2rem', fontWeight: 600, fontSize: '1.25rem', color: '#0f172a' }}>Loading Analysis...</div>;

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif' }}>
            <div style={{ width: '50vw', flexShrink: 0, overflowY: 'auto', padding: '2rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => router.push(`/cases/${caseId}/dashboard`)}
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#e2e8f0', color: 'black', border: 'none', borderRadius: '0.25rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                        {t.back}
                    </button>
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value as any)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.25rem', border: '2px solid #1d4ed8', outline: 'none', fontWeight: 700, backgroundColor: 'white', color: '#1d4ed8', cursor: 'pointer' }}
                    >
                        {LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>
                                {l.label}
                            </option>
                        ))}
                    </select>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.5rem' }}>{t.title}</h2>
                <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1.5rem' }}>{t.subtitle} <span style={{ color: '#2563eb', fontWeight: 600 }}>{t.clickLocate}</span></p>

                {isLocked && (
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '0.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}></span>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#16a34a', margin: 0 }}>
                            {t.lockedMsg}
                        </p>
                    </div>
                )}

                <input
                    placeholder={t.namePlaceholder}
                    value={reviewerName}
                    onChange={e => setReviewerName(e.target.value)}
                    disabled={isLocked}
                    style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '0.25rem', padding: '0.75rem', fontSize: '0.875rem', marginBottom: '1.5rem', outline: 'none', color: '#0f172a', backgroundColor: isLocked ? '#f1f5f9' : 'white', opacity: isLocked ? 0.7 : 1 }}
                />

                {items.map((item: any) => (
                    <div
                        key={item.directive_id}
                        onClick={() => handleHighlight(item.source_quote)}
                        style={{ cursor: 'pointer', backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem', borderLeft: decisions[item.directive_id] === 'approved' ? '4px solid #16a34a' : decisions[item.directive_id] === 'rejected' ? '4px solid #dc2626' : '4px solid #3b82f6', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', letterSpacing: '0.05em' }}>{item.directive_id}</span>
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600, backgroundColor: item.urgency === 'critical' ? '#fee2e2' : item.urgency === 'high' ? '#ffedd5' : '#f1f5f9', color: item.urgency === 'critical' ? '#991b1b' : item.urgency === 'high' ? '#9a3412' : '#334155' }}>
                                {item.urgency?.toUpperCase() || 'NORMAL'}
                            </span>
                        </div>

                        <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#0f172a', lineHeight: '1.5', marginBottom: '1rem' }}>
                            {lang === 'en' ? item.plain_language : lang === 'hi' ? (item.hindi_translation || item.plain_language) : (item.marathi_translation || item.plain_language)}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                            <div style={{ border: '1px solid #e2e8f0', padding: '0.4rem 0.75rem', borderRadius: '0.25rem' }}><b>{t.dept}</b> {item.responsible_department}</div>
                            <div style={{ border: '1px solid #e2e8f0', padding: '0.4rem 0.75rem', borderRadius: '0.25rem' }}><b>{t.deadline}</b> {item.comply_deadline}</div>
                        </div>

                        {!decisions[item.directive_id] ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    disabled={isLocked || !reviewerName}
                                    onClick={(e) => { e.stopPropagation(); decide(item.directive_id, 'approved'); }}
                                    style={{ flex: 1, backgroundColor: '#16a34a', color: 'white', padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: isLocked || !reviewerName ? 'not-allowed' : 'pointer', opacity: isLocked || !reviewerName ? 0.5 : 1 }}
                                >
                                    {t.approve}
                                </button>
                                <button
                                    disabled={isLocked || !reviewerName}
                                    onClick={(e) => { e.stopPropagation(); setRejectModal({ show: true, directiveId: item.directive_id, reason: '' }); }}
                                    style={{ flex: 1, backgroundColor: 'white', color: '#dc2626', border: '1px solid #fca5a5', padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: isLocked || !reviewerName ? 'not-allowed' : 'pointer', opacity: isLocked || !reviewerName ? 0.5 : 1 }}
                                >
                                    {t.reject}
                                </button>
                            </div>
                        ) : (
                            <div style={{ padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', backgroundColor: decisions[item.directive_id] === 'approved' ? '#f0fdf4' : '#fef2f2', color: decisions[item.directive_id] === 'approved' ? '#15803d' : '#b91c1c', border: decisions[item.directive_id] === 'approved' ? '1px solid #bbf7d0' : '1px solid #fecaca' }}>
                                {decisions[item.directive_id] === 'approved' ? t.verified : t.rejected}
                            </div>
                        )}
                    </div>
                ))}

                {allDecided && !isLocked && (
                    <button
                        onClick={() => { setIsLocked(true); router.push(`/cases/${caseId}/dashboard`); }}
                        style={{ width: '100%', backgroundColor: '#1d4ed8', color: 'white', padding: '1rem', borderRadius: '0.25rem', fontWeight: 700, fontSize: '1rem', marginTop: '1rem', border: 'none', cursor: 'pointer' }}
                    >
                        {t.publishBtn}
                    </button>
                )}
            </div>

            <div style={{ width: '50vw', backgroundColor: '#f1f5f9', borderLeft: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #cbd5e1', backgroundColor: 'white', color: '#334155', fontWeight: 600, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Source Document Viewer</span>
                </div>
                <div style={{ height: '750px', width: '100%' }}>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                        <Viewer fileUrl={`${process.env.NEXT_PUBLIC_API_URL || ''}api/ingest/pdf/${caseId}`} plugins={[searchPluginInstance]} />
                    </Worker>
                </div>
            </div>

            {rejectModal.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Reason for Rejection</h3>
                        <textarea
                            style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '0.25rem', padding: '0.75rem', fontSize: '0.875rem', height: '120px', outline: 'none', marginBottom: '1.5rem', color: 'black', resize: 'none' }}
                            placeholder="Why is this AI extraction incorrect or invalid?"
                            value={rejectModal.reason}
                            onChange={e => setRejectModal(m => ({ ...m, reason: e.target.value }))}
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setRejectModal({ show: false, directiveId: '', reason: '' })}
                                style={{ flex: 1, border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', padding: '0.75rem', borderRadius: '0.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!rejectModal.reason.trim()}
                                onClick={() => { decide(rejectModal.directiveId, 'rejected', rejectModal.reason); setRejectModal({ show: false, directiveId: '', reason: '' }); }}
                                style={{ flex: 1, backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '0.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: !rejectModal.reason.trim() ? 'not-allowed' : 'pointer', opacity: !rejectModal.reason.trim() ? 0.5 : 1 }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
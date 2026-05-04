"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { LANGUAGES } from "@/lib/i18n";

// Updated Dictionary with Rejection terms
const DASH_DICT: Record<string, any> = {
    en: { title: "NyayaSetu Compliance Dashboard", case: "Case Number", court: "Court", date: "Order Date", days: "15 days left", officer: "Officer:", deadline: "Deadline:", orig: "Official English Record", rejectedBadge: "REJECTED BY REVIEWER", reason: "Reason for Rejection:" },
    hi: { title: "न्यायसेतु अनुपालन डैशबोर्ड", case: "केस नंबर", court: "न्यायालय", date: "आदेश तिथि", days: "15 दिन शेष", officer: "अधिकारी:", deadline: "समय सीमा:", orig: "आधिकारिक अंग्रेजी रिकॉर्ड", rejectedBadge: "समीक्षक द्वारा अस्वीकृत", reason: "अस्वीकार करने का कारण:" },
    mr: { title: "न्यायसेतू अनुपालन डॅशबोर्ड", case: "प्रकरण क्रमांक", court: "न्यायालय", date: "आदेश तारीख", days: "१५ दिवस बाकी", officer: "अधिकारी:", deadline: "अंतिम मुदत:", orig: "अधिकृत इंग्रजी रेकॉर्ड", rejectedBadge: "पुनरावलोकनकर्त्याने नाकारले", reason: "नाकारण्याचे कारण:" },
    kok: { title: "न्यायसेतू अनुपालन डॅशबोर्ड", case: "प्रकरण क्रमांक", court: "न्यायालय", date: "आदेशाची तारीख", days: "१५ दीस उरल्यात", officer: "अधिकारी:", deadline: "अंतिम मुदत:", orig: "अधिकृत इंग्लीश रेकॉर्ड", rejectedBadge: "पुनरावलोकनकर्त्यान न्हयकारला", reason: "न्हयकारपाचें कारण:" },
};

export default function PublishedDashboard() {
    const { caseId } = useParams() as { caseId: string };
    const [plan, setPlan] = useState<any>(null);
    const [decisions, setDecisions] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    const [lang, setLang] = useState('en');
    const t = DASH_DICT[lang] || DASH_DICT['en'];

    useEffect(() => {
        if (!caseId) return;

        // Fetch BOTH the AI plan and the human decisions at the same time
        Promise.all([
            api.getVerification(caseId),
            api.getExistingDecisions(caseId)
        ])
            .then(([planData, decisionsData]) => {
                setPlan(planData);

                // Map decisions so we can easily look up status and reason
                if (decisionsData?.items) {
                    const decMap: Record<string, any> = {};
                    decisionsData.items.forEach((item: any) => {
                        decMap[item.directive_id] = {
                            status: item.decision,
                            reason: item.rejection_reason || 'No reason provided.'
                        };
                    });
                    setDecisions(decMap);
                }
                setLoading(false);
            })
            .catch((err: any) => { console.error(err); setLoading(false); });
    }, [caseId]);

    if (loading) return <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: 'black' }}>Loading Dashboard...</div>;

    const items = plan?.output?.action_items || [];

    const groupedItems = items.reduce((acc: any, item: any) => {
        const dept = item.responsible_department || 'General Administration';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(item);
        return acc;
    }, {});

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'sans-serif', padding: '2rem', color: '#0f172a' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* HEADER */}
                <div style={{ backgroundColor: '#1d4ed8', borderRadius: '0.5rem', padding: '2rem', color: 'white', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>{t.title}</h1>
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '0.25rem', border: '1px solid rgba(255,255,255,0.3)', outline: 'none', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                        >
                            {LANGUAGES.map((l: any) => (
                                <option key={l.code} value={l.code} style={{ color: 'black' }}>{l.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '4rem', fontSize: '0.85rem' }}>
                        <div>
                            <p style={{ color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>{t.case}</p>
                            <p style={{ fontWeight: 500 }}>WRIT PETITION NO. 79 OF 2015</p>
                        </div>
                        <div>
                            <p style={{ color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>{t.court}</p>
                            <p style={{ fontWeight: 500 }}>High Court of Judicature at Bombay</p>
                        </div>
                        <div>
                            <p style={{ color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>{t.date}</p>
                            <p style={{ fontWeight: 500 }}>2026-04-30</p>
                        </div>
                    </div>
                </div>

                {/* DEPARTMENT SECTIONS */}
                {Object.entries(groupedItems).map(([dept, deptItems]: [string, any]) => (
                    <div key={dept} style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                            {dept}
                        </h2>

                        {deptItems.map((item: any, index: number) => {
                            const translatedText = lang === 'en' ? item.plain_language : (item[`${lang}_translation`] || item.plain_language);

                            // Check if this specific item was rejected
                            const isRejected = decisions[item.directive_id]?.status === 'rejected';
                            const rejectionReason = decisions[item.directive_id]?.reason;

                            return (
                                <div key={index} style={{ marginBottom: '2rem', opacity: isRejected ? 0.85 : 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <p style={{ fontSize: '1rem', fontWeight: 600, color: isRejected ? '#94a3b8' : '#0f172a', textDecoration: isRejected ? 'line-through' : 'none', flex: 1, paddingRight: '1rem', lineHeight: '1.6' }}>
                                            {translatedText}
                                        </p>

                                        {/* Dynamic Badge: Approved gets '15 days', Rejected gets 'REJECTED' */}
                                        {isRejected ? (
                                            <span style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.35rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                                                {t.rejectedBadge}
                                            </span>
                                        ) : (
                                            <span style={{ backgroundColor: '#ffedd5', color: '#9a3412', padding: '0.35rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                {t.days}
                                            </span>
                                        )}
                                    </div>

                                    {/* Conditional Render: Show Reason if Rejected, Show Deadlines if Approved */}
                                    {isRejected ? (
                                        <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '1rem', borderRadius: '0 0.25rem 0.25rem 0', marginBottom: '1rem' }}>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                                {t.reason}
                                            </p>
                                            <p style={{ fontSize: '0.9rem', color: '#7f1d1d', fontWeight: 500 }}>
                                                {rejectionReason}
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '0.25rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                                                {t.deadline} {item.comply_deadline}
                                            </div>
                                            <div style={{ flex: 2, border: '1px solid #cbd5e1', borderRadius: '0.25rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                                                {t.officer} Secretary, {dept}
                                            </div>
                                        </div>
                                    )}

                                    {/* English Fallback for Translations */}
                                    {lang !== 'en' && !isRejected && (
                                        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.25rem', padding: '0.75rem' }}>
                                            <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                                {t.orig}
                                            </p>
                                            <p style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic' }}>
                                                {item.plain_language}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
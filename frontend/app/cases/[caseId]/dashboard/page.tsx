"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function PublishedDashboard() {
    const { caseId } = useParams() as { caseId: string };
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!caseId) return;
        api.getVerification(caseId)
            .then((data: any) => { setPlan(data); setLoading(false); })
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

                {Object.entries(groupedItems).map(([dept, deptItems]: [string, any]) => (
                    <div key={dept} style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                            {dept}
                        </h2>

                        {deptItems.map((item: any, index: number) => (
                            <div key={index} style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', flex: 1, paddingRight: '1rem', lineHeight: '1.5' }}>
                                        {item.plain_language}
                                    </p>
                                    <span style={{ backgroundColor: '#ffedd5', color: '#9a3412', padding: '0.35rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                        15 days left
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '0.25rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#475569' }}>
                                        Deadline: {item.comply_deadline}
                                    </div>
                                    <div style={{ flex: 2, border: '1px solid #cbd5e1', borderRadius: '0.25rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#475569' }}>
                                        Officer: Secretary, {dept}
                                    </div>
                                </div>

                                <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '0.25rem', padding: '0.75rem' }}>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                        Hindi Translation
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: '#0369a1', fontStyle: 'italic' }}>
                                        {item.hindi_translation || "अनुवाद प्रक्रिया में है..."}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
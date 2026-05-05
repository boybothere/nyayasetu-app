import { NextResponse } from 'next/server';

export async function POST() {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
        success: true,
        analysis: {
            output: {
                action_items: [
                    {
                        directive_id: "D1",
                        source_quote: "The State Government is directed to clear all pending provident fund and retirement dues for Kadamba Transport Corporation employees within 30 days.",
                        plain_language: "The State Government must pay all outstanding provident fund and retirement benefits to former employees of Kadamba Transport Corporation.",
                        responsible_department: "Labour Department (in conjunction with Kadamba Transport Corporation)",
                        comply_deadline: "Immediate",
                        urgency: "high"
                    },
                    {
                        directive_id: "D2",
                        source_quote: "The Goa Coastal Zone Management Authority (GCZMA) and North Goa District Collector are ordered to demolish the illegal structures at Morjim beach and submit a compliance report within 15 days.",
                        plain_language: "The GCZMA and North Goa District Collector must tear down illegal constructions on Morjim beach and provide a report confirming compliance.",
                        responsible_department: "GCZMA & North Goa District Collector",
                        comply_deadline: "Immediate",
                        urgency: "high"
                    }
                ]
            }
        },
        raw_mcp_data: [
            { id: "bhc-goa-wp-1042-2025", case_number: "WP/1042/2025", outcome: "allowed" },
            { id: "bhc-goa-pil-45-2024", case_number: "PIL/45/2024", outcome: "allowed" },
            { id: "bhc-goa-wp-2099-2025", case_number: "WP/2099/2025", outcome: "dismissed" }
        ]
    });
}
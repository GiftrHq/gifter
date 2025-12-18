// app/api/subscribe/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email, brandName, type } = await req.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const groups: string[] = [];
        const prelaunchGroup = process.env.MAILERLITE_PRELAUNCH_GROUP_ID;
        if (prelaunchGroup) groups.push(prelaunchGroup);

        const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
            },
            body: JSON.stringify({
                email,
                // Optional: tag into a group
                groups: groups.length ? groups : undefined,
                // Custom fields – names must match your fields in MailerLite
                fields: {
                    ...(brandName ? { 'Brand Name': brandName } : {}),
                    ...(type ? { type } : {}), // only if you created a "type" field
                },
                status: 'active', // create/upsert active subscriber 
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error('MailerLite error:', res.status, text);
            return NextResponse.json(
                { error: 'Failed to subscribe' },
                { status: 500 }
            );
        }

        const data = await res.json();
        return NextResponse.json({ ok: true, subscriber: data.data });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: 'Unexpected error' },
            { status: 500 }
        );
    }
}

import * as admin from 'firebase-admin';
import generated from '@/service_key.json';
import { ServiceAccount } from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

if (!admin.apps.length) {
    const serviceAccount = generated as ServiceAccount;
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export async function POST(request: NextRequest) {
    const { token, topic } = await request.json();

    try {
        await admin.messaging().subscribeToTopic(token, topic);

        return NextResponse.json({ success: true, message: 'Subscribed to topic successfully' });
    } catch (error) {
        console.error('Error subscribing to topic:', error);
        return NextResponse.json({ success: false, error });
    }
}


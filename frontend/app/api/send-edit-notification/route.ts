import admin, { ServiceAccount } from 'firebase-admin';
import { Message } from "firebase-admin/messaging";
import { NextRequest, NextResponse } from "next/server";

import generated from '@/service_key.json';

if (!admin.apps.length) {
  const serviceAccount = generated as ServiceAccount;
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function POST(request: NextRequest) {
  const { topic } = await request.json();

  const payload: Message = {
    topic: topic,
    notification: {
      title: "Your board has been modified",
      body: "A user has started editing your board!",
    },
    webpush: {
      headers: {
        Urgency: "high",
      },
      fcmOptions: {
        link: "/",
      },
      notification: {
        tag: `unique-${topic}-edit`,
      },
    },
  };

  try {
    await admin.messaging().send(payload);

    return NextResponse.json({ success: true, message: "Notification sent!" });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}

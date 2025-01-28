import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { getFunctions, httpsCallable } from '@firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyA1GD4xECInr01gFPsayQ7Kb1uAmqU8y7I",
    authDomain: "itmo-board.firebaseapp.com",
    projectId: "itmo-board",
    storageBucket: "itmo-board.firebasestorage.app",
    messagingSenderId: "117334585829",
    appId: "1:117334585829:web:e62f3f66f274b599037f0c",
    measurementId: "G-XM9Z4BDK8L"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
    const supported = await isSupported();
    return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
    try {
        const fcmMessaging = await messaging();
        if (fcmMessaging) {
            const token = await getToken(fcmMessaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
            });
            return token;
        }
        return null;
    } catch (err) {
        console.error("An error occurred while fetching the token:", err);
        return null;
    }
};

export { app, messaging };
export const functions = getFunctions(app);
export const sendNotification = httpsCallable(functions, 'sendNotification');

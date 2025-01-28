import { useCallback, useEffect, useRef, useState } from 'react';
import { onMessage, Unsubscribe } from 'firebase/messaging';
import { fetchToken, messaging } from '@/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

async function getNotificationPermissionAndToken() {
    if (!('Notification' in window)) {
        console.info('This browser does not support desktop notification');
        return null;
    }

    if (Notification.permission === 'granted') {
        return await fetchToken();
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            return await fetchToken();
        }
    }

    console.log('Notification permission not granted.');
    return null;
}

export const subscribeToTopic = async (token: string, boardId: string) => {
    try {
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, topic: `board_${boardId}` }),
        });

        if (!response.ok) {
            console.error(
                'Failed to subscribe to topic:',
                await response.text(),
            );
        } else {
            console.log(`Subscribed to topic: board_${boardId}`);
        }
    } catch (error) {
        console.error('Error subscribing to topic:', error);
    }
};

const useFcmToken = (boardId: string | null) => {
    const router = useRouter();
    const [notificationPermissionStatus, setNotificationPermissionStatus] =
        useState<NotificationPermission | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const retryLoadToken = useRef(0);
    const isLoading = useRef(false);

    const loadToken = useCallback(async () => {
        if (isLoading.current) return;

        isLoading.current = true;
        const token = await getNotificationPermissionAndToken();

        if (Notification.permission === 'denied') {
            setNotificationPermissionStatus('denied');
            console.info('Push Notifications issue - permission denied');
            isLoading.current = false;
            return;
        }

        if (!token) {
            if (retryLoadToken.current >= 3) {
                alert('Unable to load token, refresh the browser');
                console.info(
                    'Push Notifications issue - unable to load token after 3 retries',
                );
                isLoading.current = false;
                return;
            }

            retryLoadToken.current += 1;
            console.error(
                'An error occurred while retrieving token. Retrying...',
            );
            isLoading.current = false;
            await loadToken();
            return;
        }

        setNotificationPermissionStatus(Notification.permission);
        setToken(token);

        if (boardId) {
            await subscribeToTopic(token, boardId);
        }

        isLoading.current = false;
    }, [boardId]);

    useEffect(() => {
        if ('Notification' in window) {
            loadToken();
        }
    }, [boardId, loadToken]);

    useEffect(() => {
        const setupListener = async () => {
            if (!token) return;

            console.log(`onMessage registered with token ${token}`);
            const m = await messaging();
            if (!m) return;

            const unsubscribe = onMessage(m, (payload) => {
                if (Notification.permission !== 'granted') return;

                console.log('Foreground push notification received:', payload);
                const link = payload.fcmOptions?.link || payload.data?.link;

                if (link) {
                    toast.info(
                        `${payload.notification?.title}: ${payload.notification?.body}`,
                        {
                            action: {
                                label: 'Visit',
                                onClick: () => {
                                    const link =
                                        payload.fcmOptions?.link ||
                                        payload.data?.link;
                                    if (link) {
                                        router.push(link);
                                    }
                                },
                            },
                        },
                    );
                } else {
                    toast.info(
                        `${payload.notification?.title}: ${payload.notification?.body}`,
                    );
                }

                const n = new Notification(
                    payload.notification?.title || 'New message',
                    {
                        body:
                            payload.notification?.body ||
                            'This is a new message',
                        data: link ? { url: link } : undefined,
                    },
                );

                n.onclick = (event) => {
                    event.preventDefault();
                    /* eslint-disable  @typescript-eslint/no-explicit-any */
                    const link = (event.target as any)?.data?.url;
                    if (link) {
                        router.push(link);
                    } else {
                        console.log(
                            'No link found in the notification payload',
                        );
                    }
                };
            });

            return unsubscribe;
        };

        let unsubscribe: Unsubscribe | null = null;

        setupListener().then((unsub) => {
            if (unsub) {
                unsubscribe = unsub;
            }
        });

        return () => unsubscribe?.();
    }, [token, router]);

    return { token, notificationPermissionStatus };
};

export default useFcmToken;

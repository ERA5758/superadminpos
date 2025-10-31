
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { URLSearchParams } from 'url';

// --- Firebase Admin Initialization ---
function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0] as App;
    }
    return initializeApp();
}

// --- Start of Inlined WhatsApp Logic ---

type WhatsappSettings = {
    deviceId: string;
};

async function getWhatsappSettingsForApi(): Promise<WhatsappSettings> {
    const adminApp = getFirebaseAdminApp();
    const adminDb = getFirestore(adminApp);
    const settingsDocRef = adminDb.collection('appSettings').doc('whatsappConfig');
    
    try {
        const docSnap = await settingsDocRef.get();
        if (docSnap.exists() && docSnap.data()?.deviceId) {
            return { deviceId: docSnap.data()?.deviceId };
        } else {
            console.warn("WhatsApp settings or deviceId not found. Cannot send message.");
            return { deviceId: '' };
        }
    } catch (error) {
        console.error("API Route: Error fetching WhatsApp settings:", error);
        return { deviceId: '' }; // Return empty on error
    }
}

async function internalSendWhatsapp(deviceId: string, target: string, message: string) {
    if (!deviceId || !target || !message) {
        console.error("WhatsApp Error: deviceId, target, or message is missing.", { deviceId: !!deviceId, target: !!target, message: !!message });
        throw new Error("Missing deviceId, target, or message for sending WhatsApp.");
    }

    const body = new URLSearchParams();
    body.append('device_id', deviceId);
    body.append('number', target); // Follow-ups are always to a specific number, not a group
    body.append('message', message);
    
    const webhookUrl = `https://app.whacenter.com/api/send`;

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        const responseJson = await response.json();

        if (!response.ok || responseJson.status === 'error') {
            console.error('WhaCenter API Error:', { 
                status: response.status, 
                reason: responseJson.reason || 'Unknown error from WhaCenter' 
            });
            throw new Error(responseJson.reason || 'Failed to send message via WhaCenter.');
        } else {
            console.log(`Successfully sent follow-up message to ${target}`);
        }
    } catch (error) {
        console.error("API Route: Failed to send WhatsApp message via fetch:", error);
        // Re-throw the error to be caught by the main handler
        throw error;
    }
}

function formatWhatsappNumber(nomor: string | number | undefined): string {
    if (!nomor) return '';
    let nomorStr = String(nomor).replace(/\D/g, ''); // Remove non-digit characters
    if (nomorStr.startsWith('0')) {
        return '62' + nomorStr.substring(1);
    }
    if (nomorStr.startsWith('8')) { // Handle numbers like 812...
        return '62' + nomorStr;
    }
    return nomorStr;
}

// --- End of Inlined WhatsApp Logic ---


export async function POST(req: NextRequest) {
    try {
        const { to, message } = await req.json();

        if (!to || !message) {
            return NextResponse.json({ error: 'Missing required fields: to, message.' }, { status: 400 });
        }

        const { deviceId } = await getWhatsappSettingsForApi();
        if (!deviceId) {
            return NextResponse.json({ error: 'WhatsApp is not configured on the server.' }, { status: 500 });
        }
        
        const formattedPhone = formatWhatsappNumber(to);
        await internalSendWhatsapp(deviceId, formattedPhone, message);

        return NextResponse.json({ success: true, message: "Follow-up message sent successfully." });

    } catch (error) {
        console.error('Error in send-follow-up API:', error);
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}


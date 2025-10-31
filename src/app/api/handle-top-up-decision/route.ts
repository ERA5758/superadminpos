
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { URLSearchParams } from 'url';

// --- Firebase Admin Initialization ---
// This ensures we have a single instance of the Firebase Admin SDK
function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0] as App;
    }
    return initializeApp();
}

// --- Start of Inlined WhatsApp Logic ---

type WhatsappSettings = {
    deviceId: string;
    adminGroup: string;
};

// Default settings in case the document in Firestore is missing
const defaultWhatsappSettings: WhatsappSettings = {
    deviceId: '',
    adminGroup: '',
};

async function getWhatsappSettingsForApi(): Promise<WhatsappSettings> {
    const adminApp = getFirebaseAdminApp();
    const adminDb = getFirestore(adminApp);
    const settingsDocRef = adminDb.collection('appSettings').doc('whatsappConfig');
    try {
        const docSnap = await settingsDocRef.get();
        if (docSnap.exists()) {
            // Merge fetched data with defaults to ensure all keys are present
            return { ...defaultWhatsappSettings, ...(docSnap.data() as Partial<WhatsappSettings>) };
        } else {
            console.warn("WhatsApp settings document not found. Using defaults.");
            return defaultWhatsappSettings;
        }
    } catch (error) {
        console.error("API Route: Error fetching WhatsApp settings:", error);
        return defaultWhatsappSettings; // Return defaults on error
    }
}

async function internalSendWhatsapp(deviceId: string, target: string, message: string, isGroup: boolean = false) {
    if (!deviceId || !target || !message) {
        console.error("WhatsApp Error: deviceId, target, or message is missing.", { deviceId: !!deviceId, target: !!target, message: !!message });
        return;
    }

    const body = new URLSearchParams();
    body.append('device_id', deviceId);
    body.append(isGroup ? 'group' : 'number', target);
    body.append('message', message);
    
    const endpoint = isGroup ? 'sendGroup' : 'send';
    const webhookUrl = `https://app.whacenter.com/api/${endpoint}`;

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
        } else {
            console.log(`Successfully sent WhatsApp message to ${target}`);
        }
    } catch (error) {
        console.error("API Route: Failed to send WhatsApp message via fetch:", error);
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
    const adminApp = getFirebaseAdminApp();
    const db = getFirestore(adminApp);
    
    try {
        const { storeId, storeName, userId, tokensToAdd, newStatus } = await req.json();

        // Validate required fields from the request body
        if (!storeId || !storeName || !userId || !tokensToAdd || !newStatus) {
            return NextResponse.json({ error: 'Missing required notification data.' }, { status: 400 });
        }

        const { deviceId, adminGroup } = await getWhatsappSettingsForApi();
        if (!deviceId) {
            console.warn("WhatsApp deviceId not configured. Skipping notifications.");
            return NextResponse.json({ success: true, message: "Action completed, but WhatsApp notifications skipped due to missing configuration." });
        }
        
        // --- Fetch User Details ---
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const userName = userData?.name || 'Pelanggan';
        const userWhatsapp = userData?.whatsapp;

        // --- Prepare Messages ---
        const formattedAmount = (tokensToAdd || 0).toLocaleString('id-ID');
        let customerMessage = '';
        let adminMessage = '';

        if (newStatus === 'disetujui') {
            customerMessage = `✅ *Top-up Disetujui!*\n\nHalo ${userName},\nPermintaan top-up Anda untuk toko *${storeName}* telah disetujui.\n\nSejumlah *${formattedAmount} token* telah ditambahkan ke saldo Anda.\n\nTerima kasih!`;
            adminMessage = `✅ *Top-up Disetujui*\n\nPermintaan dari: *${storeName}*\nJumlah: *${formattedAmount} token*\n\nStatus berhasil diperbarui dan saldo toko telah ditambahkan.`;
        } else if (newStatus === 'ditolak') {
            customerMessage = `❌ *Top-up Ditolak*\n\nHalo ${userName},\nMohon maaf, permintaan top-up Anda untuk toko *${storeName}* sejumlah ${formattedAmount} token telah ditolak.\n\nSilakan periksa bukti transfer Anda dan coba lagi, atau hubungi admin jika ada pertanyaan.`;
            adminMessage = `❌ *Top-up Ditolak*\n\nPermintaan dari: *${storeName}*\nJumlah: *${formattedAmount} token*\n\nStatus berhasil diperbarui. Tidak ada perubahan pada saldo toko.`;
        }

        // --- Send Notifications ---
        // Notify user if their WhatsApp number exists
        if (userWhatsapp && customerMessage) {
            const formattedPhone = formatWhatsappNumber(userWhatsapp);
            await internalSendWhatsapp(deviceId, formattedPhone, customerMessage, false);
        } else {
            console.warn(`User ${userId} does not have a WhatsApp number. Cannot send customer notification.`);
        }

        // Notify platform admin group if it's configured
        if (adminGroup && adminMessage) {
            await internalSendWhatsapp(deviceId, adminGroup, adminMessage, true);
        } else {
            console.warn(`Admin group is not configured. Cannot send admin notification.`);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in handle-top-up-decision API:', error);
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

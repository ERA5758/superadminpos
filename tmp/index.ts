
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { URLSearchParams } from "url";

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

interface WhatsappSettings {
  deviceId?: string;
  adminGroup?: string;
}

/**
 * Fetches WhatsApp settings. 
 * If storeId is 'platform', it fetches global settings from appSettings.
 * Otherwise, it fetches store-specific settings (if any).
 */
async function getWhatsappSettings(storeId: string = 'platform'): Promise<WhatsappSettings> {
  const defaultSettings: WhatsappSettings = { deviceId: '', adminGroup: '' };
  
  let settingsDocRef;
  if (storeId === 'platform') {
      settingsDocRef = db.collection('appSettings').doc('whatsappConfig');
  } else {
      // Fallback to platform settings if store-specific settings are not the primary goal for this function.
      settingsDocRef = db.collection('appSettings').doc('whatsappConfig');
  }

  try {
    const docSnap = await settingsDocRef.get();
    if (docSnap.exists) {
      return { ...defaultSettings, ...docSnap.data() };
    } else {
      logger.warn(`WhatsApp settings document not found at ${settingsDocRef.path}. Returning default.`);
      return defaultSettings;
    }
  } catch (error) {
    logger.error(`Error fetching WhatsApp settings from ${settingsDocRef.path}:`, error);
    return defaultSettings;
  }
}

export const processWhatsappQueue = onDocumentCreated("whatsappQueue/{messageId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        logger.info("No data associated with the event, exiting.");
        return;
    }

    const messageData = snapshot.data();
    const { to, message, isGroup = false, storeId = 'platform' } = messageData;

    if (!to || !message) {
        logger.error("Document is missing 'to' or 'message' field.", { id: snapshot.id });
        return snapshot.ref.update({ status: 'failed', error: 'Missing to/message field' });
    }

    try {
        const settings = await getWhatsappSettings(storeId);
        const { deviceId, adminGroup } = settings;
        
        if (!deviceId) {
            throw new Error(`WhatsApp deviceId is not configured for store '${storeId}' or platform.`);
        }

        const recipient = (to === 'admin_group' && isGroup) ? adminGroup : to;
        if (!recipient) {
            throw new Error(`Recipient is invalid. 'to' field was '${to}' and adminGroup is not set.`);
        }

        const fetch = (await import('node-fetch')).default;
        const body = new URLSearchParams();
        body.append('device_id', deviceId);
        body.append(isGroup ? 'group' : 'number', recipient);
        body.append('message', message);

        const endpoint = isGroup ? 'sendGroup' : 'send';
        const webhookUrl = `https://app.whacenter.com/api/${endpoint}`;

        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: body,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        const responseJson = await response.json() as { status: 'error' | 'success', reason?: string };

        if (!response.ok || responseJson.status === 'error') {
            throw new Error(responseJson.reason || `WhaCenter API error with status ${response.status}`);
        }

        logger.info(`Successfully sent WhatsApp message via queue to ${recipient}`);
        return snapshot.ref.update({ status: 'sent', sentAt: FieldValue.serverTimestamp() });

    } catch (error: any) {
        logger.error(`Failed to process WhatsApp message for recipient '${to}':`, error);
        return snapshot.ref.update({ status: 'failed', error: error.message, processedAt: FieldValue.serverTimestamp() });
    }
});
  
  
  


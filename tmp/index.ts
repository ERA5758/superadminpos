
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
 * If storeId is 'platform', it fetches global settings.
 * Otherwise, it fetches store-specific settings.
 */
async function getWhatsappSettings(storeId: string = 'platform'): Promise<WhatsappSettings> {
  const defaultSettings: WhatsappSettings = { deviceId: '', adminGroup: '' };
  
  let settingsDocRef;
  if (storeId === 'platform') {
      settingsDocRef = db.collection('appSettings').doc('whatsappConfig');
  } else {
      settingsDocRef = db.collection('stores').doc(storeId).collection('settings').doc('whatsapp');
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

/**
 * Triggers when a new top-up request is created.
 * It syncs the request to the store's subcollection and sends a notification to the admin group.
 */
export const onTopUpRequestCreate = onDocumentCreated("topUpRequests/{requestId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        logger.info("No data for onTopUpRequestCreate event, exiting.");
        return;
    }

    const requestData = snapshot.data();
    const { storeId, storeName, tokensToAdd } = requestData;

    if (!storeId || !storeName) {
        logger.error("Top-up request is missing 'storeId' or 'storeName'.", { id: snapshot.id });
        return;
    }
    
    const whatsappQueueRef = db.collection('whatsappQueue');

    try {
        // Path to the subcollection in the store document for history
        const historyRef = db.collection('stores').doc(storeId).collection('topUpRequests').doc(snapshot.id);
        
        // 1. Sync the data to the store's subcollection
        await historyRef.set(requestData);
        logger.info(`Synced top-up request ${snapshot.id} to store ${storeId}`);

        // 2. Send notification to admin group
        const formattedAmount = (tokensToAdd || 0).toLocaleString('id-ID');
        const adminMessage = `🔔 *Permintaan Top-up Baru*\n\nToko: *${storeName}*\nJumlah: *${formattedAmount} token*\n\nMohon segera verifikasi di konsol admin.`;
        
        await whatsappQueueRef.add({
            to: 'admin_group',
            message: adminMessage,
            isGroup: true,
            storeId: 'platform', // Use platform settings
            createdAt: FieldValue.serverTimestamp(),
        });
        logger.info(`Queued new top-up request notification for admin group.`);

    } catch (error) {
        logger.error(`Failed to process new top-up request ${snapshot.id} for store ${storeId}:`, error);
    }
});

/**
 * Handles logic when a top-up request is updated (approved/rejected).
 * Sends notifications to the customer and admin group.
 */
export const onTopUpRequestUpdate = onDocumentUpdated("topUpRequests/{requestId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();

  if (!before || !after) {
    logger.info("No data change detected, exiting.");
    return;
  }

  // Proceed only if the status has changed
  if (before.status === after.status) {
    return;
  }
  
  const { storeId, storeName, status, tokensToAdd, userId, userName } = after;
  const requestId = event.params.requestId;

  if (!storeId || !storeName) {
    logger.error(`Request ${requestId} is missing 'storeId' or 'storeName'. Cannot process update.`);
    return;
  }

  // --- Sync data to store's subcollection regardless of status ---
  const historyRef = db.collection('stores').doc(storeId).collection('topUpRequests').doc(requestId);
  try {
      await historyRef.set(after, { merge: true });
      logger.info(`Synced update for request ${requestId} to store ${storeId}. New status: ${status}`);
  } catch(error) {
      logger.error(`Failed to sync update for request ${requestId} to store ${storeId}:`, error);
  }
  // --- End of Sync ---

  const whatsappQueueRef = db.collection('whatsappQueue');
  const formattedAmount = (tokensToAdd || 0).toLocaleString('id-ID');
  
  // Get customer's WhatsApp number from their user profile
  let customerWhatsapp = '';
  let customerName = userName || 'Pelanggan';

  if (userId) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
          customerWhatsapp = userDoc.data()?.whatsapp || '';
          customerName = userDoc.data()?.name || customerName;
      }
  }


  let customerMessage = '';
  let adminMessage = '';

  if (status === 'disetujui') {
      customerMessage = `✅ *Top-up Disetujui!*\n\nHalo ${customerName},\nPermintaan top-up Anda untuk toko *${storeName}* telah disetujui.\n\nSejumlah *${formattedAmount} token* telah ditambahkan ke saldo Anda.\n\nTerima kasih!`;
      adminMessage = `✅ *Top-up Disetujui*\n\nPermintaan dari: *${storeName}*\nJumlah: *${formattedAmount} token*\n\nStatus berhasil diperbarui dan saldo toko telah ditambahkan.`;
  } else if (status === 'ditolak') {
      customerMessage = `❌ *Top-up Ditolak*\n\nHalo ${customerName},\nMohon maaf, permintaan top-up Anda untuk toko *${storeName}* sejumlah ${formattedAmount} token telah ditolak.\n\nSilakan periksa bukti transfer Anda dan coba lagi, atau hubungi admin jika ada pertanyaan.`;
      adminMessage = `❌ *Top-up Ditolak*\n\nPermintaan dari: *${storeName}*\nJumlah: *${formattedAmount} token*\n\nStatus berhasil diperbarui. Tidak ada perubahan pada saldo toko.`;
  } else {
      // Do nothing for other status changes like 'pending'
      return;
  }

  try {
      // Queue notification for customer
      if (customerWhatsapp) {
          const formattedPhone = customerWhatsapp.startsWith('0') ? `62${customerWhatsapp.substring(1)}` : customerWhatsapp;
          await whatsappQueueRef.add({
              to: formattedPhone,
              message: customerMessage,
              storeId: 'platform', // Use platform settings for sending to customer
              createdAt: FieldValue.serverTimestamp(),
          });
          logger.info(`Queued '${status}' notification for customer ${customerName} of store ${storeId}`);
      } else {
          logger.warn(`User ${userId} for store ${storeId} does not have a WhatsApp number.`);
      }

      // Queue notification for admin group
      await whatsappQueueRef.add({
          to: 'admin_group',
          message: adminMessage,
          isGroup: true,
          storeId: 'platform', // Use platform settings
          createdAt: FieldValue.serverTimestamp(),
      });
      logger.info(`Queued '${status}' notification for admin group.`);

  } catch (error) {
      logger.error(`Failed to queue notifications for request ${requestId}:`, error);
  }
});


export const sendDailySalesSummary = onSchedule({
    schedule: "1 0 * * *", // Runs at 00:01 every day
    timeZone: "Asia/Jakarta",
}, async (event) => {
    logger.info("Starting daily sales summary dispatch...");
    try {
        const storesSnapshot = await db.collection('stores').get();
        if (storesSnapshot.empty) {
            logger.info("No stores registered. Halting process.");
            return;
        }

        const promises = storesSnapshot.docs.map(async (storeDoc) => {
            const store = storeDoc.data();
            const storeId = storeDoc.id;

            if (store.notificationSettings?.dailySummaryEnabled === false) {
                logger.info(`Daily summary is disabled for store: ${store.name}`);
                return;
            }
            
            if (!store.adminUids || store.adminUids.length === 0) {
                logger.warn(`Store ${store.name} has no admin UIDs.`);
                return;
            }

            // Calculate date range for yesterday
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const startOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
            const endOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);

            const transactionsSnapshot = await db.collectionGroup('transactions')
                .where('storeId', '==', storeId)
                .where('createdAt', '>=', startOfDay)
                .where('createdAt', '<=', endOfDay)
                .get();

            let totalRevenue = 0;
            const totalTransactions = transactionsSnapshot.size;
            transactionsSnapshot.forEach(txDoc => {
                totalRevenue += txDoc.data().totalAmount || 0;
            });

            logger.info(`Store: ${store.name}, Yesterday's Revenue: Rp ${totalRevenue}, Transactions: ${totalTransactions}`);

            // Fetch admin details
            const adminDocs = await Promise.all(
                store.adminUids.map((uid: string) => db.collection('users').doc(uid).get())
            );

            const formattedDate = format(yesterday, "EEEE, d MMMM yyyy", { locale: idLocale });

            for (const adminDoc of adminDocs) {
                if (adminDoc.exists) {
                    const adminData = adminDoc.data();
                    if (adminData && adminData.whatsapp) {
                        const message = `*Ringkasan Harian Chika POS*\n*${store.name}* - ${formattedDate}\n\nHalo *${adminData.name}*, berikut adalah ringkasan penjualan Anda kemarin:\n- *Total Omset*: Rp ${totalRevenue.toLocaleString('id-ID')}\n- *Jumlah Transaksi*: ${totalTransactions}\n\nTerus pantau dan optimalkan performa penjualan Anda melalui dasbor Chika. Semangat selalu! 💪\n\n_Apabila tidak berkenan, fitur ini dapat dinonaktifkan di menu Pengaturan._`;

                        await db.collection('whatsappQueue').add({
                            to: adminData.whatsapp,
                            message: message,
                            isGroup: false,
                            storeId: storeId,
                            createdAt: FieldValue.serverTimestamp(),
                        });
                        logger.info(`Daily report queued for ${adminData.name} (${store.name})`);
                    }
                }
            }
        });
        await Promise.all(promises);
        logger.info("Daily sales summary dispatch finished.");
    } catch (error) {
        logger.error("Error in scheduled function sendDailySalesSummary:", error);
    }
});
  
  
  

    
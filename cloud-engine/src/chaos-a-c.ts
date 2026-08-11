import 'dotenv/config';
import { startSession } from './whatsapp/session-manager.js';

startSession('tenant_chaos_a_c', (qr) => {
  console.log('[Chaos A/C] QR callback executed. Waiting for Chaos C (405 Ban) injection to trigger...');
});

// Mantener el proceso vivo
setTimeout(() => {
  console.log('[Chaos A/C] Test completed. Exiting.');
  process.exit(0);
}, 15000);

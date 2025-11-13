const cron = require('node-cron');
const Lead = require('../models/Lead'); // adjust path if needed

// Define your job logic here
async function resetLeadTracks() {
  try {
    await Lead.updateMany({}, {
      $set: {
        call_track: 0,
        whatsapp_track: 0,
        // all_call_track: 0,
        // all_whatsapp_track: 0
      }
    });
    console.log('✅ Daily track reset (UTC):', new Date().toISOString());
    console.log('when i am reset my time is check vikrant',new Date().toLocaleString('en-IN'))
  } catch (err) {
    console.error('❌ Error resetting track counts:', err);
  }
}

// Schedule the job (runs every midnight UTC)
cron.schedule('0 0 * * *', resetLeadTracks, {
  timezone: 'Asia/Kolkata'
});

// Optional: run it immediately once when the server starts (for testing)
// resetLeadTracks();

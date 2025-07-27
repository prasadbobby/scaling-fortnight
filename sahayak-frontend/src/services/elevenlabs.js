// src/services/elevenlabs.js
const ELEVENLABS_API_KEY = 'sk_fcfc43fe8fbacda18e7524851ae8686452a5f3bcd4402e9c';
const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

export class ElevenLabsService {
  static async makeOutboundCall(phoneNumber) {
    try {
      const response = await fetch(`${ELEVENLABS_API_BASE}/convai/twilio/outbound-call`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_id: "agent_01k0cgpwgmftssqfw7nh2et9yx",
          agent_phone_number_id: "phnum_01k0ch685kevbbbyrtyv5vmesb",
          to_number: phoneNumber
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('ElevenLabs call error:', error);
      return { success: false, error: error.message };
    }
  }
}
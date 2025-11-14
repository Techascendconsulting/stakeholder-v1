/**
 * Vercel Serverless Function: Whisper Audio Transcription
 * Handles audio transcription for voice meetings
 */

import OpenAI from 'openai';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow larger audio files
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audioData, language = 'en' } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Missing audioData' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Convert base64 to buffer
    const buffer = Buffer.from(audioData, 'base64');
    
    // Create a readable stream from the buffer
    const audioStream = Readable.from(buffer);
    audioStream.path = 'audio.webm'; // Whisper needs a filename

    // Transcribe audio
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: 'whisper-1',
      language,
    });

    return res.status(200).json({
      success: true,
      text: transcription.text,
    });

  } catch (error) {
    console.error('Transcription Error:', error);
    return res.status(500).json({ 
      error: 'Failed to transcribe audio',
      details: error.message 
    });
  }
}




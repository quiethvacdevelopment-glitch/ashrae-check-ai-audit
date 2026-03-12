import { GoogleGenAI } from '@google/genai';

const apiKey = 'AIzaSyCaAR0fuFcUYopcqmUk5wveA-5c5YWDhWI'; 
const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: 'Hello' }] }],
    });
    console.log("SUCCESS! Response:", response.text);
  } catch (err) {
    console.error("SDK Error:", err);
  }
}

run();

const key = 'AIzaSyCQFonYSCGASBRcOKWzl8bBj0AuNsiB97E';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
const data = { contents: [{ parts: [{ text: "Hello" }] }] };

async function test() {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await response.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Fetch Error:", e);
  }
}

test();

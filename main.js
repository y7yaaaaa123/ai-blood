import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

// 🔥🔥 FILL THIS OUT FIRST! 🔥🔥
// Get your Gemini API key by:
// - Selecting "Add Gemini API" in the "Firebase Studio" panel in the sidebar
// - Or by visiting https://g.co/ai/idxGetGeminiKey
let API_KEY = 'AIzaSyARI7d7w6TEybZ4mveUpYWhvWLOwnZQjfA';

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');
    // يظهر اسم الملف عند اختياره
    const fileInput = document.getElementById('fileInput');
    const uploadText = document.querySelector('.upload-text');

    fileInput.addEventListener('change', function () {
      if (this.files && this.files.length > 0) {
        uploadText.textContent = `Selected: ${this.files[0].name}`;
      } else {
        uploadText.textContent = 'Drag your file here or';
      }
    });
form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    const fileInput = document.getElementById('fileInput');
   const file = fileInput.files[0];


   const imageBase64 = await new Promise((resolve, reject) => {
     const reader = new FileReader();
     reader.readAsDataURL(file);
     reader.onload = () => {
       const base64String = reader.result.split(',')[1]; // Extract base64 part
       resolve(base64String);
     };
     reader.onerror = reject;
   });
    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          { text: promptInput.value }
        ]
      }
    ];

    // Call the multimodal model, and get a stream of results
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    // Read from the stream and interpret the output as markdown
    let buffer = [];
    let md = new MarkdownIt();
    for await (let response of stream) {
      buffer.push(response.text);
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

// You can delete this once you've filled out an API key
maybeShowApiKeyBanner(API_KEY);
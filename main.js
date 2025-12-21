import OpenAI from "openai";
import MarkdownIt from "markdown-it";
import './style.css';

//let API_KEY = "";

const client = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true, // مهم للـ browser
});

let form = document.querySelector("form");
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector(".output");

const fileInput = document.getElementById("fileInput");
const uploadText = document.querySelector(".upload-text");

fileInput.addEventListener("change", function () {
  uploadText.textContent = this.files.length
    ? `Selected: ${this.files[0].name}`
    : "Drag your file here or";
});

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = "Generating...";

  try {
    const file = fileInput.files[0];

    const imageBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptInput.value },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
    });

    const md = new MarkdownIt();
    output.innerHTML = md.render(
      response.choices[0].message.content
    );

  } catch (e) {
    output.innerHTML = "<hr>" + e.message;
  }
};

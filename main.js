import OpenAI from "openai";
import MarkdownIt from "markdown-it";
import './style.css';

const md = new MarkdownIt(); // ✅ هنا أنشأنا الـ instance
let API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true,
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

const bloodInfo = {
  "A+": "A+ can receive from A+ & A-, O+ & O-. Can donate to A+ & AB+. RH+: can donate to + only. Male/Female: similar.",
  "A-": "A- can receive from A- & O-. Can donate to A+, A-, AB+, AB-. RH-: universal donor for - types.",
  "B+": "B+ can receive from B+ & B-, O+ & O-. Can donate to B+ & AB+. RH+: donation limited to + types.",
  "B-": "B- can receive from B- & O-. Can donate to B+, B-, AB+, AB-. RH-: universal donor for - types.",
  "AB+": "AB+ universal recipient. Can donate only to AB+. RH+ affects donation.",
  "AB-": "AB- can receive from AB-, A-, B-, O-. Can donate to AB+ & AB-.",
  "O+": "O+ can receive from O+ & O-. Can donate to O+, A+, B+, AB+.",
  "O-": "O- universal donor. Can receive from O- only."
};

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
      model: "gpt-4.1",
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

let bloodTypeRaw = response.choices[0].message.content.trim();

// تنظيف النص لاستخراج فصيلة الدم فقط
const bloodTypeMatch = bloodTypeRaw.match(/(A|B|AB|O)[+-]/i);
const bloodType = bloodTypeMatch ? bloodTypeMatch[0].toUpperCase() : null;

const info = bloodType ? bloodInfo[bloodType] : "No information available.";

    output.innerHTML = md.render(
      `**Blood Type:** ${bloodType}\n\n${info}`
    );

  } catch (e) {
    output.innerHTML = "<hr>" + e.message;
  }
};

import MarkdownIt from "markdown-it";
import './style.css';

const md = new MarkdownIt();

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

// 🧠 منطق ثابت لتحديد زمرة الدم
function determineBloodType(a, b, rh) {
  if (a && b && rh) return "AB+";
  if (a && b && !rh) return "AB-";
  if (a && !b && rh) return "A+";
  if (a && !b && !rh) return "A-";
  if (!a && b && rh) return "B+";
  if (!a && b && !rh) return "B-";
  if (!a && !b && rh) return "O+";
  if (!a && !b && !rh) return "O-";
}

// threshold
const isAgglutination = (v) => v === 2;
const isUnclear = (v) => v === 1;

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = "Analyzing image...";

  try {
    const file = fileInput.files[0];
    if (!file) throw new Error("No image selected");

    const imageBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        prompt: promptInput.value,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.rawResponse;

    // استخراج القيم الرقمية
    const a = Number(raw.match(/Anti-A:\s*(\d)/i)?.[1]);
    const b = Number(raw.match(/Anti-B:\s*(\d)/i)?.[1]);
    const rh = Number(raw.match(/Rh:\s*(\d)/i)?.[1]);

    if ([a, b, rh].some(v => isNaN(v))) {
      throw new Error("Invalid AI response");
    }

    // إذا أكو غموض → نرفض القرار
    if (isUnclear(a) || isUnclear(b) || isUnclear(rh)) {
      output.innerHTML = md.render(
        `⚠️ **Result: Uncertain**  
The image contains weak or unclear agglutination.`
      );
      return;
    }

    const bloodType = determineBloodType(
      isAgglutination(a),
      isAgglutination(b),
      isAgglutination(rh)
    );

    output.innerHTML = md.render(
      `### ✅ Blood Type Result  
**${bloodType}**

**Agglutination scores**
- Anti-A: ${a}
- Anti-B: ${b}
- Rh: ${rh}`
    );

  } catch (e) {
    output.innerHTML = "<hr>" + e.message;
  }
};

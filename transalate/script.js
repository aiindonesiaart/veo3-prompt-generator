document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("promptForm");
  const output = document.getElementById("generatedPrompt");
  const translatedOutput = document.getElementById("translatedPrompt");
  const copyBtn = document.getElementById("copyButton");
  const translateToggle = document.getElementById("translateToggle");

  // Mock dictionary for translation
  const translations = {
    "Buat video bergaya": "Create a video in the style",
    "tentang": "about",
    "yang sedang": "who is",
    "dengan emosi": "with emotion",
    "Di lokasi": "At location",
    "Gunakan pergerakan kamera": "Use camera movement",
    "dari sudut pandang": "from the point of view",
    "menggunakan lensa": "using a lens",
    "Spesifikasi teknis: Kualitas video": "Technical specifications: Video quality"
  };

  function translate(text) {
    return text.replace(/Buat video bergaya|tentang|yang sedang|dengan emosi|Di lokasi|Gunakan pergerakan kamera|dari sudut pandang|menggunakan lensa|Spesifikasi teknis: Kualitas video/g, match => translations[match] || match);
  }

  function generatePrompt() {
    const subject = document.getElementById("subject").value.trim() || "seorang tokoh";
    const mainAction = document.getElementById("mainAction").value.trim() || "melakukan aksi";
    const emotion = document.getElementById("emotion").value.trim() || "dengan emosi";
    const location = document.getElementById("location").value.trim();
    const style = document.getElementById("style").value;
    const cameraMovement = document.getElementById("cameraMovement").value;
    const cameraAngle = document.getElementById("cameraAngle").value;
    const focalLength = document.getElementById("focalLength").value;
    const videoQuality = document.getElementById("videoQuality").value;

    let prompt = `Buat video bergaya ${style} tentang ${subject} `;
    prompt += `yang sedang ${mainAction} dengan emosi ${emotion}. `;
    if (location) prompt += `Di lokasi ${location}. `;
    prompt += `Gunakan pergerakan kamera ${cameraMovement}, dari sudut pandang ${cameraAngle} menggunakan lensa ${focalLength}. `;
    prompt += `Spesifikasi teknis: Kualitas video ${videoQuality}.`;

    output.textContent = prompt;

    if (translateToggle.checked) {
      const enPrompt = translate(prompt);
      translatedOutput.textContent = enPrompt;
      translatedOutput.classList.remove("hidden");
    } else {
      translatedOutput.classList.add("hidden");
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    generatePrompt();
  });

  copyBtn.addEventListener("click", () => {
    const idText = output.textContent;
    const enText = translatedOutput.classList.contains("hidden") ? "" : translatedOutput.textContent;
    const fullText = enText ? `${idText}\n\n${enText}` : idText;

    navigator.clipboard.writeText(fullText).then(() => {
      copyBtn.textContent = "✓ Tersalin!";
      setTimeout(() => {
        copyBtn.textContent = "Salin ke Clipboard";
      }, 2000);
    }).catch(err => {
      alert("Gagal menyalin teks: " + err.message);
    });
  });

  generatePrompt(); // Initial load
});

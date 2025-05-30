document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("promptForm");
  const output = document.getElementById("generatedPrompt");
  const translatedOutput = document.getElementById("translatedPrompt");
  const copyBtn = document.getElementById("copyButton");
  const translateToggle = document.getElementById("translateToggle");

  function generatePrompt() {
    // Get values from form
    const subject = document.getElementById("subject").value.trim() || "seorang tokoh";
    const mainAction = document.getElementById("mainAction").value.trim() || "melakukan aksi";
    const emotion = document.getElementById("emotion").value.trim() || "dengan emosi";
    const location = document.getElementById("location").value.trim();
    const style = document.getElementById("style").value.split(" / ")[0];
    const cameraMovement = document.getElementById("cameraMovement").value.split(" / ")[0];

    // Generate Indonesian prompt
    let idPrompt = `Buat video bergaya ${style} tentang ${subject} `;
    idPrompt += `yang sedang ${mainAction} dengan emosi ${emotion}. `;
    if (location) idPrompt += `Di lokasi ${location}. `;
    idPrompt += `Gunakan pergerakan kamera ${cameraMovement}.`;

    // Display Indonesian prompt
    output.textContent = idPrompt;

    // Generate English prompt if needed
    if (translateToggle.checked) {
      updateEnglishPrompt();
    }
  }

  function updateEnglishPrompt() {
    const subjectEn = document.getElementById("subject").value.split(" / ")[1] || "a character";
    const mainActionEn = document.getElementById("mainAction").value.split(" / ")[1] || "performing an action";
    const emotionEn = document.getElementById("emotion").value.split(" / ")[1] || "with emotion";
    const locationEn = document.getElementById("location").value.split(" / ")[1] || "at location";
    const styleEn = document.getElementById("style").value.split(" / ")[1] || "cinematic style";
    const cameraMovementEn = document.getElementById("cameraMovement").value.split(" / ")[1] || "camera movement";

    let enPrompt = `Create a ${styleEn} style video about ${subjectEn} `;
    enPrompt += `who is ${mainActionEn} with ${emotionEn}. `;
    if (document.getElementById("location").value.includes("/")) enPrompt += `At location ${locationEn}. `;
    enPrompt += `Use ${cameraMovementEn} camera movement.`;

    translatedOutput.textContent = enPrompt;
    translatedOutput.classList.remove("hidden");
  }

  // Event listener for toggle
  translateToggle.addEventListener("change", function () {
    if (this.checked) {
      updateEnglishPrompt(); // Only regenerate if needed
    } else {
      translatedOutput.classList.add("hidden");
    }
  });

  // Copy button logic
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

  // Initial generation
  generatePrompt();

  // Re-generate prompt on form change
  form.addEventListener("input", generatePrompt);
});

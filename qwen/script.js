document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("promptForm");
  const output = document.getElementById("generatedPrompt");
  const copyBtn = document.getElementById("copyButton");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    generatePrompt();
  });

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

    output.innerHTML = `<p class="whitespace-pre-line">${prompt}</p>`;
  }

  // Copy to clipboard
  copyBtn.addEventListener("click", () => {
    const text = output.innerText;
    navigator.clipboard.writeText(text).then(() => {
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
});

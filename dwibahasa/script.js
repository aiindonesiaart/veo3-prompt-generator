document.addEventListener('DOMContentLoaded', function () {
  const promptForm = document.getElementById('promptForm');
  const generatedPrompt = document.getElementById('generatedPrompt');
  const copyButton = document.getElementById('copyButton');

  promptForm.addEventListener('submit', function (e) {
    e.preventDefault();
    generatePrompt();
  });

  function generatePrompt() {
    const subject = document.getElementById('subject').value;
    const subjectCharacteristics = document.getElementById('subjectCharacteristics').value;
    const videoQuality = document.getElementById('videoQuality').value;

    let prompt = '';

    if (subject.trim() !== '') {
      prompt += `Buat video bergaya cinematic tentang ${subject}`;
    } else {
      prompt += `Buat video bergaya cinematic tentang ${subjectCharacteristics}`;
    }

    prompt += ` dengan kualitas video ${videoQuality}.`;

    generatedPrompt.innerHTML = `
      <div class="space-y-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-blue-800 mb-2">Prompt dalam Bahasa Indonesia:</h3>
          <p class="text-gray-800 whitespace-pre-line">${prompt}</p>
        </div>
      </div>
    `;

    copyButton.classList.remove('hidden');
  }

  copyButton.addEventListener('click', async () => {
    const text = generatedPrompt.innerText || generatedPrompt.textContent;
    try {
      await navigator.clipboard.writeText(text);
      alert("Prompt tersalin!");
    } catch (err) {
      console.error("Gagal menyalin:", err);
    }
  });
});

class PromptHandler {
  constructor() {
    this.specialContent = {
      dialogs: [],
      audioSettings: [],
      technicalSpecs: []
    };
    this.translatedOptions = new Map();
  }

  extractSpecialContent(text) {
    this.specialContent = {
      dialogs: [],
      audioSettings: [],
      technicalSpecs: []
    };

    const dialogRegex = /"([^"]+)"\s*(?:\((\d+)%\))?/g;
    let match;
    while ((match = dialogRegex.exec(text)) !== null) {
      this.specialContent.dialogs.push({
        original: match[0],
        text: match[1],
        volume: match[2] ? `(${match[2]}%)` : ''
      });
    }

    const audioRegex = /\((\d+)%\)/g;
    while ((match = audioRegex.exec(text)) !== null) {
      this.specialContent.audioSettings.push(match[0]);
    }

    const techRegex = /Kualitas ([^\.]+)\./g;
    while ((match = techRegex.exec(text)) !== null) {
      this.specialContent.technicalSpecs.push(match[0]);
    }
  }

  prepareForTranslation(text) {
    let processedText = text;
    this.specialContent.dialogs.forEach((dialog, index) => {
      processedText = processedText.replace(dialog.original, `[DIALOG_${index + 1}]`);
    });
    this.specialContent.audioSettings.forEach((setting, index) => {
      processedText = processedText.replace(setting, `[AUDIO_${index + 1}]`);
    });
    this.specialContent.technicalSpecs.forEach((spec, index) => {
      processedText = processedText.replace(spec, `[TECH_${index + 1}]`);
    });
    return processedText;
  }

  restoreSpecialContent(translatedText) {
    this.specialContent.dialogs.forEach((dialog, index) => {
      translatedText = translatedText.replace(`[DIALOG_${index + 1}]`, `"${dialog.text}" ${dialog.volume}`);
    });
    this.specialContent.audioSettings.forEach((setting, index) => {
      translatedText = translatedText.replace(`[AUDIO_${index + 1}]`, setting);
    });
    this.specialContent.technicalSpecs.forEach((spec, index) => {
      translatedText = translatedText.replace(`[TECH_${index + 1}]`, spec);
    });
    return translatedText;
  }

  cleanupTranslatedText(text) {
    return text
      .replace(/cinematic -style/g, 'cinematic style')
      .replace(/wide wide/g, 'wide')
      .replace(/\s+/g, ' ')
      .replace(/\s*\.\s*/g, '. ')
      .trim();
  }

  async translateText(text) {
    this.extractSpecialContent(text);
    const processedText = this.prepareForTranslation(text);

    // Translate using Google Translate API
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(processedText)}`);
    const data = await response.json();
    let translatedText = data[0].map(x => x[0]).join('');

    translatedText = this.restoreSpecialContent(translatedText);
    translatedText = this.cleanupTranslatedText(translatedText);

    return translatedText;
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Berhasil disalin");
    } catch (err) {
      console.error("Gagal menyalin", err);
    }
  }
}

const promptHandler = new PromptHandler();
window.promptHandler = promptHandler;

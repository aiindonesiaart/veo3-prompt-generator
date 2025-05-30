// Prompt Handler Class
class PromptHandler {
    constructor() {
        this.specialContent = {
            dialogs: [],
            audioSettings: [],
            technicalSpecs: []
        };
        this.translatedOptions = new Map();
    }
    
    // Extract and store special content
    extractSpecialContent(text) {
        // Reset special content
        this.specialContent = {
            dialogs: [],
            audioSettings: [],
            technicalSpecs: []
        };
        
        // Extract dialogs with their volume settings
        const dialogRegex = /"([^"]+)"\s*(?:\((\d+)%\))?/g;
        let match;
        while ((match = dialogRegex.exec(text)) !== null) {
            const fullMatch = match[0];
            const dialogText = match[1];
            const volume = match[2] ? `(${match[2]}%)` : '';
            this.specialContent.dialogs.push({
                original: fullMatch,
                text: dialogText,
                volume: volume
            });
        }
        
        // Extract audio settings
        const audioRegex = /\((\d+)%\)/g;
        while ((match = audioRegex.exec(text)) !== null) {
            this.specialContent.audioSettings.push(match[0]);
        }
        
        // Extract technical specifications
        const techRegex = /Kualitas ([^\.]+)\./g;
        while ((match = techRegex.exec(text)) !== null) {
            this.specialContent.technicalSpecs.push(match[0]);
        }
    }
    
    // Prepare text for translation
    prepareForTranslation(text) {
        let processedText = text;
        
        // Replace dialogs with placeholders
        this.specialContent.dialogs.forEach((dialog, index) => {
            processedText = processedText.replace(
                dialog.original,
                `[DIALOG_${index + 1}]`
            );
        });
        
        // Replace audio settings with placeholders
        this.specialContent.audioSettings.forEach((setting, index) => {
            processedText = processedText.replace(
                setting,
                `[AUDIO_${index + 1}]`
            );
        });
        
        // Replace technical specifications with placeholders
        this.specialContent.technicalSpecs.forEach((spec, index) => {
            processedText = processedText.replace(
                spec,
                `[TECH_${index + 1}]`
            );
        });
        
        return processedText;
    }
    
    // Restore special content after translation
    restoreSpecialContent(translatedText) {
        let restoredText = translatedText;
        
        // Restore dialogs
        this.specialContent.dialogs.forEach((dialog, index) => {
            restoredText = restoredText.replace(
                `[DIALOG_${index + 1}]`,
                `"${dialog.text}" ${dialog.volume}`
            );
        });
        
        // Restore audio settings
        this.specialContent.audioSettings.forEach((setting, index) => {
            restoredText = restoredText.replace(
                `[AUDIO_${index + 1}]`,
                setting
            );
        });
        
        // Restore technical specifications
        this.specialContent.technicalSpecs.forEach((spec, index) => {
            restoredText = restoredText.replace(
                `[TECH_${index + 1}]`,
                spec
            );
        });
        
        return restoredText;
    }
    
    // Clean up translated text
    cleanupTranslatedText(text) {
        return text
            // Preserve important terms
            .replace(/Audio:/g, 'Audio:')
            .replace(/Master:/g, 'Master:')
            .replace(/Quality:/g, 'Quality:')
            .replace(/Technical specifications:/g, 'Technical specifications:')
            .replace(/Informative narrative:/g, 'Informative narrative:')
            .replace(/Narrative:/g, 'Narrative:')
            .replace(/Dialog:/g, 'Dialog:')
            .replace(/Sound effects:/g, 'Sound effects:')
            .replace(/Background music:/g, 'Background music:')
            .replace(/Professional interview:/g, 'Professional interview:')
            // Remove unwanted placeholders
            .replace(/\[dialog_\d+\]/g, '')
            .replace(/\[Dialog_\d+\]/g, '')
            .replace(/\[Tech_\d+\]/g, '')
            .replace(/\(master:\s*\d+%\)/g, '')
            // Fix common translation mistakes
            .replace(/cinematic -style/g, 'cinematic style')
            .replace(/wide wide/g, 'wide')
            .replace(/natural natural/g, 'natural')
            .replace(/stable stable/g, 'stable')
            .replace(/sunny suny/g, 'sunny')
            // Clean up formatting
            .replace(/\s+/g, ' ')
            .replace(/\s*\.\s*/g, '. ')
            .replace(/\s*,\s*/g, ', ')
            .replace(/\s*:\s*/g, ': ')
            .replace(/\s*-\s*/g, '-')
            .replace(/\s*\(\s*/g, '(')
            .replace(/\s*\)\s*/g, ')')
            .replace(/\s*"\s*/g, '"')
            .replace(/\s*"\s*/g, '"')
            .trim();
    }
    
    // Translate dropdown options
    async translateDropdownOption(text) {
        if (this.translatedOptions.has(text)) {
            return this.translatedOptions.get(text);
        }
        
        try {
            // Only translate from Indonesian to English
            const response = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=' + encodeURIComponent(text));
            const data = await response.json();
            const translatedText = data[0].map(x => x[0]).join('');
            this.translatedOptions.set(text, translatedText);
            return translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }
    
    // Translate dropdown options for audio section
    async translateAudioDropdowns() {
        const dropdowns = [
            'dialog',
            'dialogCharacter',
            'voiceMood',
            'backgroundMusic',
            'soundEffects',
            'volume',
            'audioTranslation'
        ];
        
        for (const dropdownId of dropdowns) {
            const select = document.getElementById(dropdownId);
            if (select) {
                const options = Array.from(select.options);
                for (const option of options) {
                    if (option.value !== 'none' && option.value !== 'custom') {
                        const translatedText = await this.translateDropdownOption(option.text);
                        option.text = translatedText;
                    }
                }
            }
        }
    }
    
    // Initialize translations for dropdowns
    async initializeDropdownTranslations() {
        await this.translateAudioDropdowns();
    }
    
    // Main translation function
    async translateText(text) {
        try {
            // Get translation option from the page
            const audioTranslation = document.getElementById('audioTranslation')?.value || 'none';
            
            // If full English translation is selected, translate dropdowns
            if (audioTranslation === 'full_english') {
                await this.translateAudioDropdowns();
            }
            
            // Extract special content
            this.extractSpecialContent(text);
            
            // Prepare text for translation
            const processedText = this.prepareForTranslation(text);
            
            // Split text into main content and audio section
            const parts = processedText.split('Audio:');
            const mainContent = parts[0];
            const audioSection = parts[1] || '';
            
            // Translate main content from Indonesian to English only
            const mainResponse = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=' + encodeURIComponent(mainContent));
            const mainData = await mainResponse.json();
            let translatedText = mainData[0].map(x => x[0]).join('');
            
            // Handle audio section translation
            if (audioSection) {
                if (audioTranslation === 'full_english') {
                    // Translate the entire audio section from Indonesian to English only
                    const audioResponse = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=' + encodeURIComponent(audioSection));
                    const audioData = await audioResponse.json();
                    const translatedAudio = audioData[0].map(x => x[0]).join('');
                    
                    // Add translated audio section
                    translatedText += '\n\nAudio: ' + translatedAudio;
                } else {
                    // Keep original audio section
                    translatedText += '\n\nAudio: ' + audioSection;
                }
            }
            
            // Handle dialog translation based on the selected option
            if (audioTranslation === 'full_english') {
                // Translate all dialogs from Indonesian to English only
                for (let dialog of this.specialContent.dialogs) {
                    const dialogResponse = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=' + encodeURIComponent(dialog.text));
                    const dialogData = await dialogResponse.json();
                    dialog.text = dialogData[0].map(x => x[0]).join('');
                }
            }
            
            // Restore special content
            translatedText = this.restoreSpecialContent(translatedText);
            
            // Clean up the translated text
            translatedText = this.cleanupTranslatedText(translatedText);
            
            // Add dangdut koplo background music if not already present
            if (!translatedText.includes('dangdut koplo') && !translatedText.includes('Dangdut Koplo')) {
                const audioSection = translatedText.split('Audio:')[1]?.trim() || '';
                if (audioSection) {
                    const updatedAudioSection = audioSection.replace(
                        /Background music:.*?(?=,|$)/,
                        'Background music: Dangdut Koplo'
                    );
                    translatedText = translatedText.replace(audioSection, updatedAudioSection);
                }
            }
            
            return translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }
    
    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            // Show success message
            const copyButton = document.getElementById('copyButton');
            if (copyButton) {
                const originalText = copyButton.textContent;
                copyButton.textContent = '✓ Copied!';
                copyButton.classList.add('bg-green-100', 'text-green-800');
                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.classList.remove('bg-green-100', 'text-green-800');
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Show error message
            const copyButton = document.getElementById('copyButton');
            if (copyButton) {
                const originalText = copyButton.textContent;
                copyButton.textContent = '❌ Failed to copy';
                copyButton.classList.add('bg-red-500');
                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.classList.remove('bg-red-500');
                }, 2000);
            }
        }
    }
    
    // Initialize copy button
    initializeCopyButton() {
        const copyButton = document.getElementById('copyButton');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                const generatedPrompt = document.getElementById('generatedPrompt');
                if (generatedPrompt) {
                    const promptText = generatedPrompt.querySelector('p')?.textContent || '';
                    this.copyToClipboard(promptText);
                }
            });
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    const promptHandler = new PromptHandler();
    
    // Initialize form elements
    const promptForm = document.getElementById('promptForm');
    const generatedPrompt = document.getElementById('generatedPrompt');
    const copyButton = document.getElementById('copyButton');
    
    // Toggle audio mixing section
    const showAudioMixing = document.getElementById('showAudioMixing');
    const audioMixingContent = document.getElementById('audioMixingContent');
    
    if (showAudioMixing && audioMixingContent) {
        showAudioMixing.addEventListener('change', function() {
            audioMixingContent.classList.toggle('hidden', !this.checked);
        });
    }
    
    // Toggle audio processing section
    const showAudioProcessing = document.getElementById('showAudioProcessing');
    const audioProcessingContent = document.getElementById('audioProcessingContent');
    
    if (showAudioProcessing && audioProcessingContent) {
        showAudioProcessing.addEventListener('change', function() {
            audioProcessingContent.classList.toggle('hidden', !this.checked);
        });
    }
    
    // Update volume displays
    function updateVolumeDisplay(inputId, displayId) {
        const input = document.getElementById(inputId);
        const display = document.getElementById(displayId);
        if (input && display) {
            display.textContent = input.value + '%';
            input.addEventListener('input', function() {
                display.textContent = this.value + '%';
            });
        }
    }
    
    updateVolumeDisplay('dialogVolume', 'dialogVolumeValue');
    updateVolumeDisplay('musicVolume', 'musicVolumeValue');
    updateVolumeDisplay('effectsVolume', 'effectsVolumeValue');
    updateVolumeDisplay('overallVolume', 'overallVolumeValue');
    
    // Handle custom inputs
    function setupCustomInputs() {
        const customInputs = {
            'dialog': 'customDialogInput',
            'dialogCharacter': 'customDialogCharacterInput',
            'voiceMood': 'customVoiceMoodInput',
            'backgroundMusic': 'customMusicInput',
            'soundEffects': 'customSoundEffectsInput',
            'volume': 'customVolumeInput'
        };
        
        Object.entries(customInputs).forEach(([selectId, inputId]) => {
            const select = document.getElementById(selectId);
            const inputDiv = document.getElementById(inputId);
            if (select && inputDiv) {
                select.addEventListener('change', function() {
                    inputDiv.classList.toggle('hidden', this.value !== 'custom');
                });
            }
        });
    }
    
    setupCustomInputs();
    
    // Dialog inputs functionality
    function addDialogInput() {
        const dialogInputs = document.getElementById('dialogInputs');
        if (dialogInputs) {
            const newDialog = document.createElement('div');
            newDialog.className = 'flex gap-4 items-start';
            newDialog.innerHTML = `
                <div class="w-1/4">
                    <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary input-field dialog-character">
                        <option value="Karakter 1">Character 1</option>
                        <option value="Karakter 2">Character 2</option>
                        <option value="Karakter 3">Character 3</option>
                        <option value="Narator">Narrator</option>
                        <option value="Pembawa Berita">News Anchor</option>
                        <option value="custom">Custom Input</option>
                    </select>
                </div>
                <input type="text" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary input-field" placeholder="Enter dialog...">
                <button type="button" class="text-red-500 hover:text-red-700" onclick="removeDialog(this)">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `;
            dialogInputs.appendChild(newDialog);
        }
    }
    
    window.addDialogInput = addDialogInput;
    
    function addDialogCharacter() {
        const customName = prompt('Enter new character name:');
        if (customName) {
            const characterOptions = document.querySelectorAll('.dialog-character');
            characterOptions.forEach(select => {
                const option = document.createElement('option');
                option.value = customName;
                option.textContent = customName;
                select.appendChild(option);
            });
        }
    }
    
    window.addDialogCharacter = addDialogCharacter;
    
    function removeDialog(button) {
        const dialogInputs = document.getElementById('dialogInputs');
        if (dialogInputs && dialogInputs.children.length > 1) {
            button.parentElement.remove();
        }
    }
    
    window.removeDialog = removeDialog;
    
    // Sound effects functionality
    function addSoundEffect() {
        const soundEffectsInputs = document.getElementById('soundEffectsInputs');
        if (soundEffectsInputs) {
            const newEffect = document.createElement('div');
            newEffect.className = 'flex gap-2';
            newEffect.innerHTML = `
                <input type="text" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Describe sound effect...">
                <button type="button" class="text-red-500 hover:text-red-700" onclick="removeSoundEffect(this)">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `;
            soundEffectsInputs.appendChild(newEffect);
        }
    }
    
    window.addSoundEffect = addSoundEffect;
    
    function removeSoundEffect(button) {
        const soundEffectsInputs = document.getElementById('soundEffectsInputs');
        if (soundEffectsInputs && soundEffectsInputs.children.length > 0) {
            button.parentElement.remove();
        }
    }
    
    window.removeSoundEffect = removeSoundEffect;
    
    // Form submission
    promptForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await generatePrompt();
    });
    
    // Generate prompt function
    async function generatePrompt() {
        // Get all form values
        const subject = document.getElementById('subject').value;
        const subjectCharacteristics = document.getElementById('subjectCharacteristics').value;
        const mainAction = document.getElementById('mainAction').value;
        const emotion = document.getElementById('emotion').value;
        const location = document.getElementById('location').value;
        const time = document.getElementById('time').value;
        const weather = document.getElementById('weather').value;
        const season = document.getElementById('season').value;
        const style = document.getElementById('style').value;
        const cameraMovement = document.getElementById('cameraMovement').value;
        const cameraAngle = document.getElementById('cameraAngle').value;
        const focalLength = document.getElementById('focalLength').value;
        const lighting = document.getElementById('lighting').value;
        const colorGrading = document.getElementById('colorGrading').value;
        const videoQuality = document.getElementById('videoQuality').value;
        const additionalDetails = document.getElementById('additionalDetails').value;
        
        // Audio settings
        const dialog = document.getElementById('dialog').value;
        const dialogCharacter = document.getElementById('dialogCharacter').value;
        const voiceMood = document.getElementById('voiceMood').value;
        const backgroundMusic = document.getElementById('backgroundMusic').value;
        const soundEffects = document.getElementById('soundEffects').value;
        const volume = document.getElementById('volume').value;
        const audioTranslation = document.getElementById('audioTranslation').value;
        
        // Get dialog inputs
        const dialogInputs = Array.from(document.querySelectorAll('#dialogInputs .flex')).map(div => {
            const character = div.querySelector('.dialog-character').value;
            const text = div.querySelector('input').value;
            return { character, text };
        }).filter(item => item.text.trim() !== '');
        
        // Get sound effects
        const customSoundEffects = Array.from(document.querySelectorAll('#soundEffectsInputs input')).map(input => input.value).filter(value => value.trim() !== '');
        
        // Build the prompt
        let prompt = '';
        
        // Subject section
        if (subject.trim() !== '') {
            prompt += `Buat video bergaya ${style} tentang ${subject}`;
        } else {
            prompt += `Buat video bergaya ${style} tentang ${subjectCharacteristics}`;
        }
        
        // Action and emotion
        prompt += ` yang sedang ${mainAction} dengan emosi ${emotion}`;
        
        // Environment
        if (location.trim() !== '') {
            prompt += ` di ${location}`;
        }
        prompt += ` pada ${time} ${season} dengan cuaca ${weather}.\n\n`;
        
        // Cinematography
        prompt += `Gunakan pergerakan kamera ${cameraMovement} dari sudut ${cameraAngle} dengan lensa ${focalLength}. `;
        prompt += `Berikan pencahayaan ${lighting} dan gradiasi warna ${colorGrading}.\n\n`;
        
        // Audio
        let audioText = '';
        if (dialog !== 'none') {
            audioText += `Dialog: ${dialog}`;
            if (dialogCharacter !== 'none') {
                audioText += ` (${dialogCharacter})`;
            }
            if (voiceMood !== 'none') {
                audioText += ` dengan suasana ${voiceMood}`;
            }
            if (dialogInputs.length > 0) {
                audioText += `:\n${dialogInputs.map(d => `- ${d.character}: "${d.text}"`).join('\n')}`;
            }
        }
        
        if (backgroundMusic !== 'none') {
            if (audioText !== '') audioText += '\n';
            audioText += `Musik Latar: ${backgroundMusic}`;
        }
        
        if (soundEffects !== 'none') {
            if (audioText !== '') audioText += '\n';
            if (soundEffects === 'custom' && customSoundEffects.length > 0) {
                audioText += `Efek Suara: ${customSoundEffects.join(', ')}`;
            } else {
                audioText += `Efek Suara: ${soundEffects}`;
            }
        }
        
        if (audioText === '') {
            audioText = 'Tanpa audio';
        }
        
        prompt += `${audioText}\n\n`;
        
        // Technical details
        prompt += `Spesifikasi teknis: Kualitas ${videoQuality}.`;
        
        // Additional details
        if (additionalDetails.trim() !== '') {
            prompt += `\n\n${additionalDetails}`;
        }
        
        // Translate the prompt if needed
        let englishPrompt = '';
        const translationOption = document.getElementById('audioTranslation').value;
        
        if (translationOption === 'english' || translationOption === 'full_english') {
            englishPrompt = await promptHandler.translateText(prompt);
        }
        
        // Display the prompts
        generatedPrompt.innerHTML = `
            <div class="space-y-4">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="text-sm font-medium text-blue-800 mb-2">Prompt in Indonesian:</h3>
                    <p class="text-gray-800 whitespace-pre-line">${prompt}</p>
                    <button class="copy-btn mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 px-3 py-1 rounded border border-blue-200 hover:border-blue-400 transition-colors" data-text="${prompt.replace(/"/g, '&quot;').replace(/\n/g, '\\n')}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                        </svg>
                        <span>Copy</span>
                    </button>
                </div>
        `;
        
        if (englishPrompt) {
            generatedPrompt.innerHTML += `
                <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="text-sm font-medium text-green-800 mb-2">Translated Prompt in English:</h3>
                    <p class="text-gray-800 whitespace-pre-line">${englishPrompt}</p>
                    <button class="copy-btn mt-2 text-green-600 hover:text-green-800 text-sm flex items-center gap-1 px-3 py-1 rounded border border-green-200 hover:border-green-400 transition-colors" data-text="${englishPrompt.replace(/"/g, '&quot;').replace(/\n/g, '\\n')}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                        </svg>
                        <span>Copy</span>
                    </button>
                </div>
            `;
        }
        
        generatedPrompt.innerHTML += `</div>`;
        
        // Show copy button
        copyButton.classList.remove('hidden');
        promptHandler.initializeCopyButton();
        
        // Add click events to all copy buttons
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', function() {
                const text = this.getAttribute('data-text').replace(/\\n/g, '\n').replace(/&quot;/g, '"');
                promptHandler.copyToClipboard(text);
            });
        });
    }
    
    window.generatePrompt = generatePrompt;
    
    // Initialize with a default prompt
    generatePrompt();
});

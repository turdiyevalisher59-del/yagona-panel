// Mobile Voice Assistant Support
// Handles speech recognition issues on mobile/tablet devices

(function () {
    'use strict';

    // Check if speech recognition is supported
    const isSpeechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const isFileProtocol = location.protocol === 'file:';
    const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    // Voice assistant is limited on file:// protocol
    const voiceLimited = isFileProtocol || (!isSecureContext && (isMobile || isTablet));

    console.log('Mobile Support:', { isMobile, isTablet, isIOS, isAndroid, isSpeechSupported, isSecureContext, isFileProtocol, voiceLimited });

    // Create text input fallback UI
    function createTextInputFallback() {
        if (document.getElementById('voiceTextInputContainer')) return;

        const container = document.createElement('div');
        container.id = 'voiceTextInputContainer';
        container.className = 'voice-text-input-container';
        container.innerHTML = `
            <div class="voice-text-header">
                <span>Buyruq yozing yoki tanlang</span>
                <button class="close-text-input" onclick="closeTextInput()">×</button>
            </div>
            <div class="voice-text-input-row">
                <input type="text" id="voiceTextInput" placeholder="Buyruq yozing..." autocomplete="off">
                <button onclick="submitTextCommand()">➤</button>
            </div>
            <div class="voice-quick-commands">
                <button onclick="quickCommand('mkb')">MKB</button>
                <button onclick="quickCommand('agro')">Agro</button>
                <button onclick="quickCommand('xalq')">Xalq</button>
                <button onclick="quickCommand('xarita')">Xarita</button>
                <button onclick="quickCommand('telefon qil')">Telefon</button>
                <button onclick="quickCommand('umumiy malumot')">Ma'lumot</button>
                <button onclick="quickCommand('havo')">🌤️ Havo</button>
                <button onclick="quickCommand('yangilik')">📰 Yangilik</button>
            </div>
        `;

        document.body.appendChild(container);
        
        // Add enter key support for text input
        const input = container.querySelector('#voiceTextInput');
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    submitTextCommand();
                }
            });
        }
    }

    // Add CSS for text input fallback
    function addMobileStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .voice-text-input-container {
                display: none;
                position: fixed;
                bottom: 150px;
                left: 12px;
                right: 12px;
                background: linear-gradient(135deg, rgba(30, 30, 50, 0.98), rgba(20, 20, 40, 0.98));
                border-radius: 16px;
                padding: 15px;
                z-index: 1001;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(102, 126, 234, 0.3);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
            }
            
            .voice-text-input-container.active {
                display: block;
                animation: slideUp 0.3s ease;
            }
            
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .voice-text-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                color: #fff;
                font-size: 14px;
            }
            
            .close-text-input {
                background: none;
                border: none;
                color: #fff;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
            .voice-quick-commands {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 12px;
            }
            
            .voice-text-input-row {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .voice-text-input-row input {
                flex: 1;
                padding: 12px 16px;
                border-radius: 12px;
                border: 1px solid rgba(102, 126, 234, 0.4);
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                font-size: 14px;
                outline: none;
            }
            
            .voice-text-input-row input::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }
            
            .voice-text-input-row input:focus {
                border-color: rgba(102, 126, 234, 0.8);
                background: rgba(255, 255, 255, 0.15);
            }
            
            .voice-text-input-row button {
                padding: 12px 18px;
                border-radius: 12px;
                border: none;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: #fff;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .voice-text-input-row button:active {
                transform: scale(0.95);
            }
            
            .voice-quick-commands button {
                padding: 8px 14px;
                border-radius: 20px;
                border: 1px solid rgba(102, 126, 234, 0.4);
                background: rgba(102, 126, 234, 0.2);
                color: #fff;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .voice-quick-commands button:active {
                background: rgba(102, 126, 234, 0.5);
                transform: scale(0.95);
            }
            
            /* Mobile notification */
            .mobile-voice-notice {
                position: fixed;
                bottom: 140px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 193, 7, 0.95);
                color: #000;
                padding: 10px 20px;
                border-radius: 10px;
                font-size: 13px;
                z-index: 1000;
                max-width: 90%;
                text-align: center;
                box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            }
            
            .mobile-voice-notice a {
                color: #1a0dab;
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
    }

    // Show/hide text input
    window.showTextInput = function () {
        createTextInputFallback();
        const container = document.getElementById('voiceTextInputContainer');
        if (container) {
            container.classList.add('active');
            const input = document.getElementById('voiceTextInput');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    };

    window.closeTextInput = function () {
        const container = document.getElementById('voiceTextInputContainer');
        if (container) {
            container.classList.remove('active');
        }
    };

    // Submit text command
    window.submitTextCommand = function () {
        const input = document.getElementById('voiceTextInput');
        if (!input) return;
        
        const text = input.value.trim().toLowerCase();
        if (text && typeof processVoiceCommand === 'function') {
            processVoiceCommand(text);
            input.value = '';
            closeTextInput();
        }
    };

    // Quick command buttons
    window.quickCommand = function (cmd) {
        if (typeof processVoiceCommand === 'function') {
            processVoiceCommand(cmd);
            closeTextInput();
        }
    };

    // Override voice assistant toggle for mobile
    function setupMobileSupport() {
        // Wait for original function to be defined
        const checkInterval = setInterval(() => {
            if (typeof toggleVoiceAssistant === 'function') {
                clearInterval(checkInterval);

                const originalToggle = window.toggleVoiceAssistant;

                // Add touch support for voice assistant button
                const voiceBtn = document.getElementById('voiceAssistantBtn');
                if (voiceBtn) {
                    // Remove inline onclick to prevent double firing
                    voiceBtn.removeAttribute('onclick');

                    // Add both touch and click handlers
                    let touchStarted = false;

                    voiceBtn.addEventListener('touchstart', function (e) {
                        touchStarted = true;
                        e.preventDefault();
                    }, { passive: false });

                    voiceBtn.addEventListener('touchend', function (e) {
                        if (touchStarted) {
                            touchStarted = false;
                            e.preventDefault();
                            handleVoiceToggle();
                        }
                    }, { passive: false });

                    voiceBtn.addEventListener('click', function (e) {
                        if (!touchStarted) {
                            handleVoiceToggle();
                        }
                    });
                }

                window.toggleVoiceAssistant = handleVoiceToggle;

                function handleVoiceToggle() {
                    // Check if speech recognition is supported
                    if (!isSpeechSupported) {
                        showTextInput();
                        showMobileNotice('Ovozli buyruq bu qurilmada qo\'llab-quvvatlanmaydi. Tugmalarni bosing.');
                        return;
                    }

                    // For desktop - try voice first, even on file:// (Chrome allows it)
                    if (!isMobile && !isTablet) {
                        try {
                            originalToggle();
                        } catch (e) {
                            console.error('Voice toggle error:', e);
                            showTextInput();
                            showMobileNotice('Ovozli buyruq ishlamadi. Tugmalarni bosing.');
                        }
                        return;
                    }

                    // For mobile - check secure context
                    if (!isSecureContext) {
                        showTextInput();
                        showMobileNotice('🔒 HTTPS kerak. Tugmalarni bosing yoki matn kiriting.');
                        return;
                    }

                    // Request microphone permission on mobile
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        showTextInput();
                        showMobileNotice('📱 Mikrofon API mavjud emas. Tugmalarni bosing.');
                        return;
                    }

                    navigator.mediaDevices.getUserMedia({ audio: true })
                        .then(function (stream) {
                            // Stop the stream immediately, we just need permission
                            stream.getTracks().forEach(track => track.stop());

                            try {
                                originalToggle();
                            } catch (e) {
                                console.error('Voice toggle error:', e);
                                showTextInput();
                                showMobileNotice('Ovozli buyruq ishlamadi. Tugmalarni bosing.');
                            }
                        })
                        .catch(function (err) {
                            console.error('Microphone permission denied:', err);
                            showTextInput();
                            if (err.name === 'NotAllowedError') {
                                showMobileNotice('🎤 Mikrofon ruxsati berilmadi. Tugmalarni bosing.');
                            } else if (err.name === 'NotFoundError') {
                                showMobileNotice('🎤 Mikrofon topilmadi. Tugmalarni bosing.');
                            } else {
                                showMobileNotice('🎤 Mikrofon xatosi. Tugmalarni bosing.');
                            }
                        });
                }

                console.log('Mobile voice support initialized');
            }
        }, 500);

        // Timeout after 10 seconds
        setTimeout(() => clearInterval(checkInterval), 10000);
    }

    // Show mobile notice
    function showMobileNotice(message) {
        // Remove existing notice
        const existing = document.querySelector('.mobile-voice-notice');
        if (existing) existing.remove();

        const notice = document.createElement('div');
        notice.className = 'mobile-voice-notice';
        notice.innerHTML = message;
        document.body.appendChild(notice);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notice.remove();
        }, 5000);
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        addMobileStyles();
        createTextInputFallback();
        setupMobileSupport();

        // Show warning on insecure mobile
        if (isMobile && !isSecureContext) {
            setTimeout(() => {
                showMobileNotice('Ovozli buyruq uchun <a href="https://' + location.host + location.pathname + '">HTTPS</a> kerak yoki tugmani bosib matn yozing.');
            }, 2000);
        }
    }

    console.log('Mobile Voice Assistant Support loaded');
})();

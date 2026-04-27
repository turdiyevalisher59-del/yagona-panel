// Voice Assistant Extensions - Continuous Listening Mode v3.0

// Mas'ul hodimlar va telefon raqamlari
const contactInfo = {
    mkb: {
        name: 'Akromov Shuhrat',
        phone: '+998917919999'
    },
    agro: {
        name: 'Nazarov Sarvar',
        phone: '+998936051001'
    },
    xalq: {
        name: 'Umarov Mashxurbek',
        phone: '+998500718320'
    }
};

// Xarita koordinatlari
const mapCoordinates = '41.301482,69.655787';
const mapUrl = `https://maps.google.com/maps?q=${mapCoordinates}`;

// Continuous listening mode flag
let continuousListeningMode = false;
let autoRestartTimeout = null;

// Global function to stop all playing audio
function stopAllAudio() {
    // Stop current audio if playing
    if (typeof currentAudio !== 'undefined' && currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Remove playing class from all TTS buttons
    document.querySelectorAll('.tts-btn.playing').forEach(btn => {
        btn.classList.remove('playing');
    });

    // Reset current playing button
    if (typeof currentPlayingBtn !== 'undefined') {
        currentPlayingBtn = null;
    }

    // Also stop any TTS that might be playing
    if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
    }
}

// Bank haqida to'liq ma'lumot berish funksiyasi
function playBankFullInfo(bankId) {
    const bankInfo = {
        mkb: {
            name: 'Mikrokreditbank',
            info: `Mikrokreditbank loyihasi haqida ma'lumot. 
                Jami 4 ta bino, 336 ta xonadon mavjud. 
                Sotilgan xonadonlar 90 foiz, ya'ni 302 ta. 
                Qolgan bo'sh xonadonlar 34 ta. 
                Xonadon turlari: 1 xonali 45 kvadrat metr, 2 xonali 65 kvadrat metr, 3 xonali 85 kvadrat metr. 
                Ipoteka foiz stavkasi yillik 22 foiz. 
                Boshlang'ich to'lov 15 foizdan. 
                Kredit muddati 15 yilgacha. 
                Mas'ul xodim: Akromov Shuhrat, telefon: +998917919999.`
        },
        agro: {
            name: 'Agrobank',
            info: `Agrobank loyihasi haqida ma'lumot. 
                Jami 12 ta bino, 468 ta xonadon mavjud. 
                Sotilgan xonadonlar 87 foiz, ya'ni 407 ta. 
                Qolgan bo'sh xonadonlar 61 ta. 
                Xonadon turlari: 1 xonali 42 kvadrat metr, 2 xonali 62 kvadrat metr, 3 xonali 82 kvadrat metr, 4 xonali 105 kvadrat metr. 
                Ipoteka foiz stavkasi yillik 21 foiz. 
                Boshlang'ich to'lov 20 foizdan. 
                Kredit muddati 20 yilgacha. 
                Mas'ul xodim: Nazarov Sarvar, telefon: +998936051001.`
        },
        xalq: {
            name: 'Xalq banki',
            info: `Xalq banki loyihasi haqida ma'lumot. 
                Jami 6 ta bino, 234 ta xonadon mavjud. 
                Sotilgan xonadonlar 92 foiz, ya'ni 215 ta. 
                Qolgan bo'sh xonadonlar 19 ta. 
                Xonadon turlari: 1 xonali 48 kvadrat metr, 2 xonali 68 kvadrat metr, 3 xonali 90 kvadrat metr. 
                Ipoteka foiz stavkasi yillik 20 foiz. 
                Boshlang'ich to'lov 10 foizdan. 
                Kredit muddati 25 yilgacha. 
                Mas'ul xodim: Umarov Mashxurbek, telefon: +998500718320.`
        }
    };

    if (bankInfo[bankId]) {
        showVoiceStatus(bankInfo[bankId].name + ' ma\'lumoti', 'Tinglang...');
        speakResponse(bankInfo[bankId].info);
    }
}

// Telefon qilish funksiyasi
function makePhoneCall(phoneNumber) {
    window.location.href = `tel:${phoneNumber}`;
}

// Xaritani ochish funksiyasi
function openMap() {
    window.open(mapUrl, '_blank');
}

// Sayt haqida umumiy ma'lumot olish
function getSiteGeneralInfo() {
    // Try to get stats from the page
    let buildings = '22';
    let apartments = '1038';
    let soldPercent = '89';

    // Try to extract from stats elements
    const statElements = document.querySelectorAll('.stat-value, .hero-stat-value');
    if (statElements.length >= 3) {
        buildings = statElements[0]?.textContent?.trim() || buildings;
        apartments = statElements[1]?.textContent?.trim() || apartments;
        soldPercent = statElements[2]?.textContent?.replace('%', '').trim() || soldPercent;
    }

    // Get bank info if on bank page
    let bankInfo = '';
    const bankTitle = document.querySelector('.bank-detail-title, .bank-name');
    if (bankTitle) {
        const bankName = bankTitle.textContent.trim();
        bankInfo = ` Hozir siz ${bankName} sahifasidasiz.`;
    }

    // Calculate remaining apartments
    const totalApts = parseInt(apartments) || 1038;
    const soldPct = parseInt(soldPercent) || 89;
    const soldCount = Math.round(totalApts * soldPct / 100);
    const remainingCount = totalApts - soldCount;

    const info = `Soy Bo'yi loyihasi - Parkentsoy kanalining bo'yida joylashgan zamonaviy turar-joy majmuasi. ` +
        `Jami ${buildings} ta bino va ${apartments} ta xonadon mavjud. ` +
        `Sotilgan xonadonlar: ${soldPct} foiz, ya'ni ${soldCount} ta. ` +
        `Qolgan bo'sh xonadonlar: ${remainingCount} ta.${bankInfo} ` +
        `Batafsil ma'lumot uchun bank sahifalarini ochishingiz mumkin.`;

    return info;
}

// Joriy sahifa uchun PDF yuklash
function downloadCurrentPDF() {
    // Check which bank page is active
    let bankId = null;

    const mkbDetail = document.getElementById('mkb-detail');
    const agroDetail = document.getElementById('agro-detail');
    const xalqDetail = document.getElementById('xalq-detail');

    if (mkbDetail && (mkbDetail.classList.contains('active') ||
        mkbDetail.offsetParent !== null)) {
        bankId = 'mkb';
    } else if (agroDetail && (agroDetail.classList.contains('active') ||
        agroDetail.offsetParent !== null)) {
        bankId = 'agro';
    } else if (xalqDetail && (xalqDetail.classList.contains('active') ||
        xalqDetail.offsetParent !== null)) {
        bankId = 'xalq';
    }

    // Try to call downloadPDF function if it exists
    if (bankId && typeof downloadPDF === 'function') {
        downloadPDF(bankId);
    } else if (typeof downloadPDF === 'function') {
        // Default to mkb
        downloadPDF('mkb');
    } else {
        // Alternative: look for print button and click it
        const printBtn = document.querySelector('.print-btn, [onclick*="downloadPDF"]');
        if (printBtn) {
            printBtn.click();
        } else {
            // Fallback: use browser print
            window.print();
        }
    }
}

// Auto-restart listening after response
function autoRestartListening() {
    if (continuousListeningMode) {
        // Clear any existing timeout
        if (autoRestartTimeout) {
            clearTimeout(autoRestartTimeout);
        }

        // Wait for TTS to finish, then restart listening
        autoRestartTimeout = setTimeout(() => {
            if (continuousListeningMode && !isListening) {
                try {
                    if (recognition) {
                        recognition.start();
                    }
                } catch (e) {
                    console.log('Auto-restart listening:', e.message);
                }
            }
        }, 2000); // Wait 2 seconds after response
    }
}

// Start continuous listening mode
function startContinuousListening() {
    continuousListeningMode = true;
    if (!isListening) {
        try {
            if (recognition) {
                recognition.start();
            }
        } catch (e) {
            console.log('Start continuous listening:', e.message);
        }
    }
    console.log('Continuous listening mode: ON');
}

// Stop continuous listening mode
function stopContinuousListening() {
    continuousListeningMode = false;
    if (autoRestartTimeout) {
        clearTimeout(autoRestartTimeout);
        autoRestartTimeout = null;
    }
    console.log('Continuous listening mode: OFF');
}

// Override recognition.onend to auto-restart in continuous mode
(function () {
    // Wait for recognition to be initialized
    const checkRecognition = setInterval(() => {
        if (typeof recognition !== 'undefined' && recognition) {
            clearInterval(checkRecognition);

            const originalOnEnd = recognition.onend;
            recognition.onend = function () {
                if (originalOnEnd) {
                    originalOnEnd.call(this);
                }

                // Auto-restart if in continuous mode
                if (continuousListeningMode) {
                    autoRestartListening();
                }
            };

            console.log('Continuous listening mode initialized');
        }
    }, 500);
})();

// Extended voice command processor
(function () {
    // Store original processVoiceCommand
    const originalProcessVoiceCommand = window.processVoiceCommand;

    // Override with extended version
    window.processVoiceCommand = function (text) {
        showVoiceStatus('Tushunildi:', text);

        // Normalize text
        const cmd = text.toLowerCase()
            .replace(/микро/g, 'mikro')
            .replace(/кредит/g, 'kredit')
            .replace(/агро/g, 'agro')
            .replace(/халқ/g, 'xalq')
            .replace(/халк/g, 'xalq')
            .replace(/банк/g, 'bank')
            .replace(/банки/g, 'banki')
            .replace(/шухрат/g, 'shuhrat')
            .replace(/акромов/g, 'akromov')
            .replace(/сарвар/g, 'sarvar')
            .replace(/назаров/g, 'nazarov')
            .replace(/машхурбек/g, 'mashxurbek')
            .replace(/умаров/g, 'umarov')
            .replace(/ўчир/g, 'o\'chir')
            .replace(/очир/g, 'o\'chir');

        setTimeout(() => {
            // "Ovozni o'chir" - Stop audio command
            if ((cmd.includes('ovoz') || cmd.includes('audio') || cmd.includes('звук')) &&
                (cmd.includes('o\'chir') || cmd.includes('off') || cmd.includes('выключ'))) {
                stopAllAudio();
                speakResponse('Ovoz o\'chirildi');
                hideVoiceStatus();
                autoRestartListening();
                return;
            }

            // "Shu yerdamisan" - Activate continuous listening mode
            if (cmd.includes('shu yerda') || cmd.includes('yerdamisan') || cmd.includes('bormi') ||
                cmd.includes('здесь') || cmd.includes('тингла') || cmd.includes('eshitya') ||
                cmd.includes('ishlamoqda') || cmd.includes('active') || cmd.includes('salom') ||
                cmd.includes('привет') || cmd.includes('hello')) {

                // Start continuous listening mode
                startContinuousListening();

                speakResponse('Ha, men shu yerdaman va sizni tinglamoqdaman! Buyruqlaringizni bering.');
                hideVoiceStatus();
                autoRestartListening();
                return;
            }

            // "Uxla" / "Dam ol" - Stop continuous listening
            if (cmd.includes('uxla') || cmd.includes('dam ol') || cmd.includes('to\'xta tingla') ||
                cmd.includes('спать') || cmd.includes('sleep') || cmd.includes('off')) {
                stopContinuousListening();
                stopListening();
                speakResponse('Xayr, kerak bo\'lganda mikrofon tugmasini bosing');
                hideVoiceStatus();
                return;
            }

            // "Umumiy ma'lumot" - Give general info about the site
            if (cmd.includes('umumiy') || cmd.includes('malumot') || cmd.includes('ma\'lumot') ||
                cmd.includes('tahlil') || cmd.includes('statistika') || cmd.includes('общая') ||
                cmd.includes('информация') || cmd.includes('info') || cmd.includes('about')) {

                // Analyze site data
                let generalInfo = getSiteGeneralInfo();
                speakResponse(generalInfo);
                hideVoiceStatus();
                autoRestartListening();
                return;
            }

            // "PDF yukla" - Download PDF
            if ((cmd.includes('pdf') || cmd.includes('пдф') || cmd.includes('hisobot') ||
                cmd.includes('отчет') || cmd.includes('report')) &&
                (cmd.includes('yukla') || cmd.includes('скачай') || cmd.includes('download') ||
                    cmd.includes('olish') || cmd.includes('chiqar') || cmd.includes('выгрузи'))) {

                downloadCurrentPDF();
                speakResponse('PDF fayl yuklanmoqda');
                hideVoiceStatus();
                autoRestartListening();
                return;
            }

            // Map/Xarita commands
            if (cmd.includes('xarita') || cmd.includes('map') || cmd.includes('joylashuv') ||
                cmd.includes('lokatsiya') || cmd.includes('карта') || cmd.includes('manzil') ||
                cmd.includes('qayer') || cmd.includes('qayerda') || cmd.includes('харита')) {
                openMap();
                speakResponse('Xarita ochilmoqda');
                hideVoiceStatus();
                autoRestartListening();
                return;
            }

            // Telephone/Call commands - by name
            // Shuhrat / Akromov (MKB)
            if ((cmd.includes('shuhrat') || cmd.includes('akromov')) &&
                (cmd.includes('telefon') || cmd.includes('qil') || cmd.includes('qong\'iroq') || cmd.includes('call') || cmd.includes('звонок'))) {
                makePhoneCall(contactInfo.mkb.phone);
                speakResponse('Akromov Shuhratga qo\'ng\'iroq qilinmoqda');
                hideVoiceStatus();
                return;
            }

            // Sarvar / Nazarov (Agro)
            if ((cmd.includes('sarvar') || cmd.includes('nazarov')) &&
                (cmd.includes('telefon') || cmd.includes('qil') || cmd.includes('qong\'iroq') || cmd.includes('call') || cmd.includes('звонок'))) {
                makePhoneCall(contactInfo.agro.phone);
                speakResponse('Nazarov Sarvarga qo\'ng\'iroq qilinmoqda');
                hideVoiceStatus();
                return;
            }

            // Mashxurbek / Umarov (Xalq)
            if ((cmd.includes('mashxurbek') || cmd.includes('umarov')) &&
                (cmd.includes('telefon') || cmd.includes('qil') || cmd.includes('qong\'iroq') || cmd.includes('call') || cmd.includes('звонок'))) {
                makePhoneCall(contactInfo.xalq.phone);
                speakResponse('Umarov Mashxurbekka qo\'ng\'iroq qilinmoqda');
                hideVoiceStatus();
                return;
            }

            // Generic "telefon qil" - call current bank's contact
            if ((cmd.includes('telefon') || cmd.includes('qong\'iroq') || cmd.includes('call') || cmd.includes('звонок')) &&
                (cmd.includes('qil') || cmd.includes('bog\'la') || cmd.includes('сделай'))) {
                let bankId = null;

                // Check which bank detail is currently visible
                const mkbDetail = document.getElementById('mkb-detail');
                const agroDetail = document.getElementById('agro-detail');
                const xalqDetail = document.getElementById('xalq-detail');

                // Check by classList.contains('active') or display:block or offsetParent
                if (mkbDetail && (mkbDetail.classList.contains('active') ||
                    mkbDetail.style.display === 'block' ||
                    (mkbDetail.offsetParent !== null && mkbDetail.offsetHeight > 0))) {
                    bankId = 'mkb';
                } else if (agroDetail && (agroDetail.classList.contains('active') ||
                    agroDetail.style.display === 'block' ||
                    (agroDetail.offsetParent !== null && agroDetail.offsetHeight > 0))) {
                    bankId = 'agro';
                } else if (xalqDetail && (xalqDetail.classList.contains('active') ||
                    xalqDetail.style.display === 'block' ||
                    (xalqDetail.offsetParent !== null && xalqDetail.offsetHeight > 0))) {
                    bankId = 'xalq';
                }

                // Alternative check - look for visible bank sections based on text content
                if (!bankId) {
                    const visibleBankName = document.querySelector('.bank-detail-section:not([style*="display: none"]) .bank-detail-title');
                    if (visibleBankName) {
                        const name = visibleBankName.textContent.toLowerCase();
                        if (name.includes('mikro')) bankId = 'mkb';
                        else if (name.includes('agro')) bankId = 'agro';
                        else if (name.includes('xalq')) bankId = 'xalq';
                    }
                }

                if (bankId && contactInfo[bankId]) {
                    makePhoneCall(contactInfo[bankId].phone);
                    speakResponse(contactInfo[bankId].name + 'ga qo\'ng\'iroq qilinmoqda');
                } else {
                    // If no bank detected, just call default (MKB)
                    makePhoneCall(contactInfo.mkb.phone);
                    speakResponse('Akromov Shuhratga qo\'ng\'iroq qilinmoqda');
                }
                hideVoiceStatus();
                return;
            }

            // Ob-havo (Weather) commands
            if (cmd.includes('ob havo') || cmd.includes('havo') || cmd.includes('temperatura') || 
                cmd.includes('harorat') || cmd.includes('погода') || cmd.includes('sovuq') || 
                cmd.includes('issiq') || cmd.includes('weather') || cmd.includes('climat')) {
                if (typeof showWeatherInfo === 'function') {
                    showWeatherInfo();
                } else {
                    speakResponse('Ob-havo funksiyasi mavjud emas');
                }
                autoRestartListening();
                return;
            }

            // Stop audio before any navigation
            stopAllAudio();

            // Navigation commands - open page AND read info
            if (cmd.includes('mikro') || cmd.includes('мкб') || cmd.includes('mkb')) {
                navigateToBank('mkb');
                playBankFullInfo('mkb');
                autoRestartListening();
            }
            else if (cmd.includes('agro')) {
                navigateToBank('agro');
                playBankFullInfo('agro');
                autoRestartListening();
            }
            else if (cmd.includes('xalq') || cmd.includes('халқ')) {
                navigateToBank('xalq');
                playBankFullInfo('xalq');
                autoRestartListening();
            }
            else if (cmd.includes('asosiy') || cmd.includes('bosh') || cmd.includes('qayt') || cmd.includes('orqaga') || cmd.includes('главн') || cmd.includes('назад')) {
                goToMainPage();
                speakResponse('Asosiy sahifaga qaytildi');
                autoRestartListening();
            }
            // Card audio commands
            else if (cmd.includes('moliya') || cmd.includes('молия') || cmd.includes('финанс')) {
                playCurrentBankAudio('finance');
                autoRestartListening();
            }
            else if (cmd.includes('mas\'ul') || cmd.includes('masul') || cmd.includes('ходим') || cmd.includes('raqam') || cmd.includes('номер')) {
                playCurrentBankAudio('contact');
                autoRestartListening();
            }
            else if (cmd.includes('kredit') || cmd.includes('кредит') || cmd.includes('shart')) {
                playCurrentBankAudio('credit');
                autoRestartListening();
            }
            else if (cmd.includes('ipoteka') || cmd.includes('ипотека') || cmd.includes('narx') || cmd.includes('narh')) {
                playCurrentBankAudio('ipotekaPrice');
                autoRestartListening();
            }
            else if (cmd.includes('xonadon') || cmd.includes('хонадон') || cmd.includes('kvartira') || cmd.includes('turi')) {
                playCurrentBankAudio('apartments');
                autoRestartListening();
            }
            else if (cmd.includes('pudrat') || cmd.includes('пудрат') || cmd.includes('tashkilot') || cmd.includes('qurilish')) {
                playCurrentBankAudio('contractor');
                autoRestartListening();
            }
            else if (cmd.includes('sotish') || cmd.includes('сотиш') || cmd.includes('statistika') || cmd.includes('статистика') || cmd.includes('sotuv') || cmd.includes('сотув')) {
                playCurrentBankAudio('stats');
                autoRestartListening();
            }
            // Stop current audio command
            else if (cmd.includes('to\'xta') || cmd.includes('stop') || cmd.includes('стоп') || cmd.includes('bas')) {
                stopAllAudio();
                speakResponse('Audio to\'xtatildi');
                autoRestartListening();
            }
            // Help command
            else if (cmd.includes('yordam') || cmd.includes('help') || cmd.includes('помощь') || cmd.includes('nima qila')) {
                speakResponse('Men bank sahifalarini ochish, xaritani ko\'rsatish, telefon qilish va audio eshittirish buyruqlarini bajaraman. Ovozni o\'chirish uchun ovozni o\'chir deb ayting.');
                autoRestartListening();
            }
            else {
                speakResponse('Buyruq tushunilmadi. Qaytadan ayting.');
                autoRestartListening();
            }

            hideVoiceStatus();
        }, 1000);
    };
})();

// Override showBankDetail to stop audio when switching
(function () {
    const originalShowBankDetail = window.showBankDetail;
    if (originalShowBankDetail) {
        window.showBankDetail = function (bank) {
            stopAllAudio();
            originalShowBankDetail(bank);
        };
    }
})();

// Override showDashboard to stop audio when going to main
(function () {
    const originalShowDashboard = window.showDashboard;
    if (originalShowDashboard) {
        window.showDashboard = function () {
            stopAllAudio();
            originalShowDashboard();
        };
    }
})();

// Override navigateToBank to stop audio
(function () {
    const originalNavigateToBank = window.navigateToBank;
    if (originalNavigateToBank) {
        window.navigateToBank = function (bankId) {
            stopAllAudio();
            originalNavigateToBank(bankId);
        };
    }
})();

// Override goToMainPage to stop audio
(function () {
    const originalGoToMainPage = window.goToMainPage;
    if (originalGoToMainPage) {
        window.goToMainPage = function () {
            stopAllAudio();
            originalGoToMainPage();
        };
    }
})();

console.log('Voice Assistant Extensions v3.1 loaded!');
console.log('Buyruqlar: MKB/Agro/Xalq (bank ma\'lumoti), havo (ob-havo), ovozni o\'chir, yordam');

// Share functionality - Telegram, Email, WhatsApp

// Share configuration
const shareConfig = {
    title: 'Сой бўйи - Паркентсой Лойиҳаси',
    description: 'Паркентсой каналининг сой бўйида замонавий турар-жой мажмуаси. 22 та бино, 1038 та хонадон, 89% сотилган.',
    url: window.location.href,
    phone: '+998917919999' // Default contact number
};

// Create share button HTML
function createShareButton() {
    const shareContainer = document.createElement('div');
    shareContainer.className = 'share-container';
    shareContainer.innerHTML = `
        <button class="share-main-btn" onclick="toggleShareMenu()" title="Ulashish">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
        </button>
        <div class="share-menu" id="shareMenu">
            <button class="share-btn telegram" onclick="shareToTelegram()" title="Telegram">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
            </button>
            <button class="share-btn whatsapp" onclick="shareToWhatsApp()" title="WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
            </button>
            <button class="share-btn email" onclick="shareToEmail()" title="Email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
            </button>
            <button class="share-btn pdf" onclick="sharePDF()" title="PDF yuklab olish">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 14h.75v3h-.75v-3zm1.5 0h1.5c.83 0 1.5.67 1.5 1.5S12.33 17 11.5 17h-.75v-1h.75c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-.75V14zm3.5 0h1.5c.83 0 1.5.67 1.5 1.5 0 .37-.14.71-.36.97l.86 1.03h-1l-.64-.78c-.12.01-.24.03-.36.03H13.5v-2.75h-.5V14h.5z"/>
                </svg>
            </button>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .share-container {
            position: fixed;
            bottom: 180px;
            right: 20px;
            z-index: 999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        .share-main-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
        }
        
        .share-main-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        
        .share-main-btn svg {
            width: 24px;
            height: 24px;
            color: white;
        }
        
        .share-menu {
            display: none;
            flex-direction: column;
            gap: 10px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .share-menu.active {
            display: flex;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .share-btn {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .share-btn svg {
            width: 22px;
            height: 22px;
        }
        
        .share-btn.telegram {
            background: #0088cc;
            color: white;
        }
        
        .share-btn.telegram:hover {
            background: #006699;
            transform: scale(1.1);
        }
        
        .share-btn.whatsapp {
            background: #25d366;
            color: white;
        }
        
        .share-btn.whatsapp:hover {
            background: #1da851;
            transform: scale(1.1);
        }
        
        .share-btn.email {
            background: linear-gradient(135deg, #ea4335 0%, #fbbc05 100%);
            color: white;
        }
        
        .share-btn.email:hover {
            transform: scale(1.1);
        }
        
        .share-btn.pdf {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
        }
        
        .share-btn.pdf:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
        }
        
        @media (max-width: 768px) {
            .share-container {
                bottom: 230px;
                right: 15px;
            }
            
            .share-main-btn {
                width: 45px;
                height: 45px;
            }
            
            .share-btn {
                width: 40px;
                height: 40px;
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(shareContainer);
}

// Toggle share menu
function toggleShareMenu() {
    const menu = document.getElementById('shareMenu');
    menu.classList.toggle('active');
}

// Share to Telegram
function shareToTelegram() {
    const text = encodeURIComponent(`${shareConfig.title}\n\n${shareConfig.description}\n\n${shareConfig.url}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareConfig.url)}&text=${text}`, '_blank');
    toggleShareMenu();
}

// Share to WhatsApp
function shareToWhatsApp() {
    const text = encodeURIComponent(`${shareConfig.title}\n\n${shareConfig.description}\n\n${shareConfig.url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toggleShareMenu();
}

// Share to Email
function shareToEmail() {
    const subject = encodeURIComponent(shareConfig.title);
    const body = encodeURIComponent(`${shareConfig.description}\n\nSayt: ${shareConfig.url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toggleShareMenu();
}

// Share/Download PDF
function sharePDF() {
    toggleShareMenu();

    // Check which bank page is active
    let bankId = null;
    let bankName = 'Soy Boyi';

    const mkbDetail = document.getElementById('mkb-detail');
    const agroDetail = document.getElementById('agro-detail');
    const xalqDetail = document.getElementById('xalq-detail');

    if (mkbDetail && (mkbDetail.classList.contains('active') || mkbDetail.offsetParent !== null)) {
        bankId = 'mkb';
        bankName = 'Mikrokreditbank';
    } else if (agroDetail && (agroDetail.classList.contains('active') || agroDetail.offsetParent !== null)) {
        bankId = 'agro';
        bankName = 'Agrobank';
    } else if (xalqDetail && (xalqDetail.classList.contains('active') || xalqDetail.offsetParent !== null)) {
        bankId = 'xalq';
        bankName = 'Xalq Banki';
    }

    // If downloadPDF function exists (from the main page), use it
    if (bankId && typeof downloadPDF === 'function') {
        downloadPDF(bankId);
        showPDFNotification(`${bankName} hisoboti yuklanmoqda...`);
    } else {
        // Fallback: Generate and download page as PDF using print
        generatePagePDF(bankName);
    }
}

// Generate PDF from current page
function generatePagePDF(title) {
    showPDFNotification('PDF tayyorlanmoqda...');

    // Create a printable version
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        showPDFNotification('Pop-up bloklangan. Iltimos, ruxsat bering.', true);
        return;
    }

    // Get the main content
    let content = '';
    const bankDetail = document.querySelector('.bank-detail-section:not([style*="display: none"])');

    if (bankDetail) {
        content = bankDetail.innerHTML;
    } else {
        // Get hero and stats
        const hero = document.querySelector('.hero');
        const dashboard = document.querySelector('.dashboard');
        content = (hero ? hero.innerHTML : '') + (dashboard ? dashboard.innerHTML : '');
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title} - Soy Bo'yi Hisoboti</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                    color: #333;
                }
                h1, h2, h3 {
                    color: #1a1a2e;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #667eea;
                    margin-bottom: 5px;
                }
                .info-card {
                    background: #f8f9fa;
                    border-radius: 10px;
                    padding: 15px;
                    margin-bottom: 15px;
                    border-left: 4px solid #667eea;
                }
                .info-card h4 {
                    margin: 0 0 10px 0;
                    color: #1a1a2e;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
                .tts-btn, .voice-assistant-btn, .share-container, button {
                    display: none !important;
                }
                img {
                    max-width: 100%;
                    height: auto;
                }
                @media print {
                    body { padding: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏠 Soy Bo'yi</h1>
                <p>Parkentsoy kanali bo'yida zamonaviy turar-joy majmuasi</p>
                <p><strong>${title}</strong></p>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>Yaratilgan: ${new Date().toLocaleDateString('uz-UZ')}</p>
                <p>Sayt: ${window.location.href}</p>
                <p>Aloqa: +998 91 791 9999</p>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                }
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Show PDF notification
function showPDFNotification(message, isError = false) {
    // Remove existing notification
    const existing = document.querySelector('.pdf-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'pdf-notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isError ? '#e74c3c' : '#27ae60'};
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Close share menu when clicking outside
document.addEventListener('click', function (e) {
    const shareContainer = document.querySelector('.share-container');
    const menu = document.getElementById('shareMenu');
    if (shareContainer && menu && !shareContainer.contains(e.target)) {
        menu.classList.remove('active');
    }
});

// Initialize share button on page load
document.addEventListener('DOMContentLoaded', createShareButton);

// If DOM already loaded, create button immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(createShareButton, 100);
}

console.log('Share functionality loaded! Telegram, WhatsApp, Email');

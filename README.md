# MB Dashboard v41

## 🏛️ Markaziy Bank Toshkent viloyati Bosh boshqarmasi Dashboard

**Versiya:** 41  
**Yangilangan:** 2025-02-28  
**Yangilanish turi:** Bo'lim boshliqlari ismlari yangilandi + yangi dashboardlar qo'shildi

---

## 📁 To'liq papka strukturasi

```
mb-dashboard-v41/
│
├── index.html                          # Asosiy dashboard
├── admin.html                          # Admin panel
├── README.md                           # Hujjatlar
│
├── J.X.Fayzullaxo'jayev yo'nalishi/
│   │
│   ├── Bank xizmatlari iste'molchilarining.../
│   │   ├── scoring_banking.html
│   │   ├── sirli_mijoz_final.html
│   │   └── angren-xarita-mediapipe-gesture.html  ← YANGI
│   │
│   ├── Ijro apparati/
│   │   ├── index.html
│   │   ├── murojatlar_dashboard.html
│   │   └── мурожаатлар йиллик.xlsx
│   │
│   └── Komplaens Nazorati/              ← YANGI PAPKA
│       └── corruption-monitoring.html   ← YANGI
│
├── B.F.Nuraliyev yo'nalishi/
│   │
│   ├── Kredit tashkilotlarida moliyaviy monitoring.../
│   │   ├── index.html
│   │   ├── export import/
│   │   │   └── valyuta_dashboard.html
│   │   └── Valyuta XPU/
│   │       ├── valyuta_hpu.html
│   │       └── жами 2024-25 ишлашга ваш.xlsx
│   │
│   ├── Kredit tashkilotlarini inspeksiya qilish.../
│   │
│   └── Kredit tashkilotlarining muammoli aktivlari.../
│       ├── NPL_Risk_Rating_100.html
│       ├── npl_risk_system_v11_full_edit.html
│       └── saytga yuklash/
│           ├── npl_tizimi.html
│           └── [50+ JSON/JS/Python fayllar]
│
├── I.R.Irgashev yo'nalishi/
│   │
│   ├── Hududlarni ijtimoiy-iqtisodiy rivojlantirish.../
│   │   └── parkentsoy/
│   │       ├── parkentsoy_voice.html
│   │       ├── VOICE_ASSISTANT_README.html
│   │       └── images/
│   │
│   └── Tadbirkorlikni qo'llab-quvvatlash.../
│       ├── index.html
│       ├── eng_ohiri_dasturlar_2_lotin.xlsx
│       ├── banklar tahlili/
│       │   ├── banklar_tahlili.html
│       │   └── +++Банклар_2025_й_Рейтинг.xlsx
│       └── mahallalar tahlili dastur bo'yicha/
│           ├── kredit_dashboard_v17_mahalla_count.html
│           └── ++++энг охири дастурлар.xlsx
│
├── A.A.Jurayev yo'nalishi/
│   │
│   ├── Naqd pul muomalasini tashkil etish.../
│   │   ├── naqd_pullar.html
│   │   ├── Dastur_uchun.xlsx
│   │   └── Dasturlar_monitoring.xlsx
│   │
│   ├── To'lov tizimlari infratuzilmalari.../
│   │
│   ├── Buxgalteriya hisobi.../
│   │   ├── buxgalteriya_dashboard.html
│   │   ├── buxgalteriya_tahlil.html     ← YANGI
│   │   └── umumiy_jadval.xlsx           ← YANGI
│   │
│   └── Narxlar va iqtisodiy kutilmalarni.../
│
├── _data/
│   ├── dashboard_data.json              # Asosiy ma'lumotlar (v41)
│   ├── banklar_reyting.xlsx
│   ├── eng_ohiri_dasturlar.xlsx
│   ├── eng_ohiri_mahalla.xlsx
│   ├── export_import_slayd.xls
│   ├── murojatlar_yillik.xlsx
│   ├── umumiy_jadval.xlsx               ← YANGI
│   └── valyuta_xpu_jami.xlsx
│
└── api/
    └── [serverless functions]
```

---

## 👥 Yangilangan Bo'lim Boshliqlari

### ✅ 6 ta ism yangilandi:

| № | Bo'lim | YANGI Boshlig'i |
|---|--------|-----------------|
| 1 | Moliyaviy monitoring va valyuta nazorati | **Matboboev Utkirjon Rustamovich** |
| 2 | Inspeksiya qilish boshqarmasi | **Yusupov Murod Abduraxmanovich** |
| 3 | Muammoli aktivlar va moliyaviy tahlil | **Tangirov Xasan Davlatboevich** |
| 4 | Hududlarni rivojlantirish monitoring | **Tursunov Normumin Abduxamidovich** |
| 5 | Tadbirkorlik va aholi bandligi | **Karshibaev Ulugbek Baxodir o'g'li** |
| 6 | Naqd pul muomalasi boshqarmasi | **Sobirov Sobitxon Saidburxon o'g'li** |

### ✅ O'zgarishsiz qolgan ismlar:

| № | Bo'lim | Boshlig'i |
|---|--------|-----------|
| 1 | Bank xizmatlari | Nishanaliev Islombek Valisherovich |
| 2 | Ijro apparati | Axatjanov Abduraxmon Kudratillaevich |
| 3 | Komplaens Nazorati | Turdiyev A.T |
| 4 | To'lov tizimlari va IT | Umarov Mirzoxid Mirxilolovich |
| 5 | Buxgalteriya hisobi | Karimov Alisher Saydumarovich |
| 6 | Narxlar va iqtisodiy kutilmalar | Shomirov Abdulaziz Abdurashidovich |

---

## 📊 Dashboardlar ro'yxati (18 ta)

| № | Dashboard nomi | Bo'lim | Fayl |
|---|----------------|--------|------|
| 1 | Scoring Banking | Bank xizmatlari | scoring_banking.html |
| 2 | Sirli mijoz tahlili | Bank xizmatlari | sirli_mijoz_final.html |
| 3 | Angren xaritasi | Bank xizmatlari | angren-xarita-mediapipe-gesture.html |
| 4 | Ijro nazorati | Ijro apparati | index.html |
| 5 | Murojatlar dashboard | Ijro apparati | murojatlar_dashboard.html |
| 6 | Korrupsiya Monitoring | Komplaens | corruption-monitoring.html |
| 7 | Valyuta monitoringi | Moliyaviy monitoring | index.html |
| 8 | Eksport-Import | Moliyaviy monitoring | valyuta_dashboard.html |
| 9 | Valyuta XPU | Moliyaviy monitoring | valyuta_hpu.html |
| 10 | NPL Risk Rating | Muammoli aktivlar | NPL_Risk_Rating_100.html |
| 11 | NPL Risk tizimi | Muammoli aktivlar | npl_risk_system_v11_full_edit.html |
| 12 | NPL Tizimi (sayt) | Muammoli aktivlar | npl_tizimi.html |
| 13 | Parkentsoy Voice | Hududlarni rivojlantirish | parkentsoy_voice.html |
| 14 | Tadbirkorlik monitoring | Tadbirkorlik | index.html |
| 15 | Banklar tahlili | Tadbirkorlik | banklar_tahlili.html |
| 16 | Mahallalar tahlili | Tadbirkorlik | kredit_dashboard_v17_mahalla_count.html |
| 17 | Naqd pullar | Naqd pul muomalasi | naqd_pullar.html |
| 18 | Buxgalteriya Tahlili | Buxgalteriya | buxgalteriya_tahlil.html |

---

## 🚀 GitHub yuklash

```bash
# 1. ZIP ni ochish
unzip mb-dashboard-v41.zip
cd mb-dashboard-v41

# 2. Git repo ga yuklash
git add .
git commit -m "v41: Bo'lim boshliqlari yangilandi + 4 ta yangi fayl"
git push origin main
```

---

## 📝 v41 yangiliklari

- ✅ 6 ta bo'lim boshlig'i ismlari yangilandi
- ✅ 4 ta yangi fayl qo'shildi:
  - angren-xarita-mediapipe-gesture.html
  - corruption-monitoring.html
  - buxgalteriya_tahlil.html
  - umumiy_jadval.xlsx
- ✅ Komplaens Nazorati papkasi yaratildi
- ✅ JSON ma'lumotlari yangilandi

---

© 2025 Markaziy Bank Toshkent viloyati Bosh boshqarmasi

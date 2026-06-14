<p align="center">
  <img src="netflix-pin.png?v=2" alt="Netflix PIN" width="96" height="96" style="border-radius: 20px;">
</p>

# 🔐 Netflix PIN Auto-Fill

> **Created by: REVERSE**

> Chrome Extension สำหรับลอง PIN บนหน้า Netflix โดยอัตโนมัติ  
> ทำงานผ่าน **Chrome Side Panel** — ดีไซน์สวยงาม ใช้ง่าย ไม่เกะกะ

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0-e50914?style=flat-square" alt="version">
  <img src="https://img.shields.io/badge/manifest-v3-blue?style=flat-square" alt="manifest">
  <img src="https://img.shields.io/badge/platform-Chrome%20%7C%20Edge-brightgreen?style=flat-square" alt="platform">
  <img src="https://img.shields.io/badge/react-compatible-61dafb?style=flat-square" alt="react">
</p>

---

## ✨ ฟีเจอร์

| หมวด | รายละเอียด |
|------|------------|
| 🔢 **Auto-Fill** | ลอง PIN ตั้งแต่ `0000` ถึง `9999` แบบอัตโนมัติ |
| ⬆️⬇️ **ลำดับ** | เลือกลองจากน้อย→มาก หรือ มาก→น้อย |
| ⏱️ **Delay** | ปรับเวลาหน่วงระหว่างกดแต่ละปุ่ม (`keyDelay`) และระหว่างแต่ละรหัส (`codeDelay`) |
| ⌨️ **Auto-Submit** | กด Enter ส่ง PIN อัตโนมัติหลังพิมพ์เสร็จ |
| 🔁 **Resume** | กดหยุด → จำ PIN ล่าสุดไว้ → กดเริ่มต่อจากจุดเดิม |
| 📊 **สถานะ** | แสดงสถานะ (เขียว=พร้อม, น้ำเงิน=กำลังรัน, แดง=หยุด) และ PIN ล่าสุดแบบ 4 หลัก |
| 📋 **แพ็กเกจ** | ดึงข้อมูลแพ็กเกจจากหน้า Account — แสดงสีตามระดับ (ทอง=Premium, ฟ้า=Standard, ส้ม=Standard Ads, เขียว=Basic, ม่วง=Mobile) |
| 📝 **บันทึก** | Log แสดง PIN ที่กำลังทดลอง, เจอ, ผิด — เปิด/ปิดได้ |
| 🌐 **Browse** | ปุ่มไปหน้า `netflix.com/browse` ทันที |
| 🎨 **Dark UI** | ดีไซน์สไตล์ Netflix — ปุ่มสี Gradient, Glow effects, Pulse animation |
| ⚡ **React Compat** | รองรับ Netflix ที่ใช้ React ด้วย Native Value Setter |
| 📱 **Compact** | UI พอดี 600px — ตั้งค่า + สถานะ + Log ในหน้าเดียว ไม่มี Scrollbar ภายนอก |

---

## 📥 ติดตั้ง

```bash
# 1. Clone โปรเจกต์
git clone https://github.com/rxvxrsx/netflix-pin-check.git

# 2. เปิด Chrome → chrome://extensions
# 3. เปิด Developer mode (มุมขวาบน)
# 4. กด Load unpacked → เลือกโฟลเดอร์โปรเจกต์
# 5. คลิกไอคอน Extension เพื่อเปิด Side Panel
```

---

## 🚀 วิธีใช้

### 🎛️ ตั้งค่า

| ตัวเลือก | คำอธิบาย | ค่าเริ่มต้น | ค่าต่ำสุด |
|----------|----------|:---:|:---:|
| **PIN เริ่มต้น** | หมายเลข PIN ที่จะเริ่มลอง (อัปเดตอัตโนมัติเมื่อกดหยุด) | `0` | 0 |
| **ลำดับ** | น้อย→มาก หรือ มาก→น้อย | น้อย→มาก | — |
| **หน่วงปุ่ม (ms)** | เวลาระหว่างกดแต่ละตัวเลข | `80` | 10 |
| **หน่วงรหัส (ms)** | เวลารอหลังกรอก PIN ก่อนเช็คผล | `120` | 30 |

### ▶️ ปุ่มควบคุม

| ปุ่ม | สี | การทำงาน |
|-----|-----|----------|
| **▶ ทำงานต่อ** | 🟢 เขียว | เริ่ม/ทำงานต่อจาก PIN ปัจจุบัน (ที่หยุดไว้) |
| **⏹ หยุด** | 🔴 แดง | หยุด + บันทึก PIN ล่าสุดลงช่อง PIN เริ่มต้นอัตโนมัติ |
| **💾 บันทึกค่า** | 🔵 ฟ้า | บันทึก config ลง Storage |
| **↺ รีเซ็ต** | 🟣 ม่วง | คืนค่าเริ่มต้น |
| **📋 ดึงข้อมูลแพ็กเกจ** | 🩷 ชมพู | ดึงชื่อแพ็กเกจจากหน้า Account |
| **🌐 ไปหน้า Browse** | 🟠 ทอง | เปิด `netflix.com/browse` |

### 📊 ดูสถานะ

| ส่วน | รายละเอียด | สี |
|------|------------|-----|
| **สถานะ** | `พร้อมใช้งาน` / `กำลังรัน` / `เจอ PIN ถูกต้อง: XXXX` / `หยุดแล้ว` | เขียว / น้ำเงิน / เขียว / แดง |
| **PIN** | แสดง PIN ปัจจุบัน 4 หลัก (`[2][5][4][0]`) | น้ำเงิน |
| **แพ็กเกจ** | Premium / Standard / Standard with Ads / Basic / Mobile | ทอง / ฟ้า / ส้ม / เขียว / ม่วง |

### 📝 บันทึก (Log)

- กำลังลอง: `กำลังทดลองรหัส PIN: 2540`
- เมื่อพบ: `เจอ PIN ถูกต้อง: 2604`
- เมื่อผิด: `PIN ผิด: 2604 — ลองตัวถัดไป`
- หยุด: `⏹ หยุดที่ PIN: 2540 | เริ่มต่อจากตรงนี้`
- เปิด/ปิดด้วยปุ่ม **− / +**

### 📋 ตัวอย่างการตั้งค่า

| สถานการณ์ | PIN เริ่มต้น | ลำดับ | หน่วงปุ่ม | หน่วงรหัส |
|------------|:---:|-------|:---:|:---:|
| ลองจาก 0000 | `0` | น้อย→มาก | 80 | 120 |
| ลองจาก 9999 ลงมา | `9999` | มาก→น้อย | 80 | 120 |
| เริ่มกลางทาง | `4500` | น้อย→มาก | 80 | 120 |
| เร็วขึ้น (เสี่ยง) | `0` | น้อย→มาก | 30 | 60 |

---

## 📁 โครงสร้างไฟล์

```
netflix-pin/
├── manifest.json     ← ตั้งค่า Extension (Manifest V3, icons, permissions)
├── background.js     ← Service Worker — รับคำสั่งจาก popup → ส่งไป content script
├── content.js        ← Content Script — React PIN input, Enter submit, Polling, Plan info
├── popup.html        ← UI Side Panel — Netflix Dark Theme, compact 600px
├── popup.js          ← Logic UI — Config, Status colors, PIN display, Log, Resume
├── netflix-pin.png   ← Logo และ Extension icon
└── README.md
```

| ไฟล์ | หน้าที่ |
|------|--------|
| `manifest.json` | ประกาศสิทธิ์ (`sidePanel`, `storage`, `scripting`), icons, `document_idle` |
| `background.js` | ส่งคำสั่ง start/stop/getPlanInfo/goToBrowse ไป content script + ตรวจสอบ response |
| `content.js` | React-compatible PIN input, กด Enter, Poll ผลลัพธ์ (double-check), อ่านแพ็กเกจ, sync `window.currentPin` |
| `popup.html` | ปุ่มสี Gradient 6 ปุ่ม, PIN 4-digit display, Status + Plan color-coded, Log collapsible |
| `popup.js` | `setStatus` แยก type (running/success/error), `setPlanInfo` แยก class ตามแพ็กเกจ, Resume logic |

---

## 🔧 เทคนิคที่น่าสนใจ

### React Compatible Input
Netflix ใช้ **React** — การ set `element.value` โดยตรง React จะไม่เห็น  
→ ใช้ **Native Value Setter** + dispatch `input`/`change` events

```js
const nativeSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype, 'value'
).set;
nativeSetter.call(element, value);
element.dispatchEvent(new Event('input', { bubbles: true }));
element.dispatchEvent(new Event('change', { bubbles: true }));
```

### Auto-Submit + Polling
หลังจากพิมพ์ PIN แต่ละตัว:
1. รอ `keyDelay` ms ระหว่างแต่ละตัวเลข
2. กด **Enter** อัตโนมัติเพื่อ Submit
3. รอ `codeDelay` ms
4. **Poll ทุก 400ms** นานสุด 12 วินาที:
   - Input หายไป → **PIN ถูกต้อง** ✅ (double-check 600ms กัน React re-render)
   - Error message โผล่ → **PIN ผิด** ❌ → ลองตัวต่อไป
   - หมดเวลา → ลองตัวต่อไป

### Resume After Stop
- `content.js` sync `window.currentPin` ทุกรอบของ loop
- เมื่อกดหยุด → `stopAutoFillRoutine()` return `lastPin` → ส่งผ่าน background → popup อัปเดต `startPinInput.value`
- กด ▶ ทำงานต่อ → อ่าน `startPinInput.value` → เริ่มจาก PIN ที่หยุดไว้

---

## 🛡️ หมายเหตุ

- ⚠️ ใช้กับ**บัญชีของตัวเองเท่านั้น**
- 🔒 Extension ทำงานในเครื่องของคุณ — ไม่ส่งข้อมูลออกนอก
- 🧩 Netflix อาจเปลี่ยน DOM → selector อาจต้องอัปเดตในอนาคต
- 🐞 พบบั๊กหรือต้องการฟีเจอร์ใหม่? [เปิด Issue](https://github.com/rxvxrsx/netflix-pin-check/issues)

---

## 📄 License

MIT — ใช้ได้อิสระภายใต้ความรับผิดชอบของคุณเอง
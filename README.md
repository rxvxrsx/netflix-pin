<p align="center">
  <img src="netflix-pin.png?v=2" alt="Netflix PIN" width="512" height="512" style="border-radius: 20px;">
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
| 📊 **สถานะ** | แสดงสถานะปัจจุบัน, PIN ล่าสุด (4-digit display), และชื่อแพ็กเกจ |
| 📝 **บันทึก** | Log แสดง PIN ที่กำลังทดลอง — เปิด/ปิดได้ |
| 📋 **แพ็กเกจ** | ดึงข้อมูลแพ็กเกจ Netflix จากหน้า `Account` อัตโนมัติ |
| 🌐 **Browse** | ปุ่มไปหน้า `netflix.com/browse` ทันที |
| 🎨 **Dark UI** | ดีไซน์สไตล์ Netflix — Dark theme, Glow effects, Pulse animation |
| ⚡ **React Compat** | รองรับ Netflix ที่ใช้ React ด้วย Native Value Setter |
| 📱 **Compact** | UI พอดี 600px ไม่มี Scrollbar ภายนอก |

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
| **PIN เริ่มต้น** | หมายเลข PIN ที่จะเริ่มลอง | `0` | 0 |
| **ลำดับ** | น้อย→มาก หรือ มาก→น้อย | น้อย→มาก | — |
| **หน่วงปุ่ม (ms)** | เวลาระหว่างกดแต่ละตัวเลข | `80` | 10 |
| **หน่วงรหัส (ms)** | เวลารอหลังกรอก PIN ก่อนเช็คผล | `120` | 30 |

### ▶️ เริ่มทำงาน

1. เปิดแท็บ Netflix ที่มีหน้าจอกรอก PIN
2. ตั้งค่า PIN เริ่มต้นและ Delay ตามต้องการ
3. กด **▶ เริ่มทำงาน** → Extension จะพิมพ์ PIN + กด Enter + รอผล
4. กด **⏹ หยุด** เพื่อหยุดทันที

### 📊 ดูสถานะ

| ส่วน | รายละเอียด |
|------|------------|
| **สถานะ** | `พร้อมใช้งาน` / `กำลังรัน` / `เจอ PIN ถูกต้อง: XXXX` / `หยุดแล้ว` |
| **PIN** | แสดง PIN ปัจจุบันแบบ 4 หลัก (`[2][5][4][0]`) |
| **แพ็กเกจ** | ชื่อแพ็กเกจ Netflix — กด **📋 แพ็กเกจ** เพื่อโหลด |

### 📝 บันทึก (Log)

- แสดง PIN ที่กำลังทดลอง: `กำลังทดลองรหัส PIN: 2540`
- เมื่อพบ: `เจอ PIN ถูกต้อง: 2604`
- เมื่อผิด: `PIN ผิด: 2604 — ลองตัวถัดไป`
- เปิด/ปิดด้วยปุ่ม **− / +**

### 📋 ตัวอย่างการตั้งค่า

| สถานการณ์ | PIN เริ่มต้น | ลำดับ | หน่วงปุ่ม | หน่วงรหัส |
|------------|:---:|-------|:---:|:---:|
| ลองจาก 0000 ขึ้นไป | `0` | น้อย→มาก | 80 | 120 |
| ลองจาก 9999 ลงมา | `9999` | มาก→น้อย | 80 | 120 |
| เริ่มกลางทาง | `4500` | น้อย→มาก | 80 | 120 |
| เร็วขึ้น (เสี่ยง) | `0` | น้อย→มาก | 30 | 60 |

---

## 📁 โครงสร้างไฟล์

```
netflix-pin/
├── manifest.json     ← ตั้งค่า Extension (Manifest V3)
├── background.js     ← Service Worker — จัดการแท็บ Netflix
├── content.js        ← Content Script — กรอก PIN + อ่านแพ็กเกจ
├── popup.html        ← UI Side Panel (Netflix Dark Theme)
├── popup.js          ← Logic UI — Config, Status, Log
└── README.md
```

| ไฟล์ | หน้าที่ |
|------|--------|
| `manifest.json` | ประกาศสิทธิ์ (`sidePanel`, `storage`, `scripting`), Content Script (`document_idle`) |
| `background.js` | รับคำสั่งจาก popup → ส่งไป content script บนแท็บ Netflix → ตรวจสอบ response |
| `content.js` | React-compatible PIN input, กด Enter อัตโนมัติ, Poll ผลลัพธ์, อ่านข้อมูลแพ็กเกจ |
| `popup.html` | UI ดีไซน์ Netflix Dark Theme — compact พอดี 600px ไม่มี scroll |
| `popup.js` | จัดการตั้งค่า, สถานะ, PIN display, Log, สื่อสารกับ background |

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

### Wait for DOM
ก่อนพิมพ์ PIN ทุกครั้ง — รอให้ input fields โหลดพร้อม (สูงสุด 8 วิ)  
→ รองรับ Netflix Single Page Application (SPA) navigation

---

## 🛡️ หมายเหตุ

- ⚠️ ใช้กับ**บัญชีของตัวเองเท่านั้น**
- 🔒 Extension ทำงานในเครื่องของคุณ — ไม่ส่งข้อมูลออกนอก
- 🧩 Netflix อาจเปลี่ยน DOM → selector อาจต้องอัปเดตในอนาคต
- 🐞 พบบั๊กหรือต้องการฟีเจอร์ใหม่? [เปิด Issue](https://github.com/rxvxrsx/netflix-pin-check/issues)

---

## 📄 License

MIT — ใช้ได้อิสระภายใต้ความรับผิดชอบของคุณเอง

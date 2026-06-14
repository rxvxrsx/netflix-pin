# 🔐 Netflix PIN Auto-Fill

> **Created by: REVERSE**

> Chrome Extension สำหรับลอง PIN บนหน้า Netflix โดยอัตโนมัติ  
> ทำงานผ่าน **Chrome Side Panel** — สวยงาม ใช้ง่าย ไม่เกะกะ

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0-e50914?style=flat-square" alt="version">
  <img src="https://img.shields.io/badge/manifest-v3-blue?style=flat-square" alt="manifest">
  <img src="https://img.shields.io/badge/platform-Chrome%20%7C%20Edge-brightgreen?style=flat-square" alt="platform">
</p>

---

## ✨ ฟีเจอร์

| หมวด | รายละเอียด |
|------|------------|
| 🔢 **Auto-Fill** | ลอง PIN ตั้งแต่ `0000` ถึง `9999` แบบอัตโนมัติ |
| ⬆️⬇️ **ลำดับ** | เลือกลองจากน้อย→มาก หรือ มาก→น้อย |
| ⏱️ **Delay** | ปรับเวลาหน่วงระหว่างกดแต่ละปุ่ม และระหว่างแต่ละรหัส |
| 📊 **สถานะ** | แสดงสถานะปัจจุบัน, PIN ล่าสุด, และชื่อแพ็กเกจ |
| 📝 **บันทึก** | Log การทำงานทั้งหมด พร้อมเปิด/ปิดได้ |
| 📋 **แพ็กเกจ** | ดึงข้อมูลแพ็กเกจ Netflix จากหน้า Account อัตโนมัติ |
| 🌐 **Browse** | ปุ่มกลับไปหน้า Netflix Browse ทันที |
| 🎨 **Dark UI** | ดีไซน์สไตล์ Netflix — Dark theme, Glow effects |
| ⚡ **React Compat** | รองรับหน้า Netflix ที่ใช้ React (native value setter) |

---

## 📥 ติดตั้ง

```bash
# 1. Clone โปรเจกต์
git clone https://github.com/rxvxrsx/netflix-pin-check.git

# 2. เปิด Chrome → chrome://extensions
# 3. เปิด Developer mode (มุมขวาบน)
# 4. กด Load unpacked → เลือกโฟลเดอร์โปรเจกต์
# 5. เสร็จ! เปิด Netflix แล้วคลิกไอคอน Extension
```

---

## 🚀 วิธีใช้

### 1. ตั้งค่า
| ตัวเลือก | คำอธิบาย | ค่าเริ่มต้น |
|----------|----------|-------------|
| **PIN เริ่มต้น** | หมายเลข PIN ที่จะเริ่มลอง | `0000` |
| **ลำดับ** | น้อย→มาก หรือ มาก→น้อย | น้อย→มาก |
| **หน่วงปุ่ม (ms)** | เวลาระหว่างกดแต่ละตัวเลข | `80` |
| **หน่วงรหัส (ms)** | เวลารอหลังกรอก PIN ก่อนเช็คผล | `120` |

### 2. เริ่มทำงาน
```
กด ▶ เริ่มทำงาน  →  Extension จะเริ่มลอง PIN ทีละตัว
กด ⏹ หยุด      →  หยุดการทำงานทันที
```

### 3. ดูสถานะ
- **สถานะ**: กำลังรัน / หยุดแล้ว / เจอ PIN ถูกต้อง
- **PIN**: แสดง PIN ปัจจุบันแบบ 4 หลัก
- **แพ็กเกจ**: แสดงชื่อแพ็กเกจ Netflix (กด 📋 เพื่อโหลด)

### 4. ตัวอย่างการตั้งค่า

| สถานการณ์ | PIN เริ่มต้น | ลำดับ |
|------------|-------------|-------|
| ลองจาก 0000 ขึ้นไป | `0` | น้อย→มาก |
| ลองจาก 9999 ลงมา | `9999` | มาก→น้อย |
| เริ่มกลางทาง | `4500` | น้อย→มาก |
| เจาะช่วงท้าย | `8000` | น้อย→มาก |

---

## 📁 โครงสร้างไฟล์

```
netflix-pin/
├── manifest.json     ← ตั้งค่า Extension (Manifest V3)
├── background.js     ← Service Worker — จัดการแท็บ Netflix
├── content.js        ← Content Script — กรอก PIN + อ่านแพ็กเกจ
├── popup.html        ← UI Side Panel
├── popup.js          ← Logic UI — Config, Status, Log
└── README.md
```

| ไฟล์ | หน้าที่ |
|------|--------|
| `manifest.json` | ประกาศสิทธิ์, Side Panel, Content Script |
| `background.js` | รับคำสั่งจาก popup → ส่งไป content script บนแท็บ Netflix |
| `content.js` | พิมพ์ PIN แบบ React-compatible, Poll ผลลัพธ์, อ่านข้อมูลแพ็กเกจ |
| `popup.html` | UI — ดีไซน์ Netflix Dark Theme |
| `popup.js` | จัดการตั้งค่า, สถานะ, Log, สื่อสารกับ background |

---

## 🔧 เทคนิคที่น่าสนใจ

### React Compatible Input
Netflix ใช้ **React** — การ set `element.value` โดยตรง React จะไม่เห็น  
→ ใช้ **native value setter** + dispatch `input`/`change` events

```js
const nativeSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype, 'value'
).set;
nativeSetter.call(element, value);
element.dispatchEvent(new Event('input', { bubbles: true }));
```

### Polling ผลลัพธ์
หลังจากพิมพ์ PIN + กด Enter → รอ `codeDelay` ms → poll ทุก 400ms  
เช็ค 2 อย่าง:
- Input หายไป → **PIN ถูกต้อง** (double-check 600ms กัน React re-render)
- Error message โผล่ → **PIN ผิด** → ลองตัวต่อไป

---

## 🛡️ หมายเหตุ

- ⚠️ ใช้กับ**บัญชีของตัวเองเท่านั้น**
- 🔒 Extension ทำงานในเครื่องของคุณ — ไม่ส่งข้อมูลออกนอก
- 🧩 Netflix อาจเปลี่ยน DOM → selector อาจต้องอัปเดตในอนาคต
- 🐞 พบบั๊กหรือต้องการฟีเจอร์ใหม่? [เปิด Issue](https://github.com/rxvxrsx/netflix-pin-check/issues)

---

## 📄 License

MIT — ใช้ได้อิสระภายใต้ความรับผิดชอบของคุณเอง
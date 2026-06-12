# Netflix PIN Auto-Fill

Chrome extension สำหรับช่วยกรอก PIN บนหน้า Netflix พร้อมแผงควบคุมแบบ Side Panel สำหรับตั้งค่าเริ่มต้นและดูสถานะการทำงาน

## Features

- ตั้งค่า PIN เริ่มต้นได้ตั้งแต่ `0000` ถึง `9999`
- ปรับเวลาระหว่างการกดแต่ละปุ่มได้
- ปรับเวลาระหว่างการลองแต่ละรหัสได้
- แสดงสถานะ PIN ล่าสุดและ log การทำงาน
- ส่งคำสั่งเฉพาะแท็บ Netflix ที่เปิดอยู่
- ใช้งานผ่าน Chrome Side Panel

## Installation

1. เปิด Chrome แล้วไปที่ `chrome://extensions`
2. เปิด `Developer mode`
3. กด `Load unpacked`
4. เลือกโฟลเดอร์โปรเจกต์นี้
5. เปิดหน้า Netflix แล้วกดไอคอน extension เพื่อเปิด Side Panel

## Files

- `manifest.json` - ตั้งค่า Chrome extension
- `background.js` - จัดการการเปิด Side Panel และส่งคำสั่งไปยังแท็บ Netflix
- `content.js` - ทำงานบนหน้า Netflix เพื่อกรอก PIN
- `popup.html` - UI ของ Side Panel
- `popup.js` - logic ของ UI, config, status และ log

## Notes

ใช้กับบัญชีและอุปกรณ์ที่คุณมีสิทธิ์ใช้งานเท่านั้น โปรเจกต์นี้ทำไว้เพื่อช่วย automation ส่วนตัว ไม่ควรใช้กับบัญชีหรือข้อมูลของผู้อื่นโดยไม่ได้รับอนุญาต

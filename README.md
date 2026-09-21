# HSK Mission

เว็บเรียนคำศัพท์ HSK 4.0 (HSK 2.0) จำนวน 1,200 คำ แบ่งเป็น 60 เซ็ต พร้อมแผนเรียนแบบปรับอัตโนมัติ บัตรคำ เกม และข้อสอบรายเซ็ต

## ความสามารถหลัก

- Dashboard แนะนำจำนวนเซ็ตที่ควรเรียนในแต่ละวัน
- คลังศัพท์ 1,200 คำ ค้นหาด้วยอักษรจีน พินอิน หรือคำแปลไทย
- บัตรคำพร้อมเสียงภาษาจีนและลำดับขีด
- เกมฝึกความหมาย คำอ่าน พินอิน ตัวจีน และเสียงวรรณยุกต์
- ข้อสอบ 3 ด่าน ซึ่งต้องได้ 20/20 ทุกด่าน
- เข้าสู่ระบบด้วย ChatGPT และบันทึกความก้าวหน้าใน Cloudflare D1
- รองรับโทรศัพท์และเดสก์ท็อป

## เทคโนโลยี

- React 19, TypeScript และ Tailwind CSS 4
- Vinext บน Cloudflare Workers
- Cloudflare D1 และ Drizzle ORM
- Vitest และ Testing Library

## เริ่มใช้งานในเครื่อง

ต้องใช้ Node.js 22.13 ขึ้นไป

```bash
pnpm install
pnpm dev
```

เปิด `http://localhost:5173`

## ตรวจสอบก่อนเผยแพร่

```bash
pnpm test
pnpm lint
pnpm build
```

## โครงสร้างสำคัญ

- `app/` หน้าเว็บ API และระบบเรียน
- `data/curriculum.json` หลักสูตร 1,200 คำ
- `db/` และ `drizzle/` ฐานข้อมูลและ migrations
- `public/data/` ข้อมูลที่โหลดตามการใช้งาน
- `tests/` ชุดทดสอบอัตโนมัติ

โปรเจกต์นี้พร้อมเก็บใน GitHub และ build เป็น Cloudflare Worker ผ่าน Sites โดยการตั้งค่าโฮสต์อยู่ใน `.openai/hosting.json`

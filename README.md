# Werewolf Activity

Discord Activity (Embedded App) cho game Ma Sói, chạy trong voice channel của Discord.

## Yêu cầu
- Node.js 18+
- npm

## Cài đặt

```bash
# Cài deps cho server và client
cd server && npm install
cd ../client && npm install
```

## Chạy dev (2 terminal)

**Terminal 1 — Backend:**
```bash
cd server
npm start
```
→ Server chạy ở `http://localhost:3001`

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
→ Vite chạy ở `http://localhost:5173`

## Tính năng hiện có
- ✅ Lobby + tham gia/ra khỏi phòng realtime (Socket.io)
- ✅ Phân vai tự động (Werewolf, Seer, Witch, Guard, Hunter, Villager)
- ✅ Đêm: Ma sói chọn mục tiêu giết, Bảo vệ chắn, Tiên tri điều tra
- ✅ Ngày: thảo luận
- ✅ Vote treo cổ ban ngày
- ✅ Check thắng thua tự động
- ✅ UI đẹp với 3 phe (Werewolf/Dân/Đặc biệt), nhật ký game

## Deploy lên Discord
Để đưa lên Discord thật, cần:
1. Discord Application với Activities enabled
2. URL mapping: `/.proxy` → backend, `/` → frontend
3. Host trên Cloudflare/Vercel/Render

Xem hướng dẫn chi tiết trong `DEPLOY.md` (s� tạo).

## Phát triển tiếp
- [ ] OAuth2 với Discord SDK để lấy tên thật
- [ ] Phù thủy có nước cứu + nước độc
- [ ] Th� săn bắn khi chết
- [ ] Thần tình yêu ghép đôi
- [ ] Hiển thị vai sau khi game ended
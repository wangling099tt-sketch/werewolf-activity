# 🎮 Werewolf — Discord Activity Setup

Game này có thể chạy như Discord Activity (iframe trong voice channel) — giống Goose Goose Duck, Wolvesville...

## 📋 Yêu cầu
- Discord Application đã tạo ở https://discord.com/developers/applications
- Đã enable **Activities** trong Application Settings
- Có **Bot Token** + **Client ID** + **Client Secret** + **Public Key**

## ⚙️ Setup Discord Developer Portal

### 1. Tạo Application
- Vào https://discord.com/developers/applications → **New Application**
- Lưu **Application ID** (= Client ID), **Public Key**

### 2. Activities Setup
- Vào Application → **Activities** (left sidebar)
- **Enable Activities** ✅
- **URL Mappings**: thêm mapping
  - **Prefix**: `/`
  - **Target**: URL public của bạn (vd: `https://your-tunnel.trycloudflare.com`)

### 3. OAuth2 Setup
- Vào **OAuth2** → **Redirects** → Add:
  - `http://localhost:5173` (dev)
  - `https://your-tunnel.trycloudflare.com` (prod)
- Lưu **Client Secret**

### 4. Bot Setup
- Vào **Bot** → Add Bot
- Copy **Bot Token**
- Enable **Message Content Intent** nếu cần

### 5. Cấu hình .env
```bash
# werewolf-activity/.env
VITE_DISCORD_CLIENT_ID=your_application_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_PUBLIC_KEY=your_public_key
DISCORD_REDIRECT_URI=http://localhost:5173
```

## 🚀 Chạy local với Cloudflare Tunnel

### Cách 1: Cloudflare Tunnel (recommended — free, không cần cài)
```bash
npx cloudflared tunnel --url http://localhost:5173
# → output: https://xxx.trycloudflare.com
```

### Cách 2: ngrok
```bash
ngrok http 5173
```

### Sau đó:
1. Copy URL HTTPS public (vd: `https://abc.trycloudflare.com`)
2. Update Discord Portal → Activities → URL Mappings → Target
3. Restart Discord client → vào voice channel → **Activities** → chọn app của bạn

## 📦 Khởi chạy

```bash
# Terminal 1 — Game server
cd werewolf-activity/server
node index.js

# Terminal 2 — Client (Vite)
cd werewolf-activity/client
npm run dev

# Terminal 3 — Tunnel
npx cloudflared tunnel --url http://localhost:5173
```

## 🎮 Test trong Discord

1. Restart Discord hoàn toàn
2. Vào voice channel bất kỳ
3. Click **Activities** (rocket icon ở voice controls)
4. Chọn **Werewolf — Ma Sói**
5. Game sẽ load trong popup iframe
6. Tên & avatar Discord của bạn sẽ tự động sync

## 🔧 Invite Bot vào Server

Để invite bot vào server test:
```
https://discord.com/oauth2/authorize?client_id=YOUR_APP_ID&scope=bot+applications.commands&permissions=274878294528
```

## 💡 Lưu ý
- Discord Activity iframe **chỉ chạy trên Discord Desktop** (không mobile)
- Phải dùng HTTPS — localhost không được
- Cloudflare Tunnel free tier OK cho development
- Production nên deploy lên Cloudflare Pages / Vercel / Netlify

## 🐛 Troubleshooting

### "Not running in Discord iframe"
→ Bạn đang mở URL thường, không phải từ Discord Activities menu

### "token exchange failed"
→ Check DISCORD_CLIENT_SECRET + redirect URI khớp Discord Portal

### iframe trắng / không load
→ Check URL Mappings trong Discord Portal
→ Check console (F12 trong Discord: View → Toggle Developer Tools)
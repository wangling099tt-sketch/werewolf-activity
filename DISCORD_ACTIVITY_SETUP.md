# 🐺 Wolvesville - Discord Activity Setup

## Status: �️ Cần setup thủ công trong Discord Developer Portal

### ✅ Đã có sẵn:
- Discord Application ID: `1414397182890606665`
- Code đầy đủ với Discord SDK integration
- Railway URL đang live: `https://werewolf-activity-production.up.railway.app`

### 📝 Hướng dẫn Setup trong Discord (5 phút):

#### Bước 1: Mở Discord Developer Portal
👉 https://discord.com/developers/applications/1414397182890606665

#### Bước 2: Cấu hình URL Mapping (QUAN TRỌNG nhất)
Vào **Activities** → **URL Mappings**:
```
Path Prefix:  /
HTTP Root:    /  
Entry Point:  index.html
Target:       https://werewolf-activity-production.up.railway.app
```

Nhấn **Add URL Mapping** rồi **Save Changes**

#### Bước 3: Enable Activities
Vào **Activities** → **Settings**:
- ✅ Bật "Activities SDK"  
- ✅ Bật "Embedded App"

#### Bước 4: Configure Bot (optional)
Vào **Bot**:
- ✅ Enable "Message Content Intent"

#### Bước 5: Test trong Discord
1. Vào Discord server bất kỳ
2. Click vào voice channel
3. Click **Activities** (🎮 icon) 
4. Tìm app của bạn
5. Click → app mở trong Discord!

### 🔍 Kiểm tra Discord SDK hoạt động:

Sau khi setup, khi mở app trong Discord:
- `discordSdk` object sẽ có giá trị thật
- `discordSdk.channelId` sẽ có channel ID
- `discordSdk.guildId` sẽ có guild/server ID
- Voice sync sẽ work với `discordSdk.commands.joinVoice`

### 🚨 Lỗi thường gặp:
- **"Failed to load"** → URL Mapping sai target
- **"Activity not found"** → chưa bật Activities SDK  
- **"Auth failed"** → check CLIENT_ID đúng `1414397182890606665`
- **Blank screen** → check console log trong Discord

### 📞 Test thử trong Discord:
Sau khi setup xong, copy link này:
```
https://discord.com/channels/@me/0?activities=1414397182890606665
```
Mở trong browser (không phải Discord client) sẽ hiện trang test.

Hoặc trong Discord client:
1. Click vào channel bất kỳ
2. Gõ `/activity`
3. Chọn Wolvesville từ list

### 🔧 Files cần check:
- `client/.env` - ✅ có VITE_DISCORD_CLIENT_ID
- `client/src/hooks/useDiscordSdk.ts` - ✅ SDK integration
- `client/src/App.tsx` - ✅ auto-auth on load

### Code đã sẵn sàng:
- ✅ Discord SDK với 4s timeout fallback
- ✅ Real user data khi chạy trong Discord  
- ✅ Auto-detect môi trường Discord vs web
- ✅ Voice channel sync (cần setup thêm Discord Application bot token)

### 🎯 Quick Start:
1. Setup URL Mapping trong Discord Developer Portal (5 phút)
2. Mở Discord → voice channel → Activities → chọn app
3. Chơi Werewolf ngay trong Discord!
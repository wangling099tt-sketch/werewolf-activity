# 🚀 Deploy Lên Railway

## Cách 1: Qua Terminal (Nhanh)

### 1. Cài Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login
```bash
railway login
```

### 3. Deploy
```bash
cd werewolf-activity
railway init
railway up
```

### 4. Lấy URL
```bash
railway domain
```

---

## Cách 2: Qua GitHub

### 1. Push code lên GitHub
```bash
cd werewolf-activity
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/werewolf-activity.git
git push -u origin main
```

### 2. Kết nối Railway
1. Vào https://railway.app
2. Login → New Project → Deploy from GitHub repo
3. Chọn repo `werewolf-activity`
4. Railway tự detect và deploy

### 3. Lấy URL
- Vào project → Settings → Domains
- Copy domain: `werewolf-activity.railway.app`

---

## 📝 Lưu Ý Quan Trọng

### Discord Activity URL
Discord yêu cầu:
1. URL phải có **HTTPS**
2. URL phải là **Root URL** (không có path)
3. App phải redirect về index.html cho mọi route

Railway đã cung cấp HTTPS sẵn ✅

### Test Local
```bash
npm start
# Mở http://localhost:3000
```

---

## 🎮 Sau Khi Deploy

1. Copy URL (ví dụ: `https://werewolf-activity.up.railway.app`)
2. Đăng ký Discord Application URL trong Developer Portal
3. Bot sẽ dùng URL này cho Activity

---

## ⚡ Quick Deploy Commands

```bash
# Setup
npm install -g @railway/cli
railway login

# Deploy
cd werewolf-activity
railway init
railway up

# Domain
railway domain
```

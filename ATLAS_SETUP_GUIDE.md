# Hướng dẫn thiết lập MongoDB Atlas

## 🎯 Tổng quan
MongoDB Atlas là dịch vụ cloud database miễn phí, không cần cài đặt MongoDB local.

## 📋 Các bước thiết lập

### Bước 1: Tạo tài khoản Atlas
1. Truy cập: https://www.mongodb.com/atlas
2. Click "Try Free" hoặc "Start Free"
3. Đăng ký bằng Google, Email, hoặc GitHub

### Bước 2: Tạo Cluster
1. Chọn "Build a Database"
2. Chọn **M0 Sandbox** (MIỄN PHÍ)
3. Cloud Provider: AWS (khuyến nghị)
4. Region: Singapore hoặc Tokyo (gần Việt Nam)
5. Cluster Name: `heart-rate-monitor`
6. Click "Create"

### Bước 3: Tạo Database User
1. Username: `admin`
2. Password: Tạo mật khẩu mạnh (LƯU LẠI)
3. Database User Privileges: `Atlas admin`
4. Click "Create Database User"

### Bước 4: Cấu hình Network Access
1. IP Access List → "Add IP Address"
2. Chọn "Allow Access from Anywhere" (0.0.0.0/0)
3. Click "Confirm"

### Bước 5: Lấy Connection String
1. Click "Connect" trên cluster
2. Chọn "Connect your application"
3. Driver: Node.js, Version: 4.1 or later
4. Copy connection string

### Bước 6: Cập nhật config.env
```env
MONGODB_URI=mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/heart-rate-monitor?retryWrites=true&w=majority
```
**Lưu ý**: Thay `<password>` bằng mật khẩu thực tế

## 🧪 Test kết nối

### 1. Test kết nối cơ bản
```bash
npm run db:test
```

### 2. Khởi tạo dữ liệu mẫu
```bash
npm run db:init
```

### 3. Kiểm tra trạng thái
```bash
npm run db:status
```

## 🔧 Troubleshooting

### Lỗi kết nối
- ✅ Kiểm tra password trong connection string
- ✅ Kiểm tra IP whitelist (0.0.0.0/0)
- ✅ Kiểm tra cluster đang chạy
- ✅ Kiểm tra network connectivity

### Lỗi authentication
- ✅ Username/password đúng
- ✅ Database user có quyền Atlas admin
- ✅ Connection string format đúng

### Lỗi timeout
- ✅ Kiểm tra firewall
- ✅ Thử region khác
- ✅ Kiểm tra internet connection

## 📊 Monitoring

### Atlas Dashboard
- Truy cập: https://cloud.mongodb.com
- Xem metrics, logs, performance
- Monitor usage và billing

### Database Scripts
```bash
# Kiểm tra trạng thái
npm run db:status

# Backup dữ liệu
npm run db:backup

# Restore dữ liệu
npm run db:restore <backup-file>
```

## 💰 Chi phí

### M0 Sandbox (MIỄN PHÍ)
- 512MB storage
- Shared RAM
- Không giới hạn connections
- Đủ cho development và testing

### M2+ (Trả phí)
- Nhiều storage hơn
- Dedicated RAM
- Better performance
- Production ready

## 🔒 Bảo mật

### Best Practices
1. **Strong Password**: Mật khẩu mạnh cho database user
2. **IP Whitelist**: Chỉ cho phép IP cần thiết
3. **Encryption**: Atlas tự động encrypt data
4. **Backup**: Tự động backup hàng ngày
5. **Monitoring**: Theo dõi access logs

### Production Setup
```env
# Production config
NODE_ENV=production
MONGODB_URI=mongodb+srv://admin:strong_password@cluster0.xxxxx.mongodb.net/heart-rate-monitor?retryWrites=true&w=majority&authSource=admin
```

## 🚀 Deploy

### Heroku
```bash
# Set environment variable
heroku config:set MONGODB_URI=mongodb+srv://...

# Deploy
git push heroku main
```

### Vercel/Netlify
- Thêm MONGODB_URI vào environment variables
- Deploy như bình thường

## 📈 Scaling

### Khi nào cần upgrade
- Database size > 512MB
- Cần better performance
- Production deployment
- High traffic

### Upgrade path
M0 → M2 → M5 → M10 → ...

## 🆘 Support

### Atlas Support
- Documentation: https://docs.atlas.mongodb.com
- Community: https://community.mongodb.com
- Support: Available in Atlas dashboard

### Project Support
- Check logs: `npm run db:status`
- Test connection: `npm run db:test`
- Reset database: `npm run db:init`

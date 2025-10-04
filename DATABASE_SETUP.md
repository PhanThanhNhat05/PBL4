# Hướng dẫn thiết lập Cơ sở dữ liệu

## Tổng quan

Dự án sử dụng MongoDB với Mongoose ODM để quản lý dữ liệu. Hệ thống bao gồm 2 collection chính:
- **Users**: Thông tin người dùng và xác thực
- **Measurements**: Dữ liệu đo nhịp tim và ECG

## Cấu trúc Database

### Collection: Users
```javascript
{
  name: String,           // Tên người dùng
  email: String,          // Email (unique)
  password: String,       // Mật khẩu (hashed)
  age: Number,            // Tuổi
  gender: String,         // Giới tính (male/female/other)
  phone: String,          // Số điện thoại
  role: String,           // Vai trò (user/admin)
  avatar: String,         // Ảnh đại diện
  isActive: Boolean,      // Trạng thái hoạt động
  createdAt: Date,        // Ngày tạo
  updatedAt: Date         // Ngày cập nhật
}
```

### Collection: Measurements
```javascript
{
  userId: ObjectId,       // ID người dùng
  ecgData: [Number],      // Dữ liệu ECG
  heartRate: Number,      // Nhịp tim
  prediction: String,     // Dự đoán (Normal/Supraventricular/Ventricular/Paced/Other)
  confidence: Number,     // Độ tin cậy (0-1)
  riskLevel: String,      // Mức độ rủi ro (Low/Medium/High)
  symptoms: [String],     // Triệu chứng
  notes: String,          // Ghi chú
  isAnomaly: Boolean,     // Có bất thường không
  deviceInfo: String,     // Thông tin thiết bị
  measurementDuration: Number, // Thời gian đo (giây)
  createdAt: Date,        // Ngày tạo
  updatedAt: Date         // Ngày cập nhật
}
```

## Cài đặt

### 1. Cài đặt MongoDB

#### Windows:
1. Tải MongoDB Community Server từ [mongodb.com](https://www.mongodb.com/try/download/community)
2. Cài đặt và khởi động MongoDB service
3. Hoặc sử dụng MongoDB Atlas (cloud)

#### Linux/macOS:
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS với Homebrew
brew install mongodb-community
```

### 2. Cấu hình kết nối

Chỉnh sửa file `config.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/heart-rate-monitor
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
```

### 3. Cài đặt dependencies

```bash
# Cài đặt dependencies chính
npm install

# Cài đặt dependencies cho scripts
cd scripts
npm install
```

## Sử dụng

### 1. Test kết nối database
```bash
npm run db:test
```

### 2. Khởi tạo database với dữ liệu mẫu
```bash
npm run db:init
```

### 3. Kiểm tra trạng thái database
```bash
npm run db:status
```

### 4. Backup database
```bash
npm run db:backup
```

### 5. Restore database
```bash
npm run db:restore <backup-file>
```

## Scripts có sẵn

| Lệnh | Mô tả |
|------|-------|
| `npm run db:test` | Test kết nối MongoDB |
| `npm run db:init` | Khởi tạo database với dữ liệu mẫu |
| `npm run db:status` | Kiểm tra trạng thái database |
| `npm run db:backup` | Tạo backup database |
| `npm run db:restore` | Khôi phục từ backup |

## Dữ liệu mẫu

Sau khi chạy `npm run db:init`, bạn sẽ có:

### Users:
- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

### Measurements:
- 2 bản ghi đo nhịp tim mẫu
- 1 bản ghi bình thường, 1 bản ghi có bất thường

## Troubleshooting

### Lỗi kết nối MongoDB
1. Kiểm tra MongoDB service có chạy không
2. Kiểm tra MONGODB_URI trong config.env
3. Kiểm tra firewall và network

### Lỗi authentication
1. Kiểm tra username/password trong connection string
2. Kiểm tra database permissions

### Lỗi schema
1. Kiểm tra model definitions
2. Chạy `npm run db:init` để reset database

## Bảo mật

1. **Mật khẩu**: Được hash bằng bcryptjs với salt rounds = 12
2. **JWT**: Sử dụng JWT cho authentication
3. **Validation**: Mongoose schema validation
4. **Indexes**: Tối ưu hóa queries với indexes

## Backup và Recovery

### Tự động backup
Tạo cron job để backup hàng ngày:
```bash
# Thêm vào crontab
0 2 * * * cd /path/to/project && npm run db:backup
```

### Manual backup
```bash
# Backup ngay lập tức
npm run db:backup

# Restore từ backup
npm run db:restore backups/backup-2024-01-01T00-00-00-000Z.json
```

## Monitoring

Sử dụng `npm run db:status` để:
- Kiểm tra số lượng documents
- Xem kích thước database
- Kiểm tra indexes
- Xem hoạt động gần đây

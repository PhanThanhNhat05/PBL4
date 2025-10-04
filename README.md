# Hệ thống theo dõi đánh giá sức khỏe thông qua nhịp tim

Dự án PBL4 - Hệ thống thông minh theo dõi và đánh giá sức khỏe tim mạch sử dụng cảm biến ECG và trí tuệ nhân tạo.

## 🚀 Tính năng chính

### Cho người dùng
- **Đăng ký/Đăng nhập**: Tạo tài khoản và quản lý thông tin cá nhân
- **Đo nhịp tim**: Sử dụng cảm biến ECG để đo và phân tích nhịp tim
- **Phân tích AI**: Sử dụng mô hình CNN-BiLSTM để phát hiện bất thường nhịp tim
- **Lịch sử đo**: Xem và quản lý lịch sử các lần đo
- **Thống kê**: Dashboard hiển thị thống kê tổng quan về sức khỏe
- **Khuyến nghị**: Đưa ra lời khuyên dựa trên kết quả phân tích

### Cho quản trị viên
- **Quản lý người dùng**: Xem, khóa/mở khóa, xóa tài khoản người dùng
- **Thống kê hệ thống**: Theo dõi hoạt động của toàn bộ hệ thống
- **Báo cáo**: Xem báo cáo chi tiết về việc sử dụng

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** với Express.js
- **MongoDB** với Mongoose
- **JWT** cho xác thực
- **RESTful API**

### Frontend
- **React 18** với TypeScript
- **Material-UI (MUI)** cho giao diện
- **Recharts** cho biểu đồ
- **React Router** cho điều hướng

### AI/ML
- **CNN-BiLSTM** model cho phân loại tín hiệu ECG
- **Python** cho xử lý dữ liệu và huấn luyện mô hình

## 📦 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm hoặc yarn

### 1. Clone repository
```bash
git clone <repository-url>
cd pbl
```

### 2. Cài đặt dependencies cho backend
```bash
npm install
```

### 3. Cài đặt dependencies cho frontend
```bash
cd client
npm install
cd ..
```

### 4. Cấu hình môi trường
Tạo file `.env` trong thư mục gốc:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/heart-rate-monitor
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

### 5. Khởi động MongoDB
Đảm bảo MongoDB đang chạy trên máy của bạn.

### 6. Chạy ứng dụng

#### Chạy backend:
```bash
npm run dev
```

#### Chạy frontend (terminal mới):
```bash
npm run client
```

Ứng dụng sẽ chạy tại:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## 📱 Hướng dẫn sử dụng

### 1. Đăng ký tài khoản
- Truy cập http://localhost:3000
- Nhấn "Đăng ký ngay"
- Điền thông tin cá nhân
- Xác nhận đăng ký

### 2. Đo nhịp tim
- Đăng nhập vào hệ thống
- Chọn "Đo nhịp tim" từ menu
- Làm theo hướng dẫn đặt cảm biến
- Nhấn "Bắt đầu đo"
- Chờ kết quả phân tích

### 3. Xem lịch sử
- Chọn "Lịch sử" từ menu
- Xem danh sách các lần đo
- Nhấn vào biểu tượng mắt để xem chi tiết
- Sử dụng bộ lọc để tìm kiếm

### 4. Quản lý hồ sơ
- Chọn "Hồ sơ" từ menu
- Cập nhật thông tin cá nhân
- Đổi mật khẩu (nếu cần)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Measurements
- `GET /api/measurements` - Lấy danh sách đo
- `POST /api/measurements` - Tạo đo mới
- `GET /api/measurements/:id` - Lấy chi tiết đo
- `PUT /api/measurements/:id` - Cập nhật đo
- `DELETE /api/measurements/:id` - Xóa đo

### AI Analysis
- `POST /api/ai/analyze` - Phân tích dữ liệu ECG
- `GET /api/ai/model-info` - Thông tin mô hình AI

### Users (Admin)
- `GET /api/users` - Lấy danh sách users
- `GET /api/users/profile` - Lấy profile
- `PUT /api/users/profile` - Cập nhật profile
- `PUT /api/users/:id/status` - Thay đổi trạng thái user
- `DELETE /api/users/:id` - Xóa user

## 🧠 Mô hình AI

Dự án sử dụng mô hình CNN-BiLSTM để phân loại tín hiệu ECG thành 5 nhóm:

1. **Normal** - Nhịp tim bình thường
2. **Supraventricular** - Bất thường trên thất
3. **Ventricular** - Bất thường thất
4. **Paced** - Được điều chỉnh bởi máy tạo nhịp
5. **Other** - Các loại bất thường khác

### Dữ liệu huấn luyện
- Sử dụng MIT-BIH Arrhythmia Database
- 48 records, mỗi record ~30 phút
- Tần số 360Hz
- Độ chính xác: ~92.5%

## 📊 Cấu trúc dự án

```
pbl/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utility functions
│   └── public/
├── models/                 # MongoDB models
├── routes/                 # API routes
├── middleware/             # Express middleware
├── server.js              # Main server file
└── package.json
```

## 🚀 Triển khai

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Nhóm thực hiện

- **Từ Đức Mạnh** - Project Manager, AI/ML
- **Trần Quang Thắng** - Backend Developer
- **Bùi Quốc Khánh** - Hardware Engineer
- **Lê Duy Phương Hà** - Frontend Developer

## 📞 Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng liên hệ qua email hoặc tạo issue trên GitHub.

---

**Lưu ý**: Đây là dự án học tập, không thay thế cho việc khám bệnh chuyên nghiệp. Luôn tham khảo ý kiến bác sĩ khi có vấn đề về sức khỏe.

# Database Management Scripts

Các script quản lý cơ sở dữ liệu cho hệ thống theo dõi nhịp tim.

## Cài đặt

```bash
cd scripts
npm install
```

## Các lệnh có sẵn

### 1. Khởi tạo database
```bash
npm run init
```
- Tạo dữ liệu mẫu (users và measurements)
- Xóa dữ liệu cũ nếu có
- Tạo 2 user mẫu: admin@example.com và user@example.com

### 2. Backup database
```bash
npm run backup
```
- Tạo file backup trong thư mục `../backups/`
- Lưu tất cả users và measurements
- File backup có timestamp

### 3. Restore database
```bash
npm run restore <backup-file>
```
- Khôi phục database từ file backup
- Ví dụ: `npm run restore ../backups/backup-2024-01-01T00-00-00-000Z.json`

### 4. Kiểm tra trạng thái database
```bash
npm run status
```
- Hiển thị thông tin chi tiết về database
- Số lượng users, measurements
- Kích thước database
- Indexes

## Cấu trúc thư mục

```
scripts/
├── init-database.js      # Khởi tạo database
├── backup-database.js    # Backup database
├── restore-database.js   # Restore database
├── database-status.js    # Kiểm tra trạng thái
├── package.json          # Dependencies
└── README.md            # Hướng dẫn sử dụng

backups/                  # Thư mục chứa file backup
└── backup-*.json        # Các file backup
```

## Lưu ý

- Đảm bảo file `.env` có cấu hình MongoDB URI đúng
- Backup thường xuyên để tránh mất dữ liệu
- Kiểm tra trạng thái database trước khi thực hiện các thao tác quan trọng

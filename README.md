# Cinema-Booking System

Hệ thống đặt vé xem phim trực tuyến với Spring Boot Backend và React Frontend.

## Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt:

- [Docker](https://www.docker.com/products/docker-desktop/) (phiên bản mới nhất)
- [Git](https://git-scm.com/downloads) (phiên bản mới nhất)

## Cài đặt và Chạy

### 1. Khởi động Docker Desktop

⚠️ **Quan trọng**: Trước khi bắt đầu, hãy đảm bảo:
- Đã khởi động Docker Desktop
- Đợi Docker Desktop khởi động hoàn tất (biểu tượng Docker ở taskbar đã ngừng quay)
- Kiểm tra Docker Desktop đang chạy bằng cách mở Terminal và gõ: `docker --version`

### 2. Clone dự án

```bash
git clone https://github.com/Shiengg/Cinema-Booking.git
cd Cinema-Booking
```

### 3. Khởi động hệ thống

Sử dụng Docker Compose để khởi động toàn bộ hệ thống:

```bash
docker-compose up --build
```

Lệnh này sẽ:
- Build và khởi động backend Spring Boot
- Build và khởi động frontend React
- Khởi động MySQL database
- Khởi động Adminer (công cụ quản lý database)

### 4. Truy cập các services

Sau khi tất cả các services đã khởi động thành công, bạn có thể truy cập:

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api
- **Adminer (Database Management)**: http://localhost:8081
  - System: MySQL
  - Server: mysql
  - Username: cinema_user
  - Password: cinema_password
  - Database: cinema_db

## Cấu trúc Project

```
Cinema-Booking/
├── cinema-booking/           # Backend (Spring Boot)
│   ├── src/                 # Source code
│   ├── docker/              # Docker configurations
│   └── pom.xml             # Maven dependencies
├── cinema-booking-frontend/ # Frontend (React)
│   ├── src/                # Source code
│   ├── public/             # Public assets
│   └── package.json        # NPM dependencies
├── docker-compose.yml      # Docker Compose configuration
└── README.md              # Project documentation
```

## Các lệnh hữu ích

### Dừng hệ thống
```bash
docker-compose down
```

### Xem logs
```bash
# Xem logs của tất cả các services
docker-compose logs

# Xem logs của một service cụ thể
docker-compose logs [service_name]  # ví dụ: docker-compose logs app
```

### Khởi động lại một service
```bash
docker-compose restart [service_name]  # ví dụ: docker-compose restart app
```

### Xóa tất cả data và rebuild
```bash
docker-compose down -v
docker-compose --build --no-cache
docker-compose up -d
```

## Xử lý sự cố

1. **Lỗi port đã được sử dụng**
   - Kiểm tra và dừng các services đang sử dụng ports 80, 8080, 3306, hoặc 8081
   - Hoặc thay đổi ports trong file docker-compose.yml

2. **Frontend không kết nối được với Backend**
   - Đảm bảo tất cả các services đều đang chạy: `docker-compose ps`
   - Kiểm tra logs của services: `docker-compose logs`

3. **Database không khởi động**
   - Xóa volume cũ: `docker-compose down -v`
   - Khởi động lại với volume mới: `docker-compose up --build --no-cache`

## Giấy phép

[MIT License](LICENSE)

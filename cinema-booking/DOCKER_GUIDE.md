## Hướng Dẫn Chạy Cinema Booking System

### Yêu Cầu
- Docker Desktop (https://www.docker.com/products/docker-desktop)
- Docker Compose (đi kèm với Docker Desktop)

### Bước 1: Kiểm Tra Cài Đặt
```bash
docker --version
docker-compose --version
```

### Bước 2: Build JAR File (Nếu chưa build)
```bash
cd D:\HKII_4\DACN\Cinema-Booking\cinema-booking
mvn clean package -DskipTests
```

### Bước 3: Khởi Động Docker Desktop
- Mở Docker Desktop application
- Chờ cho đến khi Docker daemon hoạt động (kiểm tra taskbar)

### Bước 4: Chạy Hệ Thống Với Docker Compose
```bash
cd D:\HKII_4\DACN\Cinema-Booking\cinema-booking
docker-compose up --build
```

Lệnh này sẽ:
- Build Docker image cho Spring Boot application
- Khởi động MySQL database
- Khởi động Spring Boot application
- Khởi động Adminer (MySQL management tool)

### Bước 5: Truy Cập Ứng Dụng

#### Spring Boot API
- URL: http://localhost:8080
- Health Check: http://localhost:8080/actuator/health

#### Adminer (MySQL Manager)
- URL: http://localhost:8081
- Username: cinema_user
- Password: cinema_password
- Database: cinema_db
- Server: mysql

### Bước 6: Dừng Hệ Thống
```bash
docker-compose down
```

### Các Dịch Vụ

| Dịch Vụ | Port | Mô Tả |
|---------|------|-------|
| Spring Boot App | 8080 | REST API Server |
| MySQL Database | 3306 | Database |
| Adminer | 8081 | Database Manager UI |

### Cấu Hình Database
- Host: mysql (trong Docker) hoặc localhost:3306 (ngoài Docker)
- Username: cinema_user
- Password: cinema_password
- Database: cinema_db

### Logs
Xem log real-time:
```bash
docker-compose logs -f app
docker-compose logs -f mysql
```

### Troubleshooting

**Lỗi: "Docker daemon is not running"**
- Mở Docker Desktop application

**Lỗi: Port 8080 đang dùng**
- Sửa docker-compose.yml, thay `8080:8080` thành `8081:8080`

**Lỗi: Database connection timeout**
- Chờ MySQL container startup (30s)
- Kiểm tra logs: `docker-compose logs mysql`

**Reset Database**
```bash
docker-compose down -v
docker-compose up --build
```

### Current Project Structure
- **Entity**: User (chỉ có phần User được build)
- **Service**: UserService
- **Controller**: UserController
- **Repository**: UserRepository
- **DTO**: UserRegisterRequest, UserResponse
- **Mapper**: UserMapper (MapStruct)
- **Config**: WebConfig, GlobalExceptionHandler

### Các Tính Năng Có Sẵn
✅ User Authentication & Registration
✅ Exception Handling
✅ CORS Configuration
✅ MySQL Database
✅ MapStruct Mapper
✅ Lombok Annotations
✅ Health Check Endpoint


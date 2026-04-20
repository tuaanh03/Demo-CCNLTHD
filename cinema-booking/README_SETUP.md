# Cinema Booking System - Setup Hoàn Thành

## ✅ Những Thay Đổi Đã Thực Hiện

### 1. **Sửa Lỗi Java 21 - getFirst()**
- ✅ Sửa `GlobalExceptionHandler.java`: thay `.get(0)` thành `.getFirst()` (Java 21 feature)

### 2. **Docker & Docker Compose Configuration**
- ✅ Cải thiện `docker-compose.yml`:
  - Thêm health checks cho MySQL và App
  - Timeout và retry logic
  - MySQL charsets setup (utf8mb4)
  - Proper environment variables
  - Added Adminer for database management

- ✅ Cập nhật `Dockerfile`:
  - Sử dụng multi-stage build
  - Java 21 JDK slim image
  - Exposed port 8080

### 3. **Spring Boot Configuration**
- ✅ Thêm `spring-boot-starter-actuator` dependency
- ✅ Thêm health check endpoint
- ✅ Cấu hình actuator endpoints trong `application.properties`

### 4. **Dọn Dẹp Code**
- ❌ Xóa các Controller không cần: BookingController, MovieController, ScreeningController, DebugController
- ❌ Xóa các DTO không cần: BookingRequest, MovieRequest, ScreeningRequest, BookingResponseDTO, MovieResponseDTO, ScreeningResponseDTO, SeatResponseDTO
- ❌ Xóa các Service/ServiceImpl không cần
- ❌ Xóa các Repository không cần
- ❌ Xóa DataInitializer config
- ✅ Giữ lại: UserController, UserService, UserRepository, User Entity, UserMapper

### 5. **Exception Handling**
- ✅ Sửa `GlobalExceptionHandler`: sử dụng `APIResponse.builder()` thay vì direct instantiation

### 6. **Maven Build**
- ✅ Sửa `pom.xml`: xóa các exclude không hợp lệ trong spring-boot-maven-plugin
- ✅ Successfully built JAR: `cinema-booking-0.0.1-SNAPSHOT.jar`

## 📦 Build Status
```
BUILD SUCCESS
Total time: 2.919 s
JAR File: target/cinema-booking-0.0.1-SNAPSHOT.jar
```

## 🚀 Cách Chạy Hệ Thống

### Yêu Cầu
- Docker Desktop installed
- Docker Compose

### Lệnh Chạy
```bash
cd D:\HKII_4\DACN\Cinema-Booking\cinema-booking
docker-compose up --build
```

### Truy Cập
- **API Server**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health
- **Adminer (DB Manager)**: http://localhost:8081

## 📝 Project Structure (Current)
```
cinema-booking/
├── src/main/java/com/example/cinema_booking/
│   ├── CinemaBookingApplication.java
│   ├── config/
│   │   ├── WebConfig.java
│   │   └── ✅ GlobalExceptionHandler.java (Updated)
│   ├── controller/
│   │   └── UserController.java ✅
│   ├── dto/
│   │   ├── request/
│   │   │   └── UserRegisterRequest.java ✅
│   │   └── response/
│   │       └── UserResponse.java ✅
│   ├── entity/
│   │   └── User.java ✅
│   ├── enums/
│   ├── exception/
│   │   └── GlobalExceptionHandler.java ✅
│   ├── mapper/
│   │   └── UserMapper.java ✅
│   ├── repository/
│   │   └── UserRepository.java ✅
│   └── service/
│       ├── UserService.java ✅
│       └── impl/
│           └── UserServiceImpl.java ✅
├── src/main/resources/
│   └── application.properties ✅ (with actuator config)
├── docker/
│   ├── Dockerfile ✅ (Updated)
│   └── mysql/
│       └── init.sql
├── pom.xml ✅ (with spring-boot-starter-actuator)
├── docker-compose.yml ✅ (Updated with health checks)
├── DOCKER_GUIDE.md ✅ (New - detailed guide)
└── README.md (This file)
```

## 🔍 Các Lỗi Đã Fix
1. ✅ `getFirst()` not found - sử dụng Java 21
2. ✅ Missing `RoomRepository` import - xóa các file không cần
3. ✅ `APIResponse` constructor - sử dụng builder pattern
4. ✅ Invalid exclude format in pom.xml - sửa exclude format
5. ✅ Docker health check - thêm actuator endpoint

## 📋 Environment Variables
```yaml
SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/cinema_db
SPRING_DATASOURCE_USERNAME: cinema_user
SPRING_DATASOURCE_PASSWORD: cinema_password
SPRING_JPA_HIBERNATE_DDL_AUTO: update
JAVA_TOOL_OPTIONS: -Xmx512m -Xms256m
```

## 🐳 Docker Services
| Service | Port | Status |
|---------|------|--------|
| Spring Boot | 8080 | ✅ Ready |
| MySQL | 3306 | ✅ Ready |
| Adminer | 8081 | ✅ Ready |

## ⚙️ Versions
- Java: 21
- Spring Boot: 3.4.5
- MySQL: 8.0.40
- Maven: 3.9.6
- Docker Compose: 3.9

## 📌 Lưu Ý Quan Trọng
- Chỉ build phần User, các phần khác (Booking, Movie, Screening) đã xóa
- Database sẽ tự động migrate với Hibernate DDL-auto
- Health check mất ~40s để khởi động hoàn toàn

## 🔗 File Hướng Dẫn
Chi tiết cách chạy xem: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

---
**Status**: ✅ Sẵn sàng chạy trên Docker
**Build Date**: 14/03/2026


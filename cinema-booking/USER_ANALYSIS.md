# Phân Tích Đối Tượng Sử Dụng - User Management & Authorization System

## 2.0 Vấn Đề Mà Project Giải Quyết

Hệ thống quản lý người dùng và phân quyền được xây dựng để giải quyết những vấn đề sau:

### 2.0.1 Bảo Mật Xác Thực (Authentication Security)
- **Vấn đề**: Mật khẩu người dùng cần được bảo vệ an toàn, tránh lưu trữ dưới dạng plain text.
- **Giải pháp**: Sử dụng BCrypt (password encoder với salt) để mã hóa mật khẩu trước khi lưu vào database.

### 2.0.2 Kiểm Soát Truy Cập (Access Control)
- **Vấn đề**: Không phải tất cả người dùng đều có quyền truy cập tất cả các tính năng. Cần kiểm soát ai được phép làm gì.
- **Giải pháp**: Sử dụng mô hình Role-Based Access Control (RBAC) - gán vai trò cho người dùng, và từng vai trò có tập quyền cụ thể.

### 2.0.3 Quản Lý Phiên Đăng Nhập (Session Management)
- **Vấn đề**: Sau khi đăng nhập, cần có cơ chế để xác thực các request tiếp theo mà không yêu cầu nhập mật khẩu lại.
- **Giải pháp**: Sử dụng JWT (JSON Web Token) - token được cấp sau khi xác thực thành công, người dùng gửi token này trong các request tiếp theo.

### 2.0.4 Quản Lý Quyền Linh Hoạt (Flexible Permission Management)
- **Vấn đề**: Các yêu cầu quyền hạn của hệ thống có thể thay đổi theo thời gian. Cần cách để dễ dàng thêm/sửa/xóa quyền mà không phải viết lại code.
- **Giải pháp**: Tách quyền (Permission) thành các entity độc lập, cho phép gán quyền vào vai trò một cách động (cơ sở dữ liệu, không hardcode).

### 2.0.5 Đăng Xuất An Toàn (Secure Logout)
- **Vấn đề**: Khi người dùng đăng xuất, token cũ phải bị vô hiệu hóa ngay lập tức để tránh bị sử dụng lại.
- **Giải pháp**: Duy trì danh sách token bị vô hiệu hóa (InvalidatedToken) trong database. Khi xác thực, kiểm tra token có trong danh sách này hay không.

### 2.0.6 Token Refresh (Gia Hạn Phiên)
- **Vấn đề**: Token JWT có thời hạn (expiration) để tăng tính bảo mật. Tuy nhiên, phải yêu cầu người dùng đăng nhập lại khi token hết hạn sẽ tạo trải nghiệm xấu.
- **Giải pháp**: Hỗ trợ refresh token - cho phép gia hạn token cũ mà không cần đăng nhập lại (trong thời gian cho phép).

### 2.0.7 Quản Lý Thông Tin Người Dùng (User Information Management)
- **Vấn đề**: Người dùng cần có khả năng xem và cập nhật thông tin cá nhân (email, tên, số điện thoại, mật khẩu).
- **Giải pháp**: Cung cấp API cho phép người dùng xem thông tin (`GET /users/myInfo`) và cập nhật thông tin của mình (`PUT /users/{userId}`).

### 2.0.8 Quản Lý Người Dùng Tập Trung (Centralized User Management)
- **Vấn đề**: Admin cần có công cụ để quản lý tất cả người dùng của hệ thống (xem danh sách, gán vai trò, xóa tài khoản).
- **Giải pháp**: Cung cấp API CRUD đầy đủ cho User, Role, Permission - chỉ dành cho Admin.

---

## 2.1 Đối Tượng Sử Dụng

Hệ thống quản lý người dùng và phân quyền được thiết kế để phục vụ hai nhóm đối tượng chính, với các mục tiêu trải nghiệm cụ thể:

---

### 2.1.1 Người Dùng Cuối (End-User)

**Vai trò:** Người dùng bình thường của hệ thống, có nhu cầu đăng ký tài khoản, đăng nhập và sử dụng các tính năng được phép theo vai trò của mình.

**Nhu cầu:**

- Cần có tài khoản để truy cập hệ thống (đăng ký với email và mật khẩu).
- Muốn đăng nhập nhanh chóng và an toàn vào hệ thống.
- Cần quản lý thông tin cá nhân (cập nhật tên, số điện thoại, mật khẩu).
- Muốn xem thông tin tài khoản của mình (thông tin cá nhân, vai trò, quyền được phép).
- Cần có khả năng đăng xuất an toàn khỏi hệ thống.
- Muốn có phiên đăng nhập với hạn thời gian, và khả năng làm mới token JWT.

**Mục tiêu:**

- Cung cấp giao diện đơn giản để đăng ký và đăng nhập.
- Đảm bảo mật khẩu được mã hóa an toàn (BCrypt).
- Cung cấp JWT token để xác thực các request tiếp theo.
- Cho phép người dùng xem và cập nhật thông tin cá nhân.
- Hỗ trợ refresh token và logout an toàn.

---

### 2.1.2 Quản Trị Viên (Administrator)

**Vai trò:** Người quản lý hệ thống, chịu trách nhiệm quản lý người dùng, vai trò, quyền và cấu hình toàn bộ hệ thống.

**Nhu cầu:**

- Quản lý danh sách người dùng (xem, thêm, sửa, xóa người dùng).
- Gán vai trò (Role) cho người dùng để kiểm soát quyền truy cập.
- Tạo và quản lý các vai trò (Role) tùy chỉnh theo nhu cầu business.
- Định nghĩa các quyền (Permission) chi tiết cho từng tính năng trong hệ thống.
- Gán quyền vào vai trò để kiểm soát những gì người dùng có thể làm.
- Theo dõi hoạt động của người dùng (xem lịch sử đăng nhập, thao tác).
- Quản lý token và phiên đăng nhập (logout người dùng nếu cần).
- Đảm bảo bảo mật hệ thống (kiểm soát quyền truy cập, reset mật khẩu).

**Mục tiêu:**

- Cung cấp giao diện quản trị tập trung để quản lý tất cả người dùng, vai trò và quyền.
- Hỗ trợ kiến trúc Role-Based Access Control (RBAC) linh hoạt.
- Cho phép tạo các vai trò tùy chỉnh mà không cần code lại.
- Cung cấp các công cụ để audit log (ghi lại các thay đổi).
- Đảm bảo chỉ các người được phép mới có thể truy cập các chức năng admin.

---

### 2.1.3 Nhân Viên Hệ Thống (Staff / Operator)

**Vai trò:** Nhân viên hỗ trợ vận hành hệ thống, có quyền truy cập hạn chế để thực hiện các tác vụ quản lý cơ bản.

**Nhu cầu:**

- Xem danh sách người dùng và thông tin cơ bản của họ.
- Hỗ trợ người dùng (reset mật khẩu, cập nhật thông tin).
- Xem các vai trò và quyền đã được định nghĩa.
- Không thể tạo/sửa/xóa vai trò hoặc quyền (chỉ xem).
- Không thể thay đổi cấu hình bảo mật cấp cao.

**Mục tiêu:**

- Cung cấp giao diện hạn chế để hỗ trợ người dùng hàng ngày.
- Đảm bảo nhân viên chỉ có quyền truy cập vào chức năng được phân công.
- Không cho phép thay đổi cấu hình bảo mật hoặc vai trò/quyền.

---

## 2.2 Kiến Trúc Phân Quyền Hiện Tại

Hệ thống sử dụng mô hình **Role-Based Access Control (RBAC)** với các thành phần:

- **User (Người Dùng)**: Lưu trữ thông tin cá nhân (id, email, password, name, phone) và được gán một vai trò.
- **Role (Vai Trò)**: Định nghĩa vai trò của người dùng (ADMIN, STAFF, USER, v.v.).
- **Permission (Quyền)**: Định nghĩa các hành động/tính năng cụ thể có thể truy cập (CREATE_USER, DELETE_USER, VIEW_REPORT, v.v.).
- **Role-Permission Mapping**: Mối quan hệ Many-to-Many giữa Role và Permission để gán quyền cho vai trò.

### Mô hình Dữ Liệu:

```
User (N) --[ManyToOne]--> (1) Role
                               |
                               +--[ManyToMany]--> (M) Permission
```

**Đặc điểm hiện tại:**
- Mỗi User chỉ được gán 1 Role (quan hệ ManyToOne).
- Mỗi Role có thể có nhiều Permission (quan hệ ManyToMany).
- Quyền của User được xác định dựa trên Role của họ.
- Sử dụng JWT Token để xác thực, với scope chứa thông tin Role và Permission.

**Lưu ý cải tiến:**
- Nếu cần nhân viên có nhiều vai trò đồng thời, nên refactor quan hệ User-Role thành Many-to-Many.
- Hiện tại đã hỗ trợ các endpoints CRUD cho Role và Permission.

---

## 2.3 API và Endpoint Hiện Tại

### Authentication & User Management:
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Làm mới token
- `POST /auth/logout` - Đăng xuất
- `POST /users` - Đăng ký người dùng
- `PUT /users/{userId}` - Cập nhật thông tin người dùng
- `GET /users` - Lấy danh sách tất cả người dùng (Admin only)
- `GET /users/{userId}` - Lấy thông tin người dùng cụ thể
- `GET /users/myInfo` - Lấy thông tin cá nhân của người dùng hiện tại

### Role Management:
- `POST /roles` - Tạo vai trò mới (Admin only)
- `PUT /roles/{name}` - Cập nhật vai trò (Admin only)
- `DELETE /roles/{role}` - Xóa vai trò (Admin only)
- `GET /roles` - Lấy danh sách tất cả vai trò

### Permission Management:
- `POST /permissions` - Tạo quyền mới (Admin only)
- `PUT /permissions/{name}` - Cập nhật quyền (Admin only)
- `DELETE /permissions/{permissionId}` - Xóa quyền (Admin only)
- `GET /permissions` - Lấy danh sách tất cả quyền

---

## 2.4 Các Module/Chức Năng Có Sẵn

Hệ thống hiện tại đã hỗ trợ:

1. **User Authentication** - Xác thực người dùng (đăng ký, đăng nhập, đăng xuất)
2. **User Management** - Quản lý thông tin người dùng (tạo, cập nhật, xem)
3. **Role Management** - Quản lý vai trò (tạo, cập nhật, xóa, xem)
4. **Permission Management** - Quản lý quyền (tạo, cập nhật, xóa, xem)
5. **JWT Token** - Cấp phát token JWT và làm mới token
6. **Token Invalidation** - Vô hiệu hóa token khi người dùng đăng xuất

---

## 2.5 Các Module/Chức Năng Cần Phát Triển Trong Tương Lai

Nếu muốn mở rộng hệ thống để phục vụ các ứng dụng khác:

1. **Audit Logging** - Ghi lại lịch sử thay đổi (ai, khi nào, thay đổi gì)
2. **User Activity Tracking** - Theo dõi hoạt động đăng nhập của người dùng
3. **Role Hierarchy** - Hỗ trợ cấp bậc vai trò (super admin > admin > staff)
4. **Dynamic Permission** - Hỗ trợ gán quyền trực tiếp cho người dùng ngoài Role
5. **Rate Limiting** - Giới hạn số lần đăng nhập sai
6. **Two-Factor Authentication (2FA)** - Xác thực hai lớp
7. **Email Verification** - Xác thực email khi đăng ký
8. **Password Reset** - Quên mật khẩu và đặt lại
9. **User Deactivation** - Khóa tài khoản người dùng tạm thời
10. **API Documentation** - Tài liệu API (Swagger/OpenAPI)

---

## 2.5 Khuyến Nghị Phát Triển Tiếp Theo

### Giai đoạn 1 (Hiện Tại - MVP):
- ✅ Hệ thống xác thực & phân quyền (đã có)
- ✅ API CRUD cho User, Role, Permission (đã có)
- ✅ JWT Token & Logout (đã có)

### Giai đoạn 2 (Nâng cao):
- ⏳ Audit Logging (ghi lại mọi thay đổi User/Role/Permission)
- ⏳ User Activity Tracking (lịch sử đăng nhập)
- ⏳ Password Reset & Email Verification
- ⏳ Two-Factor Authentication (2FA)

### Giai đoạn 3 (Tối ưu):
- ⏳ Role Hierarchy (cấp bậc vai trò)
- ⏳ Dynamic Permission (gán quyền trực tiếp cho User)
- ⏳ Rate Limiting cho đăng nhập
- ⏳ API Documentation (Swagger/OpenAPI)

---

## 2.6 Tóm Tắt Vai Trò và Quyền Đề Xuất

| Nhóm Đối Tượng | Vai Trò | Quyền Chính | Ghi Chú |
|---|---|---|---|
| **Người Dùng Cuối** | USER | VIEW_PROFILE, UPDATE_PROFILE, CHANGE_PASSWORD | Chỉ quản lý thông tin cá nhân |
| **Nhân Viên** | STAFF | VIEW_USERS, VIEW_ROLES, VIEW_PERMISSIONS | Quyền xem, không được tạo/sửa/xóa |
| **Quản Trị** | ADMIN | CREATE_USER, UPDATE_USER, DELETE_USER, CREATE_ROLE, UPDATE_ROLE, DELETE_ROLE, CREATE_PERMISSION, UPDATE_PERMISSION, DELETE_PERMISSION | Quản lý toàn bộ hệ thống |










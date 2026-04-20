Dưới code hiện tại của bạn: POST home/auth/login nhận AuthenticationRequest và trả về APIResponse có result.token + result.isAuthenticated. POST home/auth/refresh nhận RefreshRequest với đúng 1 field: token và cũng trả về result.token. Dưới đây là “mẫu prompt” đầy đủ (payload + headers + ví dụ response) để bạn gửi cho FE team hoặc dùng test Postman/curl.
1. Login (lấy token) Request Method: POST URL: http://localhost:8080/home/auth/login Headers: Content-Type: application/json Body (JSON) (điền theo fields thật trong AuthenticationRequest của bạn; thường là email/password): { "email": "admin", "password": "123456" } Response (ví dụ) { "result": { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....", "isAuthenticated": true } } FE lấy token tại result.token
2. Gọi API cần đăng nhập (gửi token lên backend) Headers Authorization: Bearer <token> Content-Type: application/json (nếu có body) Ví dụ: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</token>
3. Refresh token (khi token hết hạn / bị 401) Request Method: POST URL: http://localhost:8080/home/auth/refresh Headers: Content-Type: application/json Body (JSON) (theo RefreshRequest bạn đang có): { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." } Response (ví dụ) { "result": { "token": "NEW_TOKEN_HERE", "isAuthenticated": true } } FE cập nhật token mới = result.token, rồi retry request trước đó.
4. Logout Request Method: POST URL: http://localhost:8080/home/auth/logout Headers: Content-Type: application/json Body: (tuỳ LogoutRequest của bạn cần field gì; thường là token)

Mô tả thêm 
Về token
- Khi login thành công, backend sẽ trả về một JWT token trong result.token. FE cần lưu token này (thường là localStorage hoặc sessionStorage) để dùng cho các request sau.
- Mỗi request cần đăng nhập phải gửi token mới này trong header Authorization dưới dạng Bearer token và đè token mới trong chỗ lưu.
- Token có thể hết hạn sau một thời gian (ví dụ 15 phút). Khi FE nhận được lỗi 401 Unauthorized, FE nên gọi API refresh để lấy token mới và retry request trước đó. và token mới đó sẽ được lưu đè lên token cũ.
- Và kiểm tra luôn nếu refresh token cũng bị lỗi (ví dụ 401), thì có thể redirect người dùng về trang login để đăng nhập lại.
- Khi logout, FE có thể gọi API logout để backend invalid token (nếu backend có hỗ trợ) và xóa token khỏi chỗ lưu trên FE.
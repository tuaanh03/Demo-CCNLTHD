khi request thiếu attribute bắt buộc, ví dụ:
```json
{
    "username": "testuser",
    "password": "testpassword"
}
thì reponse lại null, nên ta phải ignore null trong APIResponse, sửa lại APIResponse như sau:
```java


2) cài đặt thêm cronjob để xóa các token đã hết hạn trong invalidtoken db
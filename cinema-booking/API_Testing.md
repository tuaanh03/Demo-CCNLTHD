# 📱 POSTMAN API COLLECTION - CINEMA BOOKING

This file contains the main API endpoints for testing the Cinema Booking system. Use these endpoints in Postman or any API client for testing. Replace `{id}` or other path variables as needed.

Base URL currently follows Spring context-path in `application.yml`:

- `http://localhost:8080/home`

---

## Authentication

### Login
- **POST** `/auth/login`
- **Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```
- **Response:** JWT token

---

## User APIs

### Register User
- **POST** `/users`
- **Body (JSON):**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "phone": "0123456789"
}
```

### Update User Status
- **PUT** `/users/{id}/status`
- **Body (JSON):**
```json
{
  "status": "ACTIVE" // or "INACTIVE"
}
```

### Assign Role to User
- **PUT** `/users/{id}/roles`
- **Body (JSON):**
```json
{
  "roleIds": ["roleId1", "roleId2"]
}
```

### Delete User
- **DELETE** `/users/{id}`

---

## Genre APIs

### Get All Genres
- **GET** `/genres`

### Create Genre
- **POST** `/genres`
- **Body (JSON):**
```json
{
  "name": "Action",
  "description": "Action movies"
}
```

### Update Genre
- **PUT** `/genres/{id}`
- **Body (JSON):**
```json
{
  "name": "New Name",
  "description": "New Description"
}
```

### Delete Genre
- **DELETE** `/genres/{id}`

---

## Movie APIs

### Get All Movies
- **GET** `/movies`

### Create Movie
- **POST** `/movies`
- **Body (JSON):**
```json
{
  "title": "Movie Title",
  "description": "Description",
  "duration": "120",
  "releaseDate": "2026-04-05",
  "status": "COMING_SOON",
  "genreId": "genreId"
}
```

### Update Movie
- **PUT** `/movies/{id}`
- **Body (JSON):**
```json
{
  "title": "New Title",
  "description": "New Description",
  "duration": "130",
  "releaseDate": "2026-05-01",
  "status": "NOW_SHOWING",
  "genreId": "genreId"
}
```

### Delete Movie
- **DELETE** `/movies/{id}`

---

## Booking APIs

### Create Booking
- **POST** `/bookings`
- **Body (JSON):**
```json
{
  "userId": "userId",
  "showTimeId": "showTimeId",
  "seatShowTimeIds": ["seatShowTimeId1", "seatShowTimeId2"]
}
```

### Confirm Booking
- **PATCH** `/bookings/{id}/confirm`

### Get User Bookings
- **GET** `/bookings/user/{userId}`

### Cancel Booking
- **DELETE** `/bookings/{id}`

### Flow đề xuất khi test booking
1. Hold ghế trước qua `/seat-holds/reserve`.
2. Tạo booking qua `/bookings` (dùng `seatShowTimeIds` vừa hold).
3. Confirm booking qua `/bookings/{id}/confirm` để chuyển ghế sang `BOOKED`.

---

## Admin Statistics APIs

### Revenue Statistics (day/week/movie)
- **POST** `/admin/statistics/revenue`
- **Auth:** Bearer token role `ADMIN`
- **Body (JSON):**
```json
{
  "fromDate": "2026-04-01",
  "toDate": "2026-04-07",
  "movieId": "optional-movie-id",
  "groupBy": "DAY"
}
```

`groupBy` hỗ trợ: `DAY`, `WEEK`, `MOVIE`

- **Sample Response:**
```json
{
  "code": 1000,
  "result": {
    "fromDate": "2026-04-01",
    "toDate": "2026-04-07",
    "movieId": null,
    "groupBy": "DAY",
    "totalRevenue": 450000,
    "totalBookings": 3,
    "totalTickets": 6,
    "items": [
      {
        "key": "2026-04-06",
        "label": "2026-04-06",
        "movieId": null,
        "movieTitle": null,
        "fromDate": "2026-04-06",
        "toDate": "2026-04-06",
        "bookingCount": 2,
        "ticketCount": 4,
        "revenue": 300000
      }
    ]
  }
}
```

---

## Seat Hold APIs

### Hold Seats
- **POST** `/seat-holds/reserve`
- **Body (JSON):**
```json
{
  "userId": "userId",
  "showTimeId": "showTimeId",
  "seatShowTimeIds": ["seatShowTimeId1", "seatShowTimeId2"],
  "holdDuration": 5
}
```

### Release Hold
- **POST** `/seat-holds/release`
- **Body (JSON):**
```json
["seatShowTimeId1", "seatShowTimeId2"]
```

### Check Hold Valid
- **GET** `/seat-holds/{seatShowTimeId}/valid`

---

## ShowTime APIs

### Get All ShowTimes
- **GET** `/showtimes`

### Create ShowTime
- **POST** `/showtimes`
- **Body (JSON):**
```json
{
  "movieId": "movieId",
  "roomId": "roomId",
  "startTime": "2026-04-05T19:00:00"
}
```

### Update ShowTime
- **PUT** `/showtimes/{id}`
- **Body (JSON):**
```json
{
  "movieId": "movieId",
  "roomId": "roomId",
  "startTime": "2026-04-06T20:00:00"
}
```

### Delete ShowTime
- **DELETE** `/showtimes/{id}`

---

## Room APIs

### Get All Rooms
- **GET** `/rooms`

### Create Room
- **POST** `/rooms`
- **Body (JSON):**
```json
{
  "roomName": "Room 1",
  "totalRows": 10,
  "totalColumns": 15
}
```

### Update Room
- **PUT** `/rooms/{id}`
- **Body (JSON):**
```json
{
  "roomName": "Room 2",
  "totalRows": 12,
  "totalColumns": 18
}
```

### Delete Room
- **DELETE** `/rooms/{id}`

---

## Permission & Role APIs

### Get All Roles
- **GET** `/roles`

### Create Role
- **POST** `/roles`
- **Body (JSON):**
```json
{
  "name": "ADMIN",
  "description": "Administrator"
}
```

### Update Role
- **PUT** `/roles/{id}`
- **Body (JSON):**
```json
{
  "name": "USER",
  "description": "Regular user"
}
```

### Delete Role
- **DELETE** `/roles/{id}`

### Get All Permissions
- **GET** `/permissions`

### Create Permission
- **POST** `/permissions`
- **Body (JSON):**
```json
{
  "name": "CREATE_GENRE",
  "description": "Can create genre"
}
```

### Update Permission
- **PUT** `/permissions/{id}`
- **Body (JSON):**
```json
{
  "name": "UPDATE_GENRE",
  "description": "Can update genre"
}
```

### Delete Permission
- **DELETE** `/permissions/{id}`

---

## Notes
- Most endpoints (except public auth/user endpoints configured in `SecurityConfig`) require Bearer token authentication.
- Replace all `{id}` and other variables with actual values.
- Adjust request bodies as needed for your schema.
- For booking, test theo đúng flow: hold -> create booking -> confirm booking.
- Admin revenue statistics endpoint requires an account with admin role.

---

*Last updated: 2026-04-07*

# Backend Workflow: Seat, Room, Showtime, SeatShowTime

## 1. Entity Relationships & Structure

### Entity Diagram
```
Room
  ├── id (UUID)
  ├── roomName (String - unique)
  ├── totalRows (Integer)
  └── totalColumns (Integer)
      ↓
    Seat (nhiều Seat thuộc 1 Room)
      ├── id (UUID)
      ├── seatRow (String: A, B, C...)
      ├── seatNumber (Integer: 1, 2, 3...)
      ├── type (NORMAL | VIP)
      ├── room_id (FK)
      └── version (Long - optimistic locking)
      
ShowTime
  ├── id (UUID)
  ├── movieId (FK to Movie)
  ├── roomId (FK to Room)
  ├── startTime (LocalDateTime)
  ├── endTime (LocalDateTime)
  └── status (ACTIVE | CANCELLED)
  
SeatShowTime (join table: mối quan hệ N-N giữa Seat và ShowTime)
  ├── id (UUID)
  ├── showtime_id (FK)
  ├── seat_id (FK)
  ├── price (Double) - giá của ghế loại NORMAL/VIP
  ├── status (AVAILABLE | HOLD | BOOKED)
  └── unique constraint: (showtime_id, seat_id)
```

---

## 2. Workflow Flow Chart

### Phase 1: Room & Seat Creation (Tạo Phòng & Ghế)
```
API: POST /rooms
├── Input: RoomRequest { roomName, totalRows, totalColumns }
├── RoomController.createRoom()
│   └── RoomServiceImpl.createRoom()
│       ├── ✅ Validate: roomName không duplicate
│       ├── 💾 Save Room to DB
│       └── ➡️ Call SeatService.createSeatsForRoom(room)
│           └── SeatServiceImpl.createSeatsForRoom()
│               ├── ✅ Validate: không tạo trùng ghế cho phòng
│               ├── 🔄 Generate seats dạng grid:
│               │   - Row: A, B, C... (based on totalRows)
│               │   - Seat Number: 1, 2, 3... (based on totalColumns)
│               │   - Type Logic:
│               │     * VIP: từ hàng (totalRows/3) đến hàng (totalRows*2/3)
│               │     * NORMAL: hàng ngoài còn lại
│               ├── 💾 Save all seats to DB
│               └── ✅ Complete
└── Output: RoomResponse { id, roomName, totalRows, totalColumns }
```

**Example:**
- Room: 10 rows × 15 seats
- VIP Rows: rows 3-7 (từ chỉ số 3 đến 6)
- NORMAL Rows: rows 0-2, 7-9 (hàng đầu và hàng cuối)

---

### Phase 2: ShowTime (Suất Chiếu) Creation (Tạo Suất Chiếu)
```
API: POST /showtimes
├── Input: ShowTimeCreateRequest { movieId, roomId, startTime, endTime }
├── ShowTimeController.createShowTime()
│   └── ShowTimeServiceImpl.createScreening()
│       ├── ✅ Validate Movie exists
│       ├── ✅ Validate Room exists
│       ├── ✅ Validate ShowTime constraints:
│       │   - startTime.date >= movie.releaseDate (không chiếu trước ngày phát hành)
│       │   - endTime > startTime (thời gian kết thúc phải sau thời gian bắt đầu)
│       ├── ✅ Validate No Overlap (quan trọng!):
│       │   - Query: SELECT COUNT(*) FROM ShowTime 
│       │     WHERE roomId = :roomId AND 
│       │     ((startTime < :endTime AND endTime > :startTime))
│       │   - Đảm bảo không có 2 suất chiếu chồng lên nhau trong cùng phòng
│       ├── 💾 Save ShowTime with status = ACTIVE
│       └── ➡️ Call SeatShowTimeService.createSeatShowTime(showTime, room)
│           └── SeatShowTimeServiceImpl.createSeatShowTime()
│               ├── ✅ Validate: không tạo SeatShowTime trùng cho suất chiếu này
│               ├── 🔄 Get all Seats của Room
│               ├── 📊 Create SeatShowTime cho mỗi Seat:
│               │   - showtime_id = suất chiếu mới
│               │   - seat_id = từng ghế
│               │   - status = AVAILABLE (lúc đầu tất cả ghế đều trống)
│               │   - price = 100,000 (nếu VIP) | 150,000 (nếu NORMAL)
│               │   ⚠️  Note: VIP price < NORMAL price (có lỗi logic?)
│               ├── 💾 Save all SeatShowTime to DB
│               └── ✅ Complete
└── Output: ShowTimeResponse { id, movieId, roomId, startTime, endTime, status }
```

**Key Constraint:**
- Overlap check dùng SQL: `startTime < :endTime AND endTime > :startTime`
- Này đảm bảo 2 showtime không được chồng lấp thời gian trong cùng phòng

---

### Phase 3: Get Seat Status by ShowTime (Lấy Trạng Thái Ghế)
```
API: GET /seat-showtimes/{showTimeId}
├── SeatShowTimeController.getSeatStatusByShowTimeId()
│   └── SeatShowTimeServiceImpl.getSeatStatusByShowTimeId()
│       ├── 🔍 Find: List<SeatShowTime> by showTimeId
│       ├── 📝 Map to Response:
│       │   for each SeatShowTime:
│       │     - seatCode = seat.seatRow + seat.seatNumber (e.g., "A1", "A2", "B5")
│       │     - status = "AVAILABLE" | "HOLD" | "BOOKED"
│       │     - price = giá ghế (nếu cần)
│       └── Output: List<SeatShowTimeResponse>
└── Response Example:
    [
      { id: "xxx", seatCode: "A1", status: "AVAILABLE", price: 150000 },
      { id: "yyy", seatCode: "A2", status: "BOOKED" },
      { id: "zzz", seatCode: "B1", status: "HOLD" }
    ]
```

---

### Phase 4: Update Seat Price (Cập Nhật Giá Ghế)
```
API: PATCH /seat-showtimes/{showTimeId}
├── Input: SeatTypeUpdateRequest { seatType (NORMAL|VIP), price }
├── SeatShowTimeController.updateSeatPriceByShowTimeId()
│   └── SeatShowTimeServiceImpl.updateSeatPrice()
│       ├── 🔍 Find: List<SeatShowTime> by showTimeId
│       ├── 🔄 Update price for matching seat type:
│       │   for each SeatShowTime:
│       │     if seatShowTime.seat.type == seatType:
│       │       seatShowTime.price = newPrice
│       ├── 💾 Save all updated SeatShowTime
│       └── ✅ Complete
└── Output: APIResponse { message: "Seat price updated successfully" }
```

**Example:**
- Request: PATCH /seat-showtimes/showtime-123 with { seatType: "VIP", price: 200000 }
- Effect: Tất cả ghế loại VIP của suất chiếu này sẽ có giá 200,000

---

## 3. Enum Definitions

### SeatType
```java
enum SeatType {
    NORMAL,    // hàng ngoài, giá cao hơn
    VIP        // hàng giữa, giá thấp hơn
             // ⚠️ Note: Logic giá có vẻ bị ngược (VIP: 100k, NORMAL: 150k)
}
```

### SeatStatus
```java
enum SeatStatus {
    AVAILABLE,  // ghế trống, có thể đặt
    HOLD,       // ghế được giữ (trong quá trình đặt)
    BOOKED      // ghế đã được đặt
}
```

### ShowTimeStatus
```java
enum ShowTimeStatus {
    ACTIVE,     // suất chiếu đang hoạt động
    CANCELLED   // suất chiếu bị hủy
}
```

---

## 4. Database Schema

```sql
-- Room table
CREATE TABLE room (
    id VARCHAR(36) PRIMARY KEY,
    room_name VARCHAR(255) NOT NULL UNIQUE,
    total_rows INTEGER NOT NULL,
    total_columns INTEGER NOT NULL
);

-- Seat table
CREATE TABLE seat (
    id VARCHAR(36) PRIMARY KEY,
    seat_row VARCHAR(1) NOT NULL,
    seat_number INTEGER NOT NULL,
    type ENUM('NORMAL', 'VIP') NOT NULL,
    room_id VARCHAR(36) NOT NULL,
    version BIGINT,
    FOREIGN KEY (room_id) REFERENCES room(id),
    INDEX idx_room_id (room_id)
);

-- ShowTime table
CREATE TABLE showtime (
    id VARCHAR(36) PRIMARY KEY,
    movie_id VARCHAR(36) NOT NULL,
    room_id VARCHAR(36) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('ACTIVE', 'CANCELLED') NOT NULL,
    FOREIGN KEY (movie_id) REFERENCES movie(id),
    FOREIGN KEY (room_id) REFERENCES room(id),
    INDEX idx_room_id (room_id),
    INDEX idx_movie_id (movie_id)
);

-- SeatShowTime table (join table - quantity N:N)
CREATE TABLE seat_showtime (
    id VARCHAR(36) PRIMARY KEY,
    showtime_id VARCHAR(36) NOT NULL,
    seat_id VARCHAR(36) NOT NULL,
    price DOUBLE NOT NULL,
    status ENUM('AVAILABLE', 'HOLD', 'BOOKED') NOT NULL,
    FOREIGN KEY (showtime_id) REFERENCES showtime(id),
    FOREIGN KEY (seat_id) REFERENCES seat(id),
    UNIQUE KEY uk_showtime_seat (showtime_id, seat_id)
);
```

---

## 5. Key Business Logic

### 5.1 Seat Generation Logic
```java
int totalRows = 10;
int totalColumns = 15;

for (int i = 0; i < totalRows; i++) {
    for (int j = 1; j <= totalColumns; j++) {
        String row = String.valueOf((char) ('A' + i));  // A, B, C...
        int number = j;  // 1, 2, 3...
        
        // VIP Logic: từ row 3 đến row 6 (trong trường hợp 10 rows)
        if (i >= totalRows / 3 && i <= (totalRows * 2 / 3)) {
            type = SeatType.VIP;
        } else {
            type = SeatType.NORMAL;
        }
    }
}
```

### 5.2 ShowTime Overlap Check
```sql
-- Không được phép 2 suất chiếu chồng lấp trong cùng phòng
SELECT EXISTS (
    SELECT 1 FROM showtime 
    WHERE room_id = 'room-123' 
    AND start_time < '2024-12-31 18:00' 
    AND end_time > '2024-12-31 14:00'
);
-- Trả về TRUE = có overlap (lỗi), FALSE = không overlap (OK)
```

### 5.3 SeatShowTime Creation
```java
// Khi tạo ShowTime, cần tạo record SeatShowTime cho TẤT CẢ ghế
// Các ghế lúc đầu với giá tùy loại:
SeatShowTime {
    id: "UUID",
    showtime_id: "showtime-123",
    seat_id: "seat-A1",
    price: 100000 (VIP) hoặc 150000 (NORMAL),
    status: AVAILABLE  // ban đầu tất cả ghế đều trống
}
```

---

## 6. Service Layer Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   API Layer (Controller)                │
├────────┬───────────────┬──────────────┬─────────────────┤
│ Room   │  ShowTime     │ SeatShowTime │ Seat           │
│/rooms  │ /showtimes    │/seat-showtime│(not exposed?)  │
└────┬───┴────┬──────────┴──────┬───────┴─────────────────┘
     │        │                 │
┌────▼────┬───▼──────────┬──────▼──────────────────────┐
│  Room   │  ShowTime    │  SeatShowTime              │
│ Service │  Service     │  Service                   │
├────┬────┼───┬──────────┼──────┬─────────────────────┤
│    │    │   │          │      │                     │
│   ┌▼────┘   │          │      │                     │
│   │ Seat    │          │      │                     │
│   │Service◄─┤          │      │                     │
│   └─────────┘          │      │                     │
└────┬───────────┬───────┴──────┴─────────────────────┘
     │           │
┌────▼───────────▼─────────────────────────────────────┐
│           Repository Layer (JPA)                      │
├──────────┬──────────────┬──────────────┬──────────────┤
│SeatRepo  │ RoomRepo     │ShowTimeRepo  │SeatShowTime │
│          │              │              │Repo         │
└──────────┴──────────────┴──────────────┴──────────────┘
           │
           ▼
      Database (MySQL)
```

---

## 7. Data Flow Examples

### Example 1: Tạo phòng chiếu mới
```
Request:
POST /rooms
{
  "roomName": "P1",
  "totalRows": 10,
  "totalColumns": 15
}

Flow:
1. RoomController.createRoom() nhận request
2. RoomServiceImpl.createRoom():
   - Lưu Room: P1, 10 rows, 15 columns → DB
   - Gọi SeatService.createSeatsForRoom(room)
3. SeatServiceImpl.createSeatsForRoom():
   - Tạo 150 ghế (10 × 15)
   - Hàng A-C: NORMAL
   - Hàng D-G: VIP
   - Hàng H-J: NORMAL
   - Lưu 150 Seat records → DB
4. Return RoomResponse

Response:
{
  "id": "uuid-123",
  "roomName": "P1",
  "totalRows": 10,
  "totalColumns": 15
}
```

### Example 2: Tạo suất chiếu mới
```
Request:
POST /showtimes
{
  "movieId": "movie-456",
  "roomId": "room-123",
  "startTime": "2024-12-31T14:00:00",
  "endTime": "2024-12-31T16:30:00"
}

Flow:
1. ShowTimeController.createShowTime() nhận request
2. ShowTimeServiceImpl.createScreening():
   - Validate movie exists ✓
   - Validate room exists ✓
   - Validate startTime >= movie.releaseDate ✓
   - Validate endTime > startTime ✓
   - Validate không overlap: (room-123, 14:00-16:30) ✓
   - Lưu ShowTime: movie-456, room-123, 14:00-16:30, ACTIVE → DB
   - Gọi SeatShowTimeService.createSeatShowTime(showTime, room)
3. SeatShowTimeServiceImpl.createSeatShowTime():
   - Lấy 150 Seat từ room-123
   - Tạo 150 SeatShowTime record:
     - Ghế NORMAL: price = 150k, status = AVAILABLE
     - Ghế VIP: price = 100k, status = AVAILABLE
   - Lưu 150 SeatShowTime records → DB
4. Return ShowTimeResponse

Response:
{
  "id": "showtime-789",
  "movieId": "movie-456",
  "roomId": "room-123",
  "startTime": "2024-12-31T14:00:00",
  "endTime": "2024-12-31T16:30:00",
  "status": "ACTIVE"
}

DB Result: Bây giờ có 150 ghế trong suất chiếu này (status = AVAILABLE)
```

### Example 3: Lấy trạng thái ghế của suất chiếu
```
Request:
GET /seat-showtimes/showtime-789

Response:
[
  { "id": "sst-1", "seatCode": "A1", "status": "AVAILABLE", "price": 150000 },
  { "id": "sst-2", "seatCode": "A2", "status": "BOOKED" },
  { "id": "sst-3", "seatCode": "A3", "status": "AVAILABLE", "price": 150000 },
  { "id": "sst-4", "seatCode": "D1", "status": "AVAILABLE", "price": 100000 }, // VIP
  ...
]
```

### Example 4: Cập nhật giá ghế VIP
```
Request:
PATCH /seat-showtimes/showtime-789
{
  "seatType": "VIP",
  "price": 200000
}

Flow:
1. SeatShowTimeController.updateSeatPriceByShowTimeId() nhận request
2. SeatShowTimeServiceImpl.updateSeatPrice():
   - Lấy 150 SeatShowTime của showtime-789
   - Cập nhật price = 200K cho các SeatShowTime có type = VIP
   - Lưu 150 records → DB
3. Return APIResponse

Result: Tất cả ghế VIP (hàng D-G) trong suất chiếu này giờ có giá 200k
```

---

## 8. Important Notes & Issues

### ⚠️ Issue: VIP Price < NORMAL Price
```java
SeatShowTime sst = seats.stream().map(seat -> 
    SeatShowTime.builder()
        .price(
            switch(seat.getType()) {
                case VIP ->  100000.0;      // ❌ Thấp hơn NORMAL
                case NORMAL -> 150000.0;    // ❌ Cao hơn VIP
            }
        )
        .build()
).toList();
```
**Suggestion:** Đảo ngược giá hoặc kiểm tra lại logic

### 📌 Design Pattern
- **Service + Repository Pattern**: Separation of concerns
- **DTO Pattern**: Request/Response DTO để tách biệt external API từ internal entities
- **Mapper Pattern**: Dùng MapStruct (từ import) để map Entity ↔ DTO
- **Transactional**: @Transactional trên các service dùng cho multi-step operations

### 🔒 Concurrency Control
- Seat entity có `@Version` field → Optimistic locking
- Prevent race condition khi update seat status

### ✅ Validations Done
- Room name unique
- Movie must exist
- Room must exist
- Showtime không overlap
- Showtime không chiếu trước ngày phát hành phim
- EndTime > StartTime
- SeatShowTime không bị duplicate (unique constraint)

---

## 9. API Summary

| Method | Endpoint | Request | Response | Purpose |
|--------|----------|---------|----------|---------|
| POST | /rooms | RoomRequest | RoomResponse | Tạo phòng chiếu |
| POST | /showtimes | ShowTimeCreateRequest | ShowTimeResponse | Tạo suất chiếu |
| GET | /seat-showtimes/{id} | - | List<SeatShowTimeResponse> | Lấy danh sách ghế của suất chiếu |
| PATCH | /seat-showtimes/{id} | SeatTypeUpdateRequest | APIResponse | Cập nhật giá ghế theo loại |

---

## 10. Luồng Hoạt Động Tổng Quát

```
1️⃣  ADMIN Tạo Phòng Chiếu
    ↓
    POST /rooms → Tạo Room + 150 Seat (NORMAL/VIP)

2️⃣  ADMIN Tạo Suất Chiếu
    ↓
    POST /showtimes → Tạo ShowTime + 150 SeatShowTime (AVAILABLE)

3️⃣  ADMIN Xem & Cập Nhật Giá Ghế
    ↓
    GET /seat-showtimes/{id} → Xem trạng thái ghế
    PATCH /seat-showtimes/{id} → Cập nhật giá theo loại ghế

4️⃣  USER Đặt Vé (Booking - chưa implement)
    ↓ 
    Cần: BookingService để cập nhật SeatShowTime.status từ AVAILABLE → HOLD/BOOKED
    
5️⃣  USER Xem Ghế Trống
    ↓
    GET /seat-showtimes/{id} → Xem danh sách ghế + status + price
```

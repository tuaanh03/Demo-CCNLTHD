# Frontend Architecture Design - Seat & Showtime Feature

## 1. Data Flow & Component Structure

```
App
├── ScreeningList (GET /showtimes → hiển thị danh sách suất chiếu)
│   └── ShowtimeCard (từng suất chiếu)
│       └── onClick → navigate to SeatSelection
│
└── SeatSelection (GET /showtimes/{id} + GET /seat-showtimes/{id})
    ├── ShowtimeHeader (hiển thị info: movie, room, time, price)
    └── SeatMap (hiển thị sơ đồ ghế)
        ├── SeatRow (từng hàng ghế)
        │   └── SeatButton (từng ghế)
        └── Legend (AVAILABLE, BOOKED, HOLD, SELECTED)
```

---

## 2. API Integration Points

### 2.1 Service Layer Updates
```typescript
// src/services/api.ts - Thêm showtimeService

export const showtimeService = {
    // Lấy tất cả suất chiếu
    getAllShowtimes: (): Promise<AxiosResponse<APIResponse<ShowTimeResponse[]>>> 
        => axiosInstance.get<APIResponse<ShowTimeResponse[]>>('/showtimes'),
    
    // Lấy chi tiết 1 suất chiếu
    getShowtimeById: (id: string): Promise<AxiosResponse<APIResponse<ShowTimeResponse>>> 
        => axiosInstance.get<APIResponse<ShowTimeResponse>>(`/showtimes/${id}`),
    
    // Lấy danh sách ghế & trạng thái của suất chiếu
    getSeatsByShowtime: (showtimeId: string): Promise<AxiosResponse<APIResponse<SeatShowTimeResponse[]>>> 
        => axiosInstance.get<APIResponse<SeatShowTimeResponse[]>>(`/seat-showtimes/${showtimeId}`),
    
    // Cập nhật giá ghế
    updateSeatPrice: (showtimeId: string, seatType: 'NORMAL' | 'VIP', price: number): Promise<AxiosResponse<APIResponse<void>>>
        => axiosInstance.patch<APIResponse<void>>(`/seat-showtimes/${showtimeId}`, { seatType, price }),
};
```

---

## 3. Type Definitions

### 3.1 New Types (src/types/index.ts)
```typescript
// ShowTime Response (từ backend)
export interface ShowTimeResponse {
    id: string;
    movieId: string;
    roomId: string;
    startTime: string;  // ISO DateTime: "2024-12-31T14:00:00"
    endTime: string;    // ISO DateTime: "2024-12-31T16:30:00"
    status: 'ACTIVE' | 'CANCELLED';
}

// SeatShowTime Response (từ backend)
export interface SeatShowTimeResponse {
    id: string;
    seatCode: string;   // "A1", "A2", "B5"
    status: 'AVAILABLE' | 'BOOKED' | 'HOLD';
    price: number;  // 150000 hoặc 100000
}

// Extended ShowTime (kết hợp với Movie & Room info)
export interface ShowTimeDetail extends ShowTimeResponse {
    movie?: Movie;      // thêm movie info
    room?: Room;        // thêm room info
}

// Room Info
export interface Room {
    id: string;
    roomName: string;
    totalRows: number;
    totalColumns: number;
}

// Grouped Seat Data (cho SeatMap)
export interface SeatRow {
    row: string;        // "A", "B", "C"
    seats: SeatShowTimeResponse[];
}
```

---

## 4. Component Design

### 4.1 ScreeningList Component
```typescript
// Path: src/pages/ScreeningList.tsx
// Purpose: Hiển thị danh sách suất chiếu

Props: {
    movieId: string;  (từ URL params)
}

State: {
    showtimes: ShowTimeResponse[];
    loading: boolean;
    error: string;
}

Flow:
1. Mount → GET /showtimes & GET /movies/{movieId}
2. Render danh sách ShowtimeCard
3. Click card → navigate to /movie/{movieId}/showtime/{showtimeId}/seats
4. Poll every 5s để update trạng thái ghế trống
```

**UI:**
```
┌─────────────────────────────────────────┐
│  🎬 Movie Name                          │
│  ────────────────────────────────────   │
│  ┌───────────────────────────────────┐  │
│  │ 14:00 - 16:30 | Room P1 | 45 seats │ ← Thửa chiếu 1
│  │ Status: ACTIVE | Price: 150k       │
│  │ [Select] ────────────────────────  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 18:00 - 20:30 | Room P1 | 42 seats │ ← Suất chiếu 2
│  │ Status: ACTIVE | Price: 150k       │
│  │ [Select] ────────────────────────  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 4.2 SeatSelection Component
```typescript
// Path: src/pages/SeatSelection.tsx
// Purpose: Chọn ghế & xem sơ đồ

Props: {
    movieId: string;    (từ URL)
    showtimeId: string; (từ URL)
}

State: {
    showtime: ShowTimeDetail;
    seats: SeatShowTimeResponse[];
    selectedSeats: SeatShowTimeResponse[];  (support multiple seats)
    loading: boolean;
}

Flow:
1. Mount → GET /showtimes/{id} + GET /seat-showtimes/{id}
2. Render ShowtimeHeader + SeatMap
3. Click ghế → add to selectedSeats
4. [Book Now] → SeatShowTime.status = HOLD → proceed to booking
```

### 4.3 ShowtimeHeader Component (NEW)
```typescript
// Path: src/components/ShowtimeHeader.tsx
// Purpose: Hiển thị thông tin header

Props: {
    showtime: ShowTimeDetail;
}

Render:
├── Movie Title
├── Room Name
├── Date & Time (format: "Thursday, Dec 31, 2024 | 14:00 - 16:30")
├── Available Seats Count
└── Price Range (100k - 150k)
```

### 4.4 SeatMap Component (REFACTOR)
```typescript
// Path: src/components/SeatMap.tsx
// Purpose: Hiển thị sơ đồ chỗ ngồi

Props: {
    seats: SeatShowTimeResponse[];
    selectedSeats: SeatShowTimeResponse[];
    onSelectSeat: (seat: SeatShowTimeResponse) => void;
}

Structure:
├── Legend (4 loại: AVAILABLE, BOOKED, HELD, SELECTED)
├── Seat Grid
│   ├── SeatRow "A" [1] [2] [3] ...
│   ├── SeatRow "B" [1] [2] [3] ...
│   ├── SeatRow "C" [1] [2] [3] ...
│   ...
└── Price Summary
    ├── Selected: 3 seats
    ├── Total: 450,000 ₫
    └── [Confirm Booking] button

Color Coding:
- AVAILABLE (green): #4caf50
- BOOKED (grey): #e0e0e0
- HOLD (yellow): #ffc107
- SELECTED (orange): #ff6b00
```

### 4.5 SeatButton Component (NEW)
```typescript
// Path: src/components/SeatButton.tsx
// Purpose: Nút để click chọn ghế

Props: {
    seat: SeatShowTimeResponse;
    isSelected: boolean;
    isDisabled: boolean;
    onClick: () => void;
}

Render:
┌──────┐
│ A1   │  ← SeatCode
│ 150k │  ← Price
└──────┘

States:
- AVAILABLE (clickable): green
- BOOKED (disabled): grey
- HOLD (disabled): yellow
- SELECTED (selected): orange
```

---

## 5. Detailed Component Code Structure

### 5.1 Type Updates Flow
```
types/index.ts
├── ShowTimeResponse (from backend)
├── SeatShowTimeResponse (from backend)
├── ShowTimeDetail (extended)
├── Room
└── SeatRow (helper)
```

### 5.2 Service Updates Flow
```
services/api.ts
├── showtimeService.getAllShowtimes()
├── showtimeService.getShowtimeById()
├── showtimeService.getSeatsByShowtime()
└── showtimeService.updateSeatPrice()
```

### 5.3 Page Components
```
pages/
├── ScreeningList.tsx (refactor)
│   └── Calls: showtimeService.getAllShowtimes() + movieService.getMovieById()
│
└── SeatSelection.tsx (refactor)
    └── Calls: showtimeService.getShowtimeById() + showtimeService.getSeatsByShowtime()
```

### 5.4 UI Components
```
components/
├── SeatMap.tsx (refactor)
│   ├── Calls: showtimeService.getSeatsByShowtime()
│   ├── Renders: SeatRow components
│   └── State: selectedSeats[]
│
├── ShowtimeHeader.tsx (new)
│   └── Props: showtime, movie
│
├── SeatButton.tsx (new)
│   └── Props: seat, isSelected, isDisabled
│
└── SeatLegend.tsx (new)
    └── Render: Legend của 4 trạng thái ghế
```

---

## 6. Data Transformation Examples

### 6.1 Transform SeatShowTimeResponse to SeatsByRow
```typescript
// SeatMap sẽ nhận list seats từ API
const seats: SeatShowTimeResponse[] = [
    { id: "sst-1", seatCode: "A1", status: "AVAILABLE", price: 150000 },
    { id: "sst-2", seatCode: "A2", status: "BOOKED", price: 150000 },
    { id: "sst-3", seatCode: "B1", status: "AVAILABLE", price: 100000 },
];

// Transform into grouped by row
const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.seatCode.charAt(0);  // "A", "B"
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
}, {} as Record<string, SeatShowTimeResponse[]>);

// Result:
{
    "A": [
        { seatCode: "A1", status: "AVAILABLE", price: 150000 },
        { seatCode: "A2", status: "BOOKED", price: 150000 }
    ],
    "B": [
        { seatCode: "B1", status: "AVAILABLE", price: 100000 }
    ]
}
```

### 6.2 Calculate Total Price
```typescript
const selectedSeats = [
    { seatCode: "A1", price: 150000 },
    { seatCode: "A3", price: 150000 },
    { seatCode: "B5", price: 100000 }
];

const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
// totalPrice = 400000
```

---

## 7. Routing & Navigation

### 7.1 Route Configuration
```typescript
// src/App.tsx
<Route path="/movies/:movieId" element={<MovieDetail />} />
<Route path="/movies/:movieId/showtimes" element={<ScreeningList />} />
<Route path="/movies/:movieId/showtime/:showtimeId/seats" element={<SeatSelection />} />
<Route path="/booking/confirmation/:bookingId" element={<BookingConfirmation />} />
```

### 7.2 Navigation Flow
```
MovieDetail 
  ↓ (click "Select Showtime")
ScreeningList (lịch chiếu)
  ↓ (click ShowtimeCard)
SeatSelection (chọn ghế)
  ↓ (click "Book Now")
BookingForm (nhập thông tin)
  ↓ (submit)
BookingConfirmation (xác nhận)
```

---

## 8. State Management Strategy

### Option A: React Context (recommended for simple flow)
```typescript
// context/ShowtimeContext.tsx
export interface ShowtimeContextType {
    selectedShowtime: ShowTimeDetail | null;
    selectedSeats: SeatShowTimeResponse[];
    setSelectedShowtime: (showtime: ShowTimeDetail) => void;
    addSelectedSeat: (seat: SeatShowTimeResponse) => void;
    removeSelectedSeat: (seatId: string) => void;
    clearSelection: () => void;
}

export const ShowtimeProvider = ({ children }) => {
    const [selectedShowtime, setSelectedShowtime] = useState<ShowTimeDetail | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<SeatShowTimeResponse[]>([]);
    
    const addSelectedSeat = (seat: SeatShowTimeResponse) => {
        setSelectedSeats([...selectedSeats, seat]);
    };
    
    const removeSelectedSeat = (seatCode: string) => {
        setSelectedSeats(selectedSeats.filter(s => s.seatCode !== seatCode));
    };
    
    return (
        <ShowtimeContext.Provider value={{
            selectedShowtime,
            selectedSeats,
            setSelectedShowtime,
            addSelectedSeat,
            removeSelectedSeat,
            clearSelection
        }}>
            {children}
        </ShowtimeContext.Provider>
    );
};
```

### Option B: Redux (if app grows complex)
```
store/
├── slices/
│   ├── showtimeSlice.ts
│   └── seatSelectionSlice.ts
└── store.ts
```

---

## 9. Polling & Real-time Updates

### 9.1 Polling Strategy
```typescript
useEffect(() => {
    // Poll seats every 3-5 seconds to update HOLD/BOOKED status
    const pollInterval = setInterval(() => {
        showtimeService.getSeatsByShowtime(showtimeId)
            .then(res => setSeats(res.data.result));
    }, 5000);
    
    return () => clearInterval(pollInterval);
}, [showtimeId]);
```

### 9.2 Real-time Updates (Optional - WebSocket)
```typescript
// Future enhancement: WebSocket for real-time seat updates
// socketService.subscribe(`showtime/${showtimeId}`)
//     .on('seatStatusChanged', (seat) => {
//         updateSeatInState(seat);
//     });
```

---

## 10. Error Handling & Validation

### 10.1 Validation Rules
```typescript
// Before booking
if (!selectedSeats || selectedSeats.length === 0) {
    throw new Error("Please select at least one seat");
}

if (selectedSeats.some(s => s.status !== 'AVAILABLE')) {
    throw new Error("One or more selected seats are no longer available");
}

if (showtime.status === 'CANCELLED') {
    throw new Error("This showtime has been cancelled");
}
```

### 10.2 Error Messages
```typescript
const errorMessages: Record<string, string> = {
    'SEAT_NOT_AVAILABLE': "Selected seat is no longer available",
    'SHOWTIME_CANCELLED': "This showtime has been cancelled",
    'NETWORK_ERROR': "Connection failed. Please try again.",
    'UNAUTHORIZED': "Please log in to proceed with booking"
};
```

---

## 11. Performance Optimization

### 11.1 Memo & Optimization
```typescript
// Prevent re-renders of SeatButton
export const SeatButton = React.memo(({ seat, isSelected, onClick }) => {
    return (
        <button
            className={isSelected ? 'selected' : ''}
            onClick={onClick}
            disabled={seat.status !== 'AVAILABLE'}
        >
            {seat.seatCode}
        </button>
    );
});
```

### 11.2 Lazy Loading
```typescript
const MovieDetail = React.lazy(() => import('./pages/MovieDetail'));
const SeatSelection = React.lazy(() => import('./pages/SeatSelection'));

<Suspense fallback={<LoadingSpinner />}>
    <SeatSelection />
</Suspense>
```

---

## 12. UI/UX Considerations

### 12.1 Visual Feedback
- ✅ Seat selection highlight (orange)
- ✅ Disabled state for booked seats (grey)
- ✅ Hover effects on available seats
- ✅ Loading spinner during data fetch
- ✅ Real-time price update
- ✅ Toast notifications for errors

### 12.2 Accessibility
- 🔑 Keyboard navigation (arrow keys to select seats)
- 📱 Mobile responsive (grid adjusts for smaller screens)
- ♿ ARIA labels for screen readers
- 🔤 High contrast colors

---

## 13. Testing Strategy

### 13.1 Unit Tests
```typescript
// __tests__/components/SeatButton.test.tsx
describe('SeatButton', () => {
    test('should render seat code and price', () => {
        const seat: SeatShowTimeResponse = {
            id: '1',
            seatCode: 'A1',
            status: 'AVAILABLE',
            price: 150000
        };
        render(<SeatButton seat={seat} isSelected={false} onClick={() => {}} />);
        expect(screen.getByText('A1')).toBeInTheDocument();
    });
});
```

### 13.2 Integration Tests
```typescript
// __tests__/pages/SeatSelection.test.tsx
describe('SeatSelection Page', () => {
    test('should load seats and display them', async () => {
        // Mock API
        // Render component
        // Assert rendered seats
    });
});
```

---

## 14. Summary of Files to Create/Update

### Files to Create:
- ✨ `src/services/showtimeService.ts` (extract from api.ts)
- ✨ `src/components/ShowtimeHeader.tsx` (new)
- ✨ `src/components/SeatButton.tsx` (new)
- ✨ `src/components/SeatLegend.tsx` (new)
- ✨ `src/context/ShowtimeContext.tsx` (optional)

### Files to Update:
- 📝 `src/types/index.ts` (add new interfaces)
- 📝 `src/services/api.ts` (add showtimeService)
- 📝 `src/pages/ScreeningList.tsx` (refactor)
- 📝 `src/pages/SeatSelection.tsx` (refactor)
- 📝 `src/components/SeatMap.tsx` (refactor)


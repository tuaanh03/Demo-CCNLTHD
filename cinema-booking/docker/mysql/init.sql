-- Create tables
CREATE TABLE movie (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(50),
    description TEXT,
    ticket_price DOUBLE NOT NULL
);

CREATE TABLE showTime (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    screening_time DATETIME NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    version BIGINT DEFAULT 0,
    FOREIGN KEY (movie_id) REFERENCES movie(id)
);

CREATE TABLE seat (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    screening_id BIGINT NOT NULL,
    seat_row VARCHAR(5) NOT NULL,
    seat_number VARCHAR(5) NOT NULL,
    status VARCHAR(20) NOT NULL,
    version BIGINT DEFAULT 0,
    FOREIGN KEY (screening_id) REFERENCES showTime(id)
);

CREATE TABLE booking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    seat_id BIGINT NOT NULL,
    booking_time DATETIME NOT NULL,
    expiration_time DATETIME,
    status VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    version BIGINT DEFAULT 0,
    total_price DOUBLE NOT NULL,
    FOREIGN KEY (seat_id) REFERENCES seat(id)
);

-- Create sample movies
INSERT INTO movie (title, genre, description, ticket_price) VALUES
('Avengers: Endgame', 'Action', 'The epic conclusion to the Infinity Saga', 120000),
('The Dark Knight', 'Action', 'Batman faces his greatest challenge', 100000),
('Inception', 'Sci-Fi', 'A thief who steals corporate secrets through dream-sharing technology', 110000),
('Titanic', 'Romance', 'A seventeen-year-old aristocrat falls in love with a kind but poor artist', 90000),
('The Shawshank Redemption', 'Drama', 'Two imprisoned men bond over a number of years', 95000);

-- Create sample showTimes (We'll add showTimes for today and tomorrow)
SET @today = CURDATE();
SET @tomorrow = DATE_ADD(@today, INTERVAL 1 DAY);

-- Screenings for Avengers: Endgame
INSERT INTO showTime (movie_id, screening_time, total_seats, available_seats, version)
SELECT 1, TIMESTAMP(CURDATE(), '10:00:00'), 100, 100, 0
UNION ALL
SELECT 1, TIMESTAMP(CURDATE(), '14:00:00'), 100, 100, 0
UNION ALL
SELECT 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'), 100, 100, 0;

-- Screenings for The Dark Knight
INSERT INTO showTime (movie_id, screening_time, total_seats, available_seats, version)
SELECT 2, TIMESTAMP(CURDATE(), '11:00:00'), 100, 100, 0
UNION ALL
SELECT 2, TIMESTAMP(CURDATE(), '15:00:00'), 100, 100, 0
UNION ALL
SELECT 2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00'), 100, 100, 0;

-- Create seats for each showTime
INSERT INTO seat (screening_id, seat_row, seat_number, status, version)
SELECT s.id,
       CHAR(65 + (seq.seq DIV 10)), -- Rows from A to J
       (seq.seq MOD 10) + 1,        -- Seats from 1 to 10
       'AVAILABLE',
       0
FROM showTime s
CROSS JOIN (
    SELECT a.N + b.N * 10 as seq
    FROM (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
         (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b
    ORDER BY seq
    LIMIT 100 -- 10 rows × 10 seats
) seq;

#!/usr/bin/env pwsh
# Cinema Booking System - Docker Runner Script

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       Cinema Booking System - Docker Compose Runner           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Menu
Write-Host "Chọn tác vụ:" -ForegroundColor Yellow
Write-Host "1. Khởi động hệ thống (Build + Run)" -ForegroundColor White
Write-Host "2. Chạy hệ thống (không build)" -ForegroundColor White
Write-Host "3. Dừng hệ thống" -ForegroundColor White
Write-Host "4. Xem logs" -ForegroundColor White
Write-Host "5. Reset hệ thống (xóa database)" -ForegroundColor White
Write-Host "6. Kiểm tra Docker" -ForegroundColor White
Write-Host "7. Thoát" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập lựa chọn (1-7)"

switch($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Khởi động hệ thống..." -ForegroundColor Green
        Write-Host "⏳ Quá trình này sẽ mất 1-2 phút..." -ForegroundColor Yellow
        Write-Host ""

        docker-compose up --build

        Write-Host ""
        Write-Host "✅ Hệ thống đã khởi động!" -ForegroundColor Green
        Write-Host "📍 API Server: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "📍 Health Check: http://localhost:8080/actuator/health" -ForegroundColor Cyan
        Write-Host "📍 Adminer: http://localhost:8081" -ForegroundColor Cyan
    }

    "2" {
        Write-Host ""
        Write-Host "🚀 Chạy hệ thống..." -ForegroundColor Green
        docker-compose up

        Write-Host ""
        Write-Host "✅ Hệ thống đang chạy!" -ForegroundColor Green
    }

    "3" {
        Write-Host ""
        Write-Host "⛔ Dừng hệ thống..." -ForegroundColor Red
        docker-compose down
        Write-Host "✅ Hệ thống đã dừng!" -ForegroundColor Green
    }

    "4" {
        Write-Host ""
        Write-Host "📋 Xem logs..." -ForegroundColor Yellow
        Write-Host "Các lựa chọn:" -ForegroundColor White
        Write-Host "1. Logs của App (Spring Boot)" -ForegroundColor White
        Write-Host "2. Logs của MySQL" -ForegroundColor White
        Write-Host "3. Logs của tất cả" -ForegroundColor White
        Write-Host ""

        $logChoice = Read-Host "Nhập lựa chọn (1-3)"

        switch($logChoice) {
            "1" { docker-compose logs -f app }
            "2" { docker-compose logs -f mysql }
            "3" { docker-compose logs -f }
            default { Write-Host "Lựa chọn không hợp lệ!" -ForegroundColor Red }
        }
    }

    "5" {
        Write-Host ""
        Write-Host "⚠️  Bạn sắp xóa toàn bộ database!" -ForegroundColor Red
        $confirm = Read-Host "Bạn chắc chứ? (yes/no)"

        if($confirm -eq "yes") {
            Write-Host "🗑️  Xóa database..." -ForegroundColor Red
            docker-compose down -v
            Write-Host "✅ Database đã xóa! Khởi động lại hệ thống để tạo mới..." -ForegroundColor Green
        } else {
            Write-Host "❌ Đã hủy" -ForegroundColor Yellow
        }
    }

    "6" {
        Write-Host ""
        Write-Host "🔍 Kiểm tra Docker..." -ForegroundColor Cyan

        Write-Host ""
        Write-Host "Docker Version:" -ForegroundColor Yellow
        docker --version

        Write-Host ""
        Write-Host "Docker Compose Version:" -ForegroundColor Yellow
        docker-compose --version

        Write-Host ""
        Write-Host "Docker Containers:" -ForegroundColor Yellow
        docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

        Write-Host ""
        Write-Host "Docker Images:" -ForegroundColor Yellow
        docker images | Select-String "cinema"
    }

    "7" {
        Write-Host ""
        Write-Host "👋 Tạm biệt!" -ForegroundColor Green
        exit
    }

    default {
        Write-Host ""
        Write-Host "❌ Lựa chọn không hợp lệ!" -ForegroundColor Red
    }
}

Write-Host ""


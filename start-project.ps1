#!/usr/bin/env pwsh

# 启动项目的PowerShell脚本
# 同时启动前端和后端服务

Write-Host "===========================================" -ForegroundColor Green
Write-Host "JNS订单管理系统启动脚本" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# 检查Node.js是否安装
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "错误: Node.js 未安装，请先安装Node.js" -ForegroundColor Red
    pause
    exit 1
}

# 检查pnpm是否安装
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "错误: pnpm 未安装，请先安装pnpm" -ForegroundColor Red
    pause
    exit 1
}

# 检查Python是否安装
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "错误: Python 未安装，请先安装Python" -ForegroundColor Red
    pause
    exit 1
}

# 启动前端服务
Write-Host "正在启动前端服务..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "j:\shadcn-admin"
    pnpm dev
}

# 等待前端服务启动
Start-Sleep -Seconds 3

# 启动后端服务
Write-Host "正在启动后端服务..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location "j:\shadcn-admin\backend"
    python app/main.py
}

# 等待后端服务启动
Start-Sleep -Seconds 3

Write-Host "===========================================" -ForegroundColor Green
Write-Host "服务启动完成！" -ForegroundColor Green
Write-Host "前端服务: http://localhost:5173" -ForegroundColor Yellow
Write-Host "后端服务: http://localhost:8000" -ForegroundColor Yellow
Write-Host "后端API文档: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Green
Write-Host "按任意键停止所有服务..." -ForegroundColor White

# 等待用户输入
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

# 停止服务
Write-Host "正在停止服务..." -ForegroundColor Cyan
Stop-Job $frontendJob
Stop-Job $backendJob
Remove-Job $frontendJob
Remove-Job $backendJob

Write-Host "所有服务已停止！" -ForegroundColor Green
pause

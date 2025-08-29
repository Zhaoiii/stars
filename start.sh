#!/bin/bash

echo "启动 BA System 项目..."

# 检查是否安装了 yarn
if ! command -v yarn &> /dev/null; then
    echo "错误: 请先安装 yarn"
    echo "安装命令: npm install -g yarn"
    exit 1
fi

echo "安装依赖..."
yarn install

echo "配置环境变量..."
if [ ! -f "backend/.env" ]; then
    echo "创建后端环境变量文件..."
    cp backend/env.example backend/.env
    echo "环境变量文件已创建，使用端口5001"
fi

echo "启动开发服务器..."
echo "注意: 后端使用端口5001，前端使用端口3000"
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:5001"

# 启动项目
yarn dev

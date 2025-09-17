# 快速启动指南

## 🚀 快速开始

### 1. 环境准备

确保已安装：

- Node.js (推荐 v16+)
- Yarn
- PostgreSQL

### 2. 安装依赖

```bash
yarn install
```

### 3. 配置环境变量

```bash
cp env.example .env
```

编辑 `.env` 文件，配置数据库连接信息。

### 4. 创建数据库

在 PostgreSQL 中创建数据库：

```sql
CREATE DATABASE ba_system;
```

### 5. 初始化管理员用户

```bash
yarn init-admin
```

这将创建一个默认管理员用户：

- 用户名: `admin`
- 密码: `admin123`

### 6. 启动开发服务器

```bash
yarn dev
```

服务器将在 `http://localhost:3000` 启动。

## 📋 API 测试

### 登录测试

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 获取用户信息

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 常用命令

- `yarn dev` - 开发模式启动
- `yarn build` - 构建项目
- `yarn start` - 生产模式启动
- `yarn init-admin` - 初始化管理员用户

## 📁 项目结构

```
backend/
├── src/
│   ├── config/         # 配置文件
│   ├── controllers/    # 控制器
│   ├── entities/       # 数据库实体
│   ├── middleware/     # 中间件
│   ├── routes/         # 路由
│   ├── services/       # 服务层
│   ├── types/          # 类型定义
│   ├── utils/          # 工具函数
│   └── scripts/        # 脚本
├── dist/               # 构建输出
└── package.json
```

## 🎯 下一步

1. 根据需要添加更多功能模块
2. 配置生产环境
3. 添加单元测试
4. 配置 CI/CD



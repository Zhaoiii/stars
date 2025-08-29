# BA System - MERN Stack 项目

一个基于 MERN 技术栈的完整全栈应用，包含用户认证、用户管理和学生管理功能。

## 🚀 技术栈

- **前端**: React 18 + TypeScript + Ant Design + Vite
- **后端**: Node.js + Express + TypeScript + MongoDB + Mongoose
- **认证**: JWT (JSON Web Tokens)
- **包管理**: Yarn (Workspaces)
- **数据库**: MongoDB
- **构建工具**: Vite (前端), ts-node (后端)

## 📁 项目结构

```
ba-system/
├── frontend/                 # React 前端应用
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── contexts/        # React Context
│   │   ├── services/        # API 服务
│   │   ├── types/           # TypeScript 类型定义
│   │   └── main.tsx         # 应用入口
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Express 后端应用
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── controllers/     # 控制器
│   │   ├── middleware/      # 中间件
│   │   ├── models/          # Mongoose 模型
│   │   ├── routes/          # 路由
│   │   ├── scripts/         # 数据库脚本
│   │   ├── types/           # TypeScript 类型定义
│   │   └── index.ts         # 服务器入口
│   ├── package.json
│   └── .env
├── package.json              # 根包配置
├── start.sh                  # 启动脚本
└── README.md
```

## ✨ 功能特性

- 🔐 **用户认证**: 登录/注册系统，JWT 认证
- 👥 **用户管理**: 完整的用户 CRUD 操作，角色管理
- 🎓 **学生管理**: 完整的学生 CRUD 操作，包含姓名、性别、出生年月
- 🔒 **权限控制**: 基于角色的访问控制 (RBAC)
- 📱 **响应式设计**: 支持移动端和桌面端
- 🛡️ **类型安全**: 完整的 TypeScript 支持
- ✅ **表单验证**: 前后端双重验证
- 🎨 **现代 UI**: 基于 Ant Design 的美观界面

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Yarn
- MongoDB

### 1. 克隆项目

```bash
git clone <repository-url>
cd ba-system
```

### 2. 安装依赖

```bash
yarn install
```

### 3. 配置环境变量

复制并配置后端环境变量：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/ba-system
JWT_SECRET=your-secret-key-here
```

### 4. 启动 MongoDB

```bash
# macOS (使用 Homebrew)
brew services start mongodb-community

# 或者手动启动
mongod
```

### 5. 初始化数据库

```bash
# 创建管理员用户
yarn init-db-ts
```

### 6. 启动应用

```bash
# 使用启动脚本（推荐）
./start.sh

# 或手动启动
yarn dev
```

应用将在以下地址运行：

- 前端: http://localhost:3001
- 后端: http://localhost:5001

## 🔑 默认用户

初始化脚本会创建以下默认用户：

- **管理员**:
  - 手机号: `13333333333`
  - 密码: `123123`
  - 角色: 管理员

## 📡 API 端点

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户管理

- `GET /api/users` - 获取所有用户 (需要管理员权限)
- `GET /api/users/:userId` - 获取指定用户 (需要管理员权限)
- `POST /api/users` - 创建新用户 (需要管理员权限)
- `PUT /api/users/:userId` - 更新用户信息 (需要管理员权限)
- `DELETE /api/users/:userId` - 删除用户 (需要管理员权限)
- `PUT /api/users/:userId/role` - 更新用户角色 (需要管理员权限)

### 学生管理

- `GET /api/students` - 获取所有学生 (需要登录)
- `GET /api/students/:studentId` - 获取指定学生 (需要登录)
- `POST /api/students` - 创建新学生 (需要管理员权限)
- `PUT /api/students/:studentId` - 更新学生信息 (需要管理员权限)
- `DELETE /api/students/:studentId` - 删除学生 (需要管理员权限)
- `GET /api/students/search` - 搜索学生 (需要登录)

## 👥 用户角色

### 普通用户

- 查看个人信息
- 查看学生列表
- 搜索学生

### 管理员

- 所有普通用户权限
- 用户管理 (增删改查)
- 学生管理 (增删改查)
- 角色管理

## 🎓 学生管理功能

学生管理模块包含以下特性：

- **基本信息**: 姓名、性别、出生年月
- **自动计算**: 根据出生日期自动计算年龄
- **搜索功能**: 支持按姓名、性别、年龄范围搜索
- **数据验证**: 完整的表单验证和错误处理
- **权限控制**: 只有管理员可以增删改，所有登录用户可以查看

## 🛠️ 开发指南

### 代码规范

- 每个文件不超过 300 行
- 避免使用 `any` 类型
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则

### 文件命名

- 组件文件使用 PascalCase: `UserManagement.tsx`
- 类型文件使用 camelCase: `user.ts`
- 工具文件使用 camelCase: `database.ts`

### 添加新功能

1. 在后端创建模型、控制器、路由
2. 在前端创建类型定义和组件
3. 更新路由配置
4. 添加相应的测试

## 📦 构建和部署

### 开发模式

```bash
yarn dev          # 同时启动前后端
yarn dev:frontend # 仅启动前端
yarn dev:backend  # 仅启动后端
```

### 生产构建

```bash
yarn build        # 构建前端
yarn start        # 启动生产服务器
```

### 部署

1. 构建前端: `yarn build`
2. 配置生产环境变量
3. 启动后端服务器: `yarn start`

## 🔧 故障排除

### 常见问题

1. **端口冲突**

   - 检查端口是否被占用: `lsof -i :5001`
   - 修改 `.env` 文件中的端口号

2. **MongoDB 连接失败**

   - 确保 MongoDB 服务正在运行
   - 检查连接字符串是否正确

3. **前端无法访问后端**

   - 检查 Vite 代理配置
   - 确保后端服务器正在运行

4. **JWT 认证失败**
   - 检查 JWT_SECRET 是否正确设置
   - 清除浏览器本地存储

### 日志查看

```bash
# 查看后端日志
cd backend && yarn dev

# 查看前端日志
cd frontend && yarn dev
```

## 📝 更新日志

- **v1.0.0**: 初始版本，包含用户认证和用户管理
- **v1.1.0**: 添加学生管理功能，完整的 CRUD 操作

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## �� 许可证

MIT License

# BA System Backend

基于 Express + TypeScript + PostgreSQL + TypeORM 的后端 API 系统。

## 功能特性

- ✅ 用户认证和授权
- ✅ 用户管理（增删改查）
- ✅ 角色权限控制（管理员、教师）
- ✅ JWT 令牌认证
- ✅ 密码加密存储
- ✅ 数据库连接和实体管理
- ✅ 规范的代码结构

## 技术栈

- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: PostgreSQL
- **ORM**: TypeORM
- **认证**: JWT
- **包管理**: Yarn
- **密码加密**: bcryptjs

## 项目结构

```
src/
├── config/          # 配置文件
│   └── database.ts  # 数据库配置
├── controllers/     # 控制器
│   └── UserController.ts
├── entities/        # 数据库实体
│   └── User.ts
├── middleware/      # 中间件
│   └── auth.ts
├── routes/          # 路由
│   ├── index.ts
│   └── userRoutes.ts
├── services/        # 服务层
│   └── UserService.ts
├── types/           # 类型定义
│   └── enums.ts
├── utils/           # 工具函数
│   └── response.ts
└── index.ts         # 应用入口
```

## 安装和运行

### 1. 安装依赖

```bash
yarn install
```

### 2. 配置环境变量

复制 `env.example` 文件为 `.env` 并配置：

```bash
cp env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=ba_system

# JWT 配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 3. 创建数据库

确保 PostgreSQL 服务运行，并创建数据库：

```sql
CREATE DATABASE ba_system;
```

### 4. 运行项目

开发模式：

```bash
yarn dev
```

生产模式：

```bash
yarn build
yarn start
```

## API 接口

### 基础信息

- **基础 URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token

### 用户相关接口

#### 1. 用户登录

- **POST** `/api/users/login`
- **请求体**:
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

#### 2. 获取当前用户信息

- **GET** `/api/users/profile`
- **需要认证**: ✅

#### 3. 创建用户（管理员）

- **POST** `/api/users`
- **需要认证**: ✅
- **需要权限**: 管理员
- **请求体**:
  ```json
  {
    "username": "teacher1",
    "email": "teacher1@example.com",
    "password": "password123",
    "firstName": "张",
    "lastName": "老师",
    "role": "teacher",
    "phone": "13800138000"
  }
  ```

#### 4. 获取所有用户（管理员）

- **GET** `/api/users`
- **需要认证**: ✅
- **需要权限**: 管理员

#### 5. 获取指定用户（管理员）

- **GET** `/api/users/:id`
- **需要认证**: ✅
- **需要权限**: 管理员

#### 6. 更新用户（管理员）

- **PUT** `/api/users/:id`
- **需要认证**: ✅
- **需要权限**: 管理员

#### 7. 删除用户（管理员）

- **DELETE** `/api/users/:id`
- **需要认证**: ✅
- **需要权限**: 管理员

### 健康检查

- **GET** `/api/health`

## 用户角色

- **admin**: 平台管理员，拥有所有权限
- **teacher**: 教师，拥有基础权限

## 开发说明

### 添加新功能

1. 在 `entities/` 中定义数据库实体
2. 在 `services/` 中实现业务逻辑
3. 在 `controllers/` 中处理 HTTP 请求
4. 在 `routes/` 中定义路由
5. 在 `middleware/` 中添加必要的中间件

### 数据库迁移

TypeORM 在开发模式下会自动同步数据库结构。生产环境建议使用迁移文件。

## 注意事项

1. 确保 PostgreSQL 服务正在运行
2. 生产环境请修改 JWT_SECRET 为安全的随机字符串
3. 建议在生产环境中禁用 `synchronize` 选项
4. 定期备份数据库数据



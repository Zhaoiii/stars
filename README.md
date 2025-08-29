# BA System

基于 MERN 技术栈的用户管理系统

## 技术栈

- **前端**: React + TypeScript + Ant Design + Vite
- **后端**: Node.js + Express + TypeScript + MongoDB + Mongoose
- **包管理**: Yarn
- **身份验证**: JWT
- **数据库**: MongoDB

## 项目结构

```
ba-system/
├── frontend/          # React前端
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── contexts/      # 上下文
│   │   ├── services/      # API服务
│   │   ├── types/         # 类型定义
│   │   ├── App.tsx        # 主应用
│   │   └── main.tsx       # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── backend/           # Node.js后端
│   ├── src/
│   │   ├── config/        # 配置
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── types/         # 类型定义
│   │   └── index.ts       # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── package.json       # 根目录配置
├── start.sh          # 启动脚本
└── README.md         # 项目说明
```

## 功能特性

- ✅ 用户注册/登录（手机号+密码）
- ✅ JWT 身份验证
- ✅ 基于角色的权限控制（普通用户/管理员）
- ✅ 完整的用户管理功能（增删改查）
- ✅ 响应式用户界面
- ✅ TypeScript 类型安全
- ✅ 表单验证
- ✅ 错误处理

## 快速开始

### 前置要求

1. **Node.js** (版本 16+)
2. **Yarn** 包管理器
3. **MongoDB** 数据库

### 安装依赖

```bash
# 安装所有依赖（前端+后端）
yarn install
```

### 配置环境变量

1. 复制环境变量示例文件：

```bash
cp backend/env.example backend/.env
```

2. 编辑 `backend/.env` 文件：

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/ba-system
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 启动项目

#### 方式 1: 使用启动脚本（推荐）

```bash
./start.sh
```

#### 方式 2: 手动启动

```bash
# 启动开发环境（前端+后端）
yarn dev

# 或者分别启动
yarn workspace backend dev    # 启动后端
yarn workspace frontend dev   # 启动前端
```

### 访问地址

- **前端**: http://localhost:3000
- **后端**: http://localhost:5001
- **健康检查**: http://localhost:5001/health

## API 接口

### 身份验证

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户管理

- `GET /api/users/profile` - 获取用户资料
- `GET /api/users` - 获取所有用户（管理员）
- `POST /api/users` - 创建新用户（管理员）
- `GET /api/users/:userId` - 获取指定用户信息（管理员）
- `PUT /api/users/:userId` - 更新用户信息（管理员）
- `PATCH /api/users/:userId/role` - 更新用户角色（管理员）
- `DELETE /api/users/:userId` - 删除用户（管理员）

## 用户角色

- **普通用户 (user)**: 可以登录、查看个人信息
- **管理员 (admin)**: 拥有所有权限，可以管理用户

## 用户管理功能

### 创建用户

- 管理员可以通过"创建用户"按钮添加新用户
- 支持设置用户名、手机号、密码和角色
- 自动验证手机号格式和密码长度

### 查看用户

- 显示所有用户的列表信息
- 支持分页和搜索
- 可以查看用户详细信息

### 编辑用户

- 管理员可以修改用户的基本信息
- 支持更新用户名、手机号和角色
- 密码为可选更新项

### 删除用户

- 管理员可以删除用户
- 删除前会有确认提示
- 删除操作不可恢复

## 开发说明

### 代码规范

- 使用 TypeScript，避免使用`any`类型
- 每个文件代码不超过 300 行
- 使用 ESLint 进行代码检查
- 遵循 React Hooks 最佳实践

### 项目构建

```bash
# 构建前端
yarn workspace frontend build

# 构建后端
yarn workspace backend build

# 构建所有
yarn build
```

### 代码检查

```bash
# 检查前端代码
yarn workspace frontend lint

# 检查后端代码
yarn workspace backend lint

# 自动修复
yarn workspace frontend lint:fix
yarn workspace backend lint:fix
```

## 部署

### 生产环境

1. 构建项目：

```bash
yarn build
```

2. 启动后端：

```bash
yarn start
```

3. 部署前端到静态文件服务器

### 环境变量

生产环境需要设置：

- `NODE_ENV=production`
- `JWT_SECRET` - 强密钥
- `MONGODB_URI` - 生产数据库连接

## 故障排除

### 常见问题

1. **MongoDB 连接失败**

   - 确保 MongoDB 服务正在运行
   - 检查连接字符串是否正确

2. **端口被占用**

   - 修改`.env`文件中的端口号
   - 或者停止占用端口的进程

3. **依赖安装失败**

   - 清除缓存：`yarn cache clean`
   - 删除 node_modules：`rm -rf node_modules && yarn install`

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

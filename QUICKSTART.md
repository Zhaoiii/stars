# 快速启动指南

## 🚀 5 分钟快速启动

### 1. 确保环境

```bash
# 检查Node.js版本 (需要16+)
node --version

# 检查yarn是否安装
yarn --version

# 如果没有yarn，安装它
npm install -g yarn
```

### 2. 启动 MongoDB

```bash
# macOS (使用Homebrew)
brew services start mongodb-community

# 或者直接启动
mongod

# 确保MongoDB在27017端口运行
```

### 3. 一键启动项目

```bash
# 给启动脚本执行权限
chmod +x start.sh

# 运行启动脚本
./start.sh
```

### 4. 访问应用

- 前端: http://localhost:3000
- 后端: http://localhost:5000

## 📱 测试账号

### 注册新用户

1. 访问 http://localhost:3000
2. 点击"注册"标签
3. 填写信息：
   - 用户名: testuser
   - 手机号: 13800138000
   - 密码: 123456

### 登录测试

1. 使用手机号和密码登录
2. 查看仪表板功能

## 🔧 手动启动（如果脚本有问题）

```bash
# 1. 安装依赖
yarn install

# 2. 配置环境变量
cp backend/env.example backend/.env
# 编辑 backend/.env 文件

# 3. 启动后端
cd backend
yarn dev

# 4. 新开终端，启动前端
cd frontend
yarn dev
```

## ❗ 常见问题

### 端口被占用

```bash
# 查看端口占用
lsof -i :3000
lsof -i :5000

# 杀死进程
kill -9 <PID>
```

### MongoDB 连接失败

```bash
# 检查MongoDB状态
brew services list | grep mongodb

# 重启MongoDB
brew services restart mongodb-community
```

### 依赖安装失败

```bash
# 清理缓存
yarn cache clean

# 删除node_modules重新安装
rm -rf node_modules frontend/node_modules backend/node_modules
yarn install
```

## 📁 项目结构说明

```
ba-system/
├── frontend/          # React前端 (端口3000)
├── backend/           # Node.js后端 (端口5000)
├── start.sh          # 一键启动脚本
└── README.md         # 详细文档
```

## 🎯 下一步

1. 查看 `README.md` 了解完整功能
2. 探索前端组件和后端 API
3. 根据需要修改和扩展功能
4. 部署到生产环境

## 💡 开发提示

- 前端热重载：修改代码后自动刷新
- 后端热重载：修改代码后自动重启
- 使用 `yarn dev` 同时启动前后端
- 查看控制台日志了解运行状态


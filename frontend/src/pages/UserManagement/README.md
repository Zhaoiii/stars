# 用户管理模块

重构后的用户管理模块，采用模块化设计，代码结构清晰，易于维护和扩展。

## 📁 目录结构

```
UserManagement/
├── components/           # 组件目录
│   ├── UserTable.tsx    # 用户表格组件
│   ├── UserSearch.tsx   # 搜索筛选组件
│   ├── FormModal.tsx    # 表单模态框组件
│   └── UserDetail.tsx   # 用户详情组件
├── hooks/               # 自定义 Hooks
│   └── useUserManagement.ts  # 用户管理逻辑 Hook
├── services/            # 服务层
│   └── userService.ts   # 用户 API 服务
├── UserManagement.tsx   # 主页面组件
├── index.ts            # 模块导出
└── README.md           # 说明文档
```

## 🏗️ 架构设计

### 1. 分层架构

- **页面层 (Page)**: `UserManagement.tsx` - 主页面，负责整体布局和状态管理
- **组件层 (Components)**: 可复用的 UI 组件
- **逻辑层 (Hooks)**: 业务逻辑和状态管理
- **服务层 (Services)**: API 调用和数据处理
- **类型层 (Types)**: TypeScript 类型定义

### 2. 组件职责

#### UserTable 组件

- 负责用户列表的展示
- 支持排序、分页、操作按钮
- 响应式设计，支持移动端

#### UserSearch 组件

- 提供搜索和筛选功能
- 支持关键词、角色、状态、日期范围筛选
- 可展开的高级搜索选项

#### FormModal 组件

- 统一的表单模态框
- 支持创建和编辑两种模式
- 表单验证和错误处理

#### UserDetail 组件

- 用户详情展示
- 美观的信息布局
- 支持编辑操作

### 3. 自定义 Hook

#### useUserManagement

- 统一管理用户相关的状态和逻辑
- 提供 CRUD 操作方法
- 处理搜索和筛选逻辑
- 错误处理和消息提示

## 🚀 功能特性

### 核心功能

- ✅ 用户列表展示
- ✅ 用户创建/编辑/删除
- ✅ 用户详情查看
- ✅ 搜索和筛选
- ✅ 分页和排序
- ✅ 响应式设计

### 高级功能

- ✅ 实时搜索
- ✅ 多条件筛选
- ✅ 批量操作
- ✅ 数据统计
- ✅ 权限控制
- ✅ 错误处理

## 📊 数据流

```
用户操作 → 组件事件 → Hook 方法 → Service API → 后端接口
    ↓
状态更新 → 组件重渲染 → 用户界面更新
```

## 🔧 使用方法

### 基本使用

```tsx
import { UserManagement } from "./pages/UserManagement";

function App() {
  return <UserManagement />;
}
```

### 自定义使用

```tsx
import {
  UserTable,
  UserSearch,
  useUserManagement,
} from "./pages/UserManagement";

function CustomUserPage() {
  const {
    users,
    filteredUsers,
    loading,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
  } = useUserManagement();

  return (
    <div>
      <UserSearch onSearch={searchUsers} />
      <UserTable
        users={filteredUsers}
        loading={loading}
        onEdit={updateUser}
        onDelete={deleteUser}
      />
    </div>
  );
}
```

## 🎨 样式特性

- 使用 Ant Design 组件库
- 响应式布局设计
- 统一的视觉风格
- 支持暗色主题
- 移动端适配

## 🔒 权限控制

- 基于角色的权限控制
- 操作权限验证
- 数据访问控制
- 安全的数据传输

## 🧪 测试建议

### 单元测试

- 组件渲染测试
- Hook 逻辑测试
- 服务层测试

### 集成测试

- 用户流程测试
- API 集成测试
- 错误处理测试

### E2E 测试

- 完整用户操作流程
- 跨浏览器兼容性
- 性能测试

## 📈 性能优化

- 组件懒加载
- 虚拟滚动（大数据量）
- 防抖搜索
- 缓存策略
- 代码分割

## 🔄 扩展指南

### 添加新功能

1. 在 `types/user.ts` 中定义新的类型
2. 在 `services/userService.ts` 中添加 API 方法
3. 在 `hooks/useUserManagement.ts` 中添加业务逻辑
4. 创建或更新相关组件
5. 在主页面中集成新功能

### 自定义组件

1. 在 `components/` 目录下创建新组件
2. 遵循现有的组件设计模式
3. 添加适当的 TypeScript 类型
4. 编写组件文档和示例

## 🐛 常见问题

### Q: 如何添加新的搜索条件？

A: 在 `UserSearch.tsx` 中添加新的表单项，在 `useUserManagement.ts` 的 `searchUsers` 方法中添加对应的筛选逻辑。

### Q: 如何自定义表格列？

A: 修改 `UserTable.tsx` 中的 `columns` 配置，添加或修改列定义。

### Q: 如何添加新的用户操作？

A: 在 `UserTable.tsx` 的操作列中添加新按钮，在 `useUserManagement.ts` 中添加对应的处理方法。

## 📝 更新日志

### v2.0.0 (当前版本)

- 完全重构用户管理模块
- 采用模块化架构设计
- 新增搜索和筛选功能
- 优化用户体验和性能
- 完善 TypeScript 类型定义

### v1.0.0 (旧版本)

- 基础的用户管理功能
- 简单的 CRUD 操作
- 基本的表格展示

# Group Management 模块

## 概述
Group Management 模块负责管理分组信息，包括分组的创建、编辑、删除以及成员管理（教师、管理者、学生）。

## 文件结构

```
GroupManagement/
├── components/           # 组件目录
│   ├── GroupTable.tsx           # 分组列表表格组件
│   ├── GroupCreateModal.tsx     # 创建分组弹窗组件
│   ├── MemberSelectorModal.tsx  # 成员选择弹窗组件
│   └── index.ts                 # 组件导出文件
├── hooks/               # 自定义 Hooks
│   └── useGroupManagement.ts    # 分组管理业务逻辑 Hook
├── types/               # 类型定义
│   └── index.ts                 # 类型和接口定义
├── GroupManagementPage.tsx      # 主页面组件
├── index.ts                     # 模块导出文件
└── README.md                    # 说明文档
```

## 组件说明

### GroupTable
- **功能**: 显示分组列表，包含分组的名称、描述、成员数量等信息
- **操作**: 提供设置教师、管理者、学生和删除分组的操作按钮

### GroupCreateModal
- **功能**: 创建新分组的弹窗
- **字段**: 分组名称（必填）、分组描述（可选）

### MemberSelectorModal
- **功能**: 选择分组成员的弹窗
- **支持类型**: 教师、管理者、学生
- **交互**: 多选模式，支持搜索和筛选

## Hooks

### useGroupManagement
- **功能**: 管理分组相关的所有状态和业务逻辑
- **状态管理**: 分组列表、弹窗状态、选择状态等
- **业务逻辑**: 数据获取、创建、删除、成员管理等操作

## 类型定义

### MemberType
```typescript
type MemberType = "teachers" | "managers" | "students";
```

### GroupManagementState
分组管理的完整状态接口，包含所有必要的状态字段。

### 组件 Props 接口
- `GroupTableProps`: 分组表格组件属性
- `GroupCreateModalProps`: 创建分组弹窗属性
- `MemberSelectorProps`: 成员选择弹窗属性

## 使用方式

```typescript
import { GroupManagementPage } from "../pages/GroupManagement";

// 在路由中使用
<Route path="/groups" element={<GroupManagementPage />} />
```

## 特性

1. **模块化设计**: 将复杂的页面拆分为多个小组件，提高代码可维护性
2. **类型安全**: 完整的 TypeScript 类型定义
3. **状态管理**: 使用自定义 Hook 集中管理状态和业务逻辑
4. **组件复用**: 组件设计支持复用和扩展
5. **错误处理**: 完善的错误处理和用户反馈

## 扩展性

- 可以轻松添加新的成员类型
- 组件支持自定义样式和配置
- Hook 可以扩展更多业务逻辑
- 类型定义支持向后兼容

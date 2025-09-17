# 学生管理功能文档

## 功能概述

学生管理功能允许管理员和教师管理学生信息，包括学生的基本信息、团队分配、教师分配等。

## 数据模型

### 学生实体 (Student)

```typescript
interface Student {
  id: number;
  name: string; // 学生姓名
  birthDate: string; // 出生日期 (YYYY-MM-DD)
  gender: Gender; // 性别 (male/female/other)
  remarks?: string; // 备注信息
  teamId: number; // 所属团队ID
  team?: Team; // 团队信息
  teachers?: User[]; // 分配的教师列表
  createdAt: string;
  updatedAt: string;
}
```

### 性别枚举 (Gender)

- `MALE`: 男
- `FEMALE`: 女
- `OTHER`: 其他

## 功能特性

### 1. 学生管理

- **创建学生**: 必须选择团队，可选分配教师
- **编辑学生**: 可修改所有信息包括团队和教师分配
- **删除学生**: 软删除，同时删除教师关联
- **查看学生**: 显示完整学生信息包括团队和教师

### 2. 团队关联

- 每个学生必须属于一个团队
- 学生列表显示所属团队信息
- 可按团队筛选学生

### 3. 教师分配

- 一个学生可以分配多个教师
- 一个教师可以教授多个学生
- 多对多关系通过中间表管理

### 4. 搜索和筛选

- 按姓名或备注搜索
- 按团队筛选
- 按性别筛选
- 分页显示

## 权限控制

### 访问权限

- **管理员**: 可以管理所有学生
- **管理教师**: 可以管理所有学生
- **普通教师**: 可以管理所有学生

### 操作权限

- 所有教师角色都可以创建、编辑、删除学生
- 所有教师角色都可以分配教师给学生

## API 接口

### 学生管理

- `GET /students` - 获取所有学生
- `GET /students/search` - 搜索学生
- `GET /students/:id` - 获取学生详情
- `POST /students` - 创建学生
- `PUT /students/:id` - 更新学生
- `DELETE /students/:id` - 删除学生

### 教师分配

- `GET /students/:id/teachers` - 获取学生教师列表
- `POST /students/:id/assign-teachers` - 分配教师给学生

### 统计信息

- `GET /students/team/:teamId/stats` - 获取团队学生统计

## 前端界面

### 学生列表页面

- 表格显示学生信息
- 搜索和筛选功能
- 分页显示
- 操作按钮（编辑、删除）

### 学生表单

- 基本信息：姓名、性别、出生日期
- 团队选择：下拉选择团队
- 教师分配：多选教师
- 备注信息：文本域输入

### 统计信息

- 学生总数统计
- 按性别统计
- 按团队统计

## 数据库设计

### 学生表 (students)

```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  birthDate DATE NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  remarks TEXT,
  teamId INTEGER NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
);
```

### 学生教师关联表 (student_teachers)

```sql
CREATE TABLE student_teachers (
  studentId INTEGER NOT NULL,
  teacherId INTEGER NOT NULL,
  PRIMARY KEY (studentId, teacherId),
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
);
```

## 使用说明

### 创建学生

1. 点击"创建学生"按钮
2. 填写学生基本信息（姓名、性别、出生日期）
3. 选择所属团队（必选）
4. 选择分配教师（可选，可多选）
5. 填写备注信息（可选）
6. 点击"创建"按钮

### 编辑学生

1. 在学生列表中点击"编辑"按钮
2. 修改需要更新的信息
3. 点击"更新"按钮

### 分配教师

1. 在编辑学生时选择教师
2. 可以同时选择多个教师
3. 保存后教师分配立即生效

### 搜索学生

1. 在搜索框输入关键词（姓名或备注）
2. 选择团队筛选
3. 选择性别筛选
4. 点击搜索按钮

## 注意事项

1. **团队必选**: 创建学生时必须选择团队
2. **教师可选**: 教师分配是可选的，可以后续添加
3. **数据验证**: 出生日期不能晚于今天
4. **关联删除**: 删除学生时会同时删除教师关联
5. **权限控制**: 所有教师角色都可以管理学生

## 技术实现

### 后端技术

- TypeORM 实体映射
- Express.js 路由处理
- Zod 数据验证
- PostgreSQL 数据库

### 前端技术

- React + TypeScript
- Ant Design 组件库
- 自定义 Hooks 状态管理
- Axios HTTP 客户端

## 扩展功能

未来可以考虑添加的功能：

1. 学生照片上传
2. 学生成绩管理
3. 学生考勤记录
4. 学生家长信息
5. 学生档案导出
6. 批量操作功能

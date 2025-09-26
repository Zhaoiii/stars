# 课程管理系统

## 功能概述

本系统新增了一套完整的课程管理功能，包括：

### 主要功能

- ✅ 课程创建与管理（评估课程、个训课程）
- ✅ 智能排课系统（只能指定已分配给学生的教师）
- ✅ 类似飞书日程的日历看板
- ✅ 重复课程设置（每日、每周、每月）
- ✅ 课程状态管理（已安排、进行中、已完成、已取消）
- ✅ 学生管理页面集成课程查看

### 技术架构

#### 后端 (TypeScript + Node.js + TypeORM)

- **实体**: `Course.ts` - 课程数据模型
- **控制器**: `CourseController.ts` - API 接口控制
- **服务**: `CourseService.ts` - 业务逻辑处理
- **路由**: `courseRoutes.ts` - 路由配置
- **类型**: `course.ts` - TypeScript 类型定义

#### 前端 (React + TypeScript + Ant Design)

- **组件**:
  - `CalendarBoard` - 可复用的日历看板组件
  - `CourseManagementPage` - 课程管理主页面
  - `CourseList` - 课程列表组件
  - `CourseForm` - 课程表单组件
  - `CourseStats` - 课程统计组件
  - `StudentCourseView` - 学生课程查看组件
- **服务**: `courseService.ts` - API 调用封装
- **类型**: `course.ts` - 前端类型定义

## 使用指南

### 1. 启动系统

#### 后端

```bash
cd backend
npm install
npm run dev
```

#### 前端

```bash
cd frontend
npm install
npm start
```

### 2. 课程管理

#### 访问课程管理页面

- 登录系统后，在左侧菜单选择 "课程管理"
- 支持日历视图和列表视图两种显示方式

#### 创建课程

1. 点击 "新建课程" 按钮
2. 填写课程信息：
   - 课程名称（必填）
   - 课程类型：评估 / 个训
   - 课程描述（可选）
   - 选择学生（必填）
   - 选择教师（只能选择已分配给该学生的教师）
   - 设置上课时间
   - 设置上课地点（可选）
   - 重复设置（支持每日、每周、每月重复）
   - 备注（可选）

#### 课程状态管理

- **已安排**: 课程已创建，等待开始
- **进行中**: 课程正在进行
- **已完成**: 课程已结束
- **已取消**: 课程被取消

### 3. 日历看板

#### 功能特点

- 📅 类似飞书日程的现代化界面
- 🎨 课程类型颜色区分（评估-蓝色，个训-绿色）
- 🔍 支持按类型和状态过滤
- 👆 点击课程查看详情
- 📱 响应式设计，支持移动端

#### 操作说明

- 切换视图：月视图 / 周视图 / 日视图
- 过滤课程：按类型或状态筛选
- 点击 "今天" 快速回到当前日期
- 点击课程事件查看详情

### 4. 学生课程查看

在学生管理页面，每个学生操作列都有 "课程安排" 按钮：

- 点击可查看该学生的所有课程安排
- 以日历形式展示，清晰直观
- 支持课程详情查看

## API 接口

### 课程管理 API

```
GET    /api/courses              # 获取课程列表
GET    /api/courses/:id          # 获取单个课程
POST   /api/courses              # 创建课程
PUT    /api/courses/:id          # 更新课程
DELETE /api/courses/:id          # 删除课程
GET    /api/courses/stats        # 获取课程统计
GET    /api/courses/calendar     # 获取日历事件
POST   /api/courses/recurring    # 创建重复课程
```

### 请求示例

#### 创建课程

```json
POST /api/courses
{
  "title": "语言评估课程",
  "description": "语言能力综合评估",
  "type": "evaluation",
  "startTime": "2024-01-15T09:00:00.000Z",
  "endTime": "2024-01-15T10:00:00.000Z",
  "location": "评估室A",
  "repeatMode": "weekly",
  "repeatEndDate": "2024-03-15T10:00:00.000Z",
  "notes": "需要准备评估材料",
  "studentId": 1,
  "teacherId": 2
}
```

## 数据库结构

### 课程表 (courses)

```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  type course_type_enum NOT NULL,
  status course_status_enum DEFAULT 'scheduled',
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR,
  repeat_mode repeat_mode_enum DEFAULT 'none',
  repeat_end_date DATE,
  notes TEXT,
  student_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);
```

### 枚举类型

```sql
-- 课程类型
CREATE TYPE course_type_enum AS ENUM ('evaluation', 'individual_training');

-- 课程状态
CREATE TYPE course_status_enum AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- 重复模式
CREATE TYPE repeat_mode_enum AS ENUM ('none', 'daily', 'weekly', 'monthly');
```

## 设计特点

### 1. 现代化 UI 设计

- 采用 Ant Design 设计语言
- 响应式布局，支持移动端
- 清晰的视觉层次和交互反馈
- 一致的颜色和图标系统

### 2. 组件化架构

- 高度模块化的组件设计
- 可复用的 CalendarBoard 组件
- 单一职责原则，每个文件不超过 300 行
- 合理的 hooks 封装

### 3. 类型安全

- 完整的 TypeScript 类型定义
- 前后端类型一致性
- 严格的类型检查

### 4. 扩展性设计

- 课程类型可扩展（目前支持评估、个训）
- 模块化的路由和服务设计
- 灵活的权限控制

## 权限控制

- **管理员**: 可以管理所有课程
- **管理教师**: 可以管理团队内的课程
- **普通教师**: 可以管理分配给自己的课程

## 注意事项

1. **教师分配限制**: 只能为学生指定已分配给该学生的教师
2. **时间冲突**: 系统会检查教师和学生的时间冲突
3. **重复课程**: 重复课程会根据设置自动创建多个课程实例
4. **数据同步**: 课程数据变更会实时反映在日历和列表中

## 开发规范

- 每个文件保持在 300 行以内
- 使用函数式组件和 hooks
- 遵循 RESTful API 设计
- 统一的错误处理和日志记录
- 完整的类型定义和文档注释

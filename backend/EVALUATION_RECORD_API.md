# 评估记录 API 文档

## 概述

评估记录 API 提供了完整的评估功能，包括创建、查询、更新和删除评估记录。评估记录基于树形结构（评估工具）创建，支持对叶子节点进行评分。

## 基础信息

- **基础路径**: `/api/evaluation-records`
- **认证**: 所有接口都需要 Bearer Token 认证
- **内容类型**: `application/json`

## 数据模型

### 评估记录 (EvaluationRecord)

```typescript
interface IEvaluationRecord {
  _id: string;
  studentId: string; // 学生ID
  toolId: string; // 评估工具ID（树形根节点ID）
  toolName: string; // 评估工具名称
  evaluationScores: IEvaluationScore[]; // 评估得分列表
  status: "in_progress" | "completed" | "archived"; // 评估状态
  evaluatedAt?: Date; // 评估完成时间
  createdAt: Date;
  updatedAt: Date;
}
```

### 评估得分 (EvaluationScore)

```typescript
interface IEvaluationScore {
  nodeId: string; // 树形节点ID
  nodeName: string; // 节点名称
  isLeaf: boolean; // 是否为叶子节点
  targetCount?: number; // 目标数（仅叶子节点）
  completedCount?: number; // 完成数（仅叶子节点）
}
```

## API 接口

### 1. 创建评估记录

**POST** `/api/evaluation-records`

根据学生 ID 和评估工具 ID 创建新的评估记录。

#### 请求体

```json
{
  "studentId": "学生ID",
  "toolId": "评估工具ID（树形根节点ID）"
}
```

#### 响应

```json
{
  "success": true,
  "message": "评估记录创建成功",
  "data": {
    "_id": "评估记录ID",
    "studentId": "学生ID",
    "toolId": "评估工具ID",
    "toolName": "评估工具名称",
    "evaluationScores": [...],
    "status": "in_progress",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 获取评估记录列表

**GET** `/api/evaluation-records`

获取评估记录列表，支持分页和筛选。

#### 查询参数

- `studentId` (可选): 按学生 ID 筛选
- `toolId` (可选): 按工具 ID 筛选
- `status` (可选): 按状态筛选 (`in_progress`, `completed`, `archived`)
- `page` (可选): 页码，默认为 1
- `limit` (可选): 每页数量，默认为 10

#### 响应

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### 3. 获取单个评估记录

**GET** `/api/evaluation-records/:id`

根据 ID 获取单个评估记录。

#### 响应

```json
{
  "success": true,
  "data": {
    "_id": "评估记录ID",
    "studentId": {
      "_id": "学生ID",
      "name": "学生姓名"
    },
    "toolId": {
      "_id": "工具ID",
      "name": "工具名称"
    },
    "evaluationScores": [...],
    "status": "in_progress",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. 更新评估记录

**PUT** `/api/evaluation-records/:id`

更新整个评估记录。

#### 请求体

```json
{
  "evaluationScores": [...],
  "status": "completed"
}
```

#### 响应

```json
{
  "success": true,
  "message": "评估记录更新成功",
  "data": {...}
}
```

### 5. 更新单个节点得分

**PATCH** `/api/evaluation-records/:id/nodes/:nodeId`

更新指定节点的得分。

#### 请求体

```json
{
  "completedCount": 8
}
```

#### 响应

```json
{
  "success": true,
  "message": "节点完成数更新成功",
  "data": {...}
}
```

### 6. 完成评估

**PATCH** `/api/evaluation-records/:id/complete`

将评估状态设置为已完成。

#### 响应

```json
{
  "success": true,
  "message": "评估完成",
  "data": {...}
}
```

### 7. 删除评估记录

**DELETE** `/api/evaluation-records/:id`

删除指定的评估记录。

#### 响应

```json
{
  "success": true,
  "message": "评估记录删除成功"
}
```

### 8. 根据学生获取评估记录

**GET** `/api/evaluation-records/student/:studentId`

获取指定学生的所有评估记录。

#### 响应

```json
{
  "success": true,
  "data": [...]
}
```

### 9. 根据工具获取评估记录

**GET** `/api/evaluation-records/tool/:toolId`

获取指定工具的所有评估记录。

#### 响应

```json
{
  "success": true,
  "data": [...]
}
```

## 使用示例

### 创建评估记录

```bash
curl -X POST http://localhost:5001/api/evaluation-records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "64a1b2c3d4e5f6789012345",
    "toolId": "64a1b2c3d4e5f6789012346"
  }'
```

### 更新节点完成数

```bash
curl -X PATCH http://localhost:5001/api/evaluation-records/64a1b2c3d4e5f6789012347/nodes/64a1b2c3d4e5f6789012348 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "completedCount": 8
  }'
```

## 错误处理

所有接口都会返回统一的错误格式：

```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息"
}
```

常见错误状态码：

- `400`: 请求参数错误
- `401`: 未授权
- `404`: 资源不存在
- `500`: 服务器内部错误

## 注意事项

1. 创建评估记录时会自动根据树形结构初始化所有叶子节点的完成数为 0
2. 只有叶子节点才能记录完成数，非叶子节点只是分类节点
3. 完成数不能小于 0
4. 完成评估时会自动设置评估完成时间
5. 得分计算将在生成报告时进行，评估过程中只记录完成数
6. 评估记录只存储原始数据，不进行汇总计算

# 任务模块实现总结

## 当前状态：已完成基础实现

### 1. 数据库模型（Prisma Schema）✅

#### 核心表结构：

- **Task（任务表）**：包含软删除字段（isDeleted, deletedAt, deletedBy）
- **TaskParticipant（任务参与人）**：多对多关联表
- **TaskReviewConfig（任务审核配置）**：一对一关联到Task，包含软删除字段
- **TaskReviewStage（任务审核步骤实例）**：具体的审核步骤，包含软删除字段

#### 关键关系：

```
Task (任务)
  ├─ projectId → Project (必填，所有任务必须属于项目)
  ├─ taskCategoryId → TaskCategory (任务分类)
  ├─ taskLeaderId → User (任务负责人)
  ├─ participants → TaskParticipant[] (参与人员)
  └─ reviewConfig → TaskReviewConfig (审核配置，一对一)
       └─ reviewStages → TaskReviewStage[] (审核步骤列表)
            ├─ stepConfigId → ReviewStepTemplate (步骤模板)
            └─ reviewerId → User (审核人)
```

### 2. DTO 设计 ✅

#### CreateTaskDto（创建任务）

```typescript
{
  taskName: string;              // 任务名称
  projectId: string;             // 项目ID（必填）
  isReviewRequired?: boolean;    // 是否需要审核
  taskCategoryId: string;        // 任务分类ID
  taskLeaderId: string;          // 任务负责人ID
  participantIds?: string[];     // 参与人员ID列表
  reviewStageAssignments?: [     // 审核步骤分配（数组顺序即步骤顺序）
    {
      stepConfigId: string;      // 步骤模板ID（从ReviewStepTemplate表）
      stepName: string;          // 步骤名称
      reviewerId: string;        // 审核人ID（具体用户ID）
    }
  ];
  description?: string;          // 任务说明
  attachments?: any;             // 附件列表
}
```

#### UpdateTaskDto（更新任务）

```typescript
{
  id: string;                    // 任务ID
  taskName?: string;             // 任务名称
  description?: string;          // 任务说明
  attachments?: any;             // 附件列表
}
```

#### TaskPaginationDto（分页查询）

```typescript
{
  pageNum?: string;              // 页码
  pageSize?: string;             // 每页大小
  keyword?: string;              // 搜索关键词
  projectId?: string;            // 项目ID筛选
}
```

### 3. Controller 接口 ✅

遵循项目约定（参考 user.controller.ts, role-category.controller.ts）：

```typescript
@Controller('task')
@ApiTags('task')

// 基础CRUD
POST   /task/createTask                    // 创建任务
GET    /task/getTaskList                   // 获取任务列表（支持分页）
GET    /task/detail/:id                    // 获取任务详情
POST   /task/updateTask/:id                // 更新任务
DELETE /task/deleteTask/:id                // 删除任务（软删除）

// 项目相关
GET    /task/getProjectTaskList/:projectId       // 获取项目任务列表（分页）
GET    /task/getProjectTaskSimpleList/:projectId // 获取项目任务简单列表（下拉选择用）
```

### 4. Service 方法 ✅

#### addTask（创建任务）- 核心方法

使用事务处理，确保数据一致性：

```typescript
async addTask(createdData: CreateTaskDto) {
  // 1. 分离DTO字段
  const { participantIds, reviewStageAssignments, ...restData } = createdData;

  return await this.Prisma.$transaction(async tx => {
    // 2. 创建任务基本信息（明确指定每个字段）
    const task = await tx.task.create({
      data: {
        taskName, projectId, taskCategoryId,
        taskLeaderId, isReviewRequired,
        description, attachments
      }
    });

    // 3. 创建参与人员记录
    if (participantIds?.length > 0) {
      await tx.taskParticipant.createMany({
        data: participantIds.map(userId => ({ taskId: task.id, userId }))
      });
    }

    // 4. 如果需要审核，创建审核流程
    if (isReviewRequired && reviewStageAssignments?.length > 0) {
      // 4.1 获取或创建审核配置
      let reviewConfigId = taskCategory.reviewConfig?.id ||
                          (await createTempConfig()).id;

      // 4.2 创建任务审核配置
      const taskReviewConfig = await tx.taskReviewConfig.create({
        data: { taskId, reviewConfigId, status: 'PENDING', currentStepOrder: 1 }
      });

      // 4.3 创建审核步骤实例（数组索引 = 步骤顺序）
      await tx.taskReviewStage.createMany({
        data: reviewStageAssignments.map((assignment, index) => ({
          taskReviewConfigId: taskReviewConfig.id,
          stepConfigId: assignment.stepConfigId,
          stepOrder: index + 1,  // 数组顺序决定步骤顺序
          stepName: assignment.stepName,
          reviewerId: assignment.reviewerId,
          status: 'PENDING'
        }))
      });
    }

    // 5. 返回完整任务信息（包含所有关联）
    return await tx.task.findUnique({
      where: { id: task.id },
      include: { /* 所有关联 */ }
    });
  });
}
```

#### 其他方法

- `updateTask()` - 更新任务
- `findAllByPagination()` - 分页查询（支持项目筛选、关键词搜索）
- `findTaskDetailById()` - 获取任务详情（包含所有关联）
- `findSimpleTasksByProject()` - 获取项目简单任务列表
- `removeTask()` - 软删除任务（同时软删除审核配置和步骤）
- `restoreTask()` - 恢复已删除任务
- `permanentDeleteTask()` - 物理删除任务（谨慎使用）

### 5. 软删除机制 ✅

#### 实现方式：

- 添加字段：`isDeleted`, `deletedAt`, `deletedBy`
- 查询时默认过滤：`where: { isDeleted: false }`
- 删除时更新状态：`update({ isDeleted: true, deletedAt: new Date() })`
- 级联软删除：删除任务时同时软删除关联的审核配置和步骤

#### 优势：

- 数据可恢复
- 保留历史记录
- 避免外键约束问题
- 支持审计追踪

## 下一步工作建议

### 1. 测试创建任务接口

```bash
# 启动开发服务器
npm run start:dev

# 测试创建任务（不需要审核）
POST http://localhost:3000/task/createTask
{
  "taskName": "测试任务1",
  "projectId": "项目ID",
  "taskCategoryId": "分类ID",
  "taskLeaderId": "负责人ID",
  "isReviewRequired": false,
  "participantIds": ["用户ID1", "用户ID2"],
  "description": "这是一个测试任务"
}

# 测试创建任务（需要审核）
POST http://localhost:3000/task/createTask
{
  "taskName": "测试任务2",
  "projectId": "项目ID",
  "taskCategoryId": "分类ID",
  "taskLeaderId": "负责人ID",
  "isReviewRequired": true,
  "participantIds": ["用户ID1"],
  "reviewStageAssignments": [
    {
      "stepConfigId": "步骤模板ID1",
      "stepName": "一审",
      "reviewerId": "审核人ID1"
    },
    {
      "stepConfigId": "步骤模板ID2",
      "stepName": "二审",
      "reviewerId": "审核人ID2"
    }
  ],
  "description": "需要审核的任务"
}
```

### 2. 需要完善的功能

#### 2.1 审核流程操作

- 提交审核
- 审核通过/拒绝
- 查看审核历史
- 审核步骤跳转

#### 2.2 任务状态管理

- 任务状态枚举（待开始、进行中、已完成等）
- 状态流转逻辑
- 状态变更记录

#### 2.3 权限控制

- 任务负责人权限
- 参与人员权限
- 审核人员权限
- 项目管理员权限

#### 2.4 数据验证

- 验证项目是否存在
- 验证任务分类是否存在
- 验证用户是否存在
- 验证步骤模板是否存在
- 验证审核配置是否有效

#### 2.5 错误处理

- 添加自定义异常
- 统一错误响应格式
- 详细的错误信息

### 3. 性能优化建议

- 添加数据库索引（已在schema中定义）
- 使用缓存（Redis）缓存常用数据
- 分页查询优化
- 减少不必要的关联查询

### 4. 文档完善

- API文档（Swagger）
- 数据库设计文档
- 业务流程图
- 部署文档（已完成）

## 技术栈

- **框架**: NestJS
- **ORM**: Prisma
- **数据库**: MySQL
- **验证**: class-validator, class-transformer
- **文档**: Swagger/OpenAPI

## 项目约定

1. **路由命名**：使用语义化命名（createTask, getTaskList），不使用RESTful风格
2. **装饰器**：使用项目自定义装饰器（@ResponseMessage, @ListResponse）
3. **数据分离**：DTO字段与数据库字段分离处理
4. **事务处理**：多表操作使用 `$transaction` 确保一致性
5. **软删除**：默认使用软删除，保留数据可恢复性
6. **代码简洁**：保持代码简洁，移除不必要的功能

## 注意事项

⚠️ **重要提醒**：

1. `reviewStageAssignments` 数组的顺序决定审核步骤的执行顺序
2. `stepConfigId` 引用的是 `ReviewStepTemplate` 表（步骤模板）
3. `reviewerId` 引用的是 `User` 表（具体的审核人）
4. 所有任务必须属于一个项目（projectId 必填）
5. 软删除的数据可以通过 `restoreTask()` 方法恢复
6. 物理删除会触发级联删除（谨慎使用）

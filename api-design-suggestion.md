# API设计建议

## 当前的API结构

### 任务模块 (`/tasks`)

```typescript
POST   /tasks           // 创建任务
GET    /tasks           // 获取任务列表（支持projectId筛选）
GET    /tasks/:id       // 获取任务详情
PUT    /tasks/:id       // 更新任务
DELETE /tasks/:id       // 删除任务
```

## 建议的项目模块API设计

### 项目模块 (`/projects`)

```typescript
// 项目基本操作
POST   /projects                    // 创建项目
GET    /projects                    // 获取项目列表
GET    /projects/:id                // 获取项目详情
PUT    /projects/:id                // 更新项目
DELETE /projects/:id                // 删除项目

// 项目下的任务操作（嵌套资源）
GET    /projects/:projectId/tasks           // 获取项目下的任务列表
GET    /projects/:projectId/tasks/simple    // 获取项目下的任务简单列表（下拉选择用）
POST   /projects/:projectId/tasks           // 在项目下创建任务
GET    /projects/:projectId/tasks/:taskId   // 获取项目下的特定任务
PUT    /projects/:projectId/tasks/:taskId   // 更新项目下的任务
DELETE /projects/:projectId/tasks/:taskId   // 删除项目下的任务

// 项目统计
GET    /projects/:projectId/stats           // 获取项目统计信息
```

## 推荐的实现方式

### 1. 项目控制器中添加任务相关接口

```typescript
@Controller('projects')
@ApiTags('项目管理')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly taskService: TaskService, // 注入TaskService
  ) {}

  // 获取项目下的任务列表
  @Get(':projectId/tasks')
  @ApiOperation({ summary: '获取项目下的任务列表' })
  async getProjectTasks(
    @Param('projectId') projectId: string,
    @Query() paginationDto: Omit<TaskPaginationDto, 'projectId'>,
  ) {
    return await this.taskService.findAllByPagination({
      ...paginationDto,
      projectId,
    });
  }

  // 获取项目下的任务简单列表
  @Get(':projectId/tasks/simple')
  @ApiOperation({ summary: '获取项目下的任务简单列表' })
  async getProjectTasksSimple(@Param('projectId') projectId: string) {
    return await this.taskService.findSimpleTasksByProject(projectId);
  }

  // 在项目下创建任务
  @Post(':projectId/tasks')
  @ApiOperation({ summary: '在项目下创建任务' })
  async createProjectTask(
    @Param('projectId') projectId: string,
    @Body() createTaskDto: Omit<CreateTaskDto, 'projectId'>,
  ) {
    return await this.taskService.addTask({
      ...createTaskDto,
      projectId,
    });
  }
}
```

### 2. 或者保持当前设计，但优化使用方式

如果不想创建嵌套路由，当前的设计也是可以的：

```typescript
// 获取所有任务（管理员视图）
GET /tasks

// 获取特定项目的任务（项目视图）
GET /tasks?projectId=proj_123456

// 创建任务（必须指定projectId）
POST /tasks
{
  "projectId": "proj_123456",
  "taskName": "...",
  // ...
}
```

## 优缺点对比

### 嵌套路由 (`/projects/:projectId/tasks`)

**优点：**

- 语义清晰，表达了任务属于项目的关系
- 符合RESTful设计原则
- 便于权限控制（基于项目权限）

**缺点：**

- 路由较长
- 需要在项目模块中处理任务逻辑

### 平级路由 (`/tasks?projectId=xxx`)

**优点：**

- 路由简洁
- 模块职责清晰
- 便于跨项目查询

**缺点：**

- 语义不够清晰
- 需要额外的参数验证

## 建议

基于你的业务需求，建议采用**平级路由**的方式，但要确保：

1. **projectId为必填参数**（已完成）
2. **在查询时支持projectId筛选**（已完成）
3. **在权限控制中验证用户对项目的访问权限**
4. **在API文档中明确说明任务与项目的关系**

这样既保持了模块的独立性，又体现了业务关系。

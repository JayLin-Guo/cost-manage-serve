# 级联删除演示

## 数据结构示例：

```
Task (id: "task_001", name: "某某大厦造价审核")
    ↓
TaskReviewConfig (id: "config_001", taskId: "task_001")
    ↓
TaskReviewStage (id: "stage_001", taskReviewConfigId: "config_001", stepName: "一审")
TaskReviewStage (id: "stage_002", taskReviewConfigId: "config_001", stepName: "二审")
TaskReviewStage (id: "stage_003", taskReviewConfigId: "config_001", stepName: "终审")
```

## 删除操作：

### 执行：

```typescript
await prisma.task.delete({ where: { id: 'task_001' } });
```

### 自动发生的级联删除：

1. **第一步**：删除 Task (id: "task_001")
2. **第二步**：由于 `onDelete: Cascade`，自动删除 TaskReviewConfig (id: "config_001")
3. **第三步**：由于 `onDelete: Cascade`，自动删除所有相关的 TaskReviewStage：
   - stage_001 被删除
   - stage_002 被删除
   - stage_003 被删除

### 结果：

- ✅ 一条SQL命令删除了4条记录
- ✅ 不需要手动处理关联关系
- ✅ 保证数据一致性，不会有"孤儿记录"

## 对比：如果没有级联删除

```typescript
// 没有级联删除时，需要手动删除：
await prisma.taskReviewStage.deleteMany({
  where: { taskReviewConfig: { taskId: 'task_001' } },
});

await prisma.taskReviewConfig.delete({
  where: { taskId: 'task_001' },
});

await prisma.task.delete({
  where: { id: 'task_001' },
});
```

## 为什么不是所有关系都用级联删除？

### ✅ 适合级联删除的场景：

- **强依赖关系**：子记录没有父记录就没有意义
- **私有数据**：只属于这个父记录的数据
- 例如：任务的审核配置、订单的订单项

### ❌ 不适合级联删除的场景：

- **共享数据**：多个记录可能引用同一个数据
- **重要的基础数据**：删除会影响系统功能
- 例如：用户信息、部门信息、配置模板

## 在我们项目中的设计原则：

```
Task → TaskReviewConfig → TaskReviewStage  (级联删除)
     ↗                  ↗
User                   ReviewStepTemplate  (不级联删除)
```

这样设计确保：

- 删除任务时，任务相关的审核数据被清理
- 但用户和模板数据被保留，可以继续使用

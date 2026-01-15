# 物理删除 vs 软删除对比

## 功能对比

| 特性         | 物理删除      | 软删除          |
| ------------ | ------------- | --------------- |
| **数据恢复** | ❌ 无法恢复   | ✅ 可以恢复     |
| **数据审计** | ❌ 无删除记录 | ✅ 保留删除记录 |
| **存储空间** | ✅ 节省空间   | ❌ 占用空间     |
| **查询性能** | ✅ 更快       | ❌ 需要过滤     |
| **数据安全** | ❌ 误删风险高 | ✅ 误删风险低   |
| **合规要求** | ❌ 可能不符合 | ✅ 符合审计要求 |

## 实现方式对比

### 物理删除

```typescript
// 简单直接
await prisma.task.delete({ where: { id: taskId } });
```

### 软删除

```typescript
// 需要更新状态
await prisma.task.update({
  where: { id: taskId },
  data: {
    isDeleted: true,
    deletedAt: new Date(),
    deletedBy: userId,
  },
});
```

## 查询方式对比

### 物理删除

```typescript
// 直接查询所有记录
const tasks = await prisma.task.findMany();
```

### 软删除

```typescript
// 需要过滤已删除的记录
const tasks = await prisma.task.findMany({
  where: { isDeleted: false },
});

// 查询回收站
const deletedTasks = await prisma.task.findMany({
  where: { isDeleted: true },
});
```

## 企业级应用推荐

### ✅ 推荐使用软删除的场景：

- **重要业务数据**：任务、订单、用户等
- **需要审计追踪**：金融、医疗等行业
- **可能需要恢复**：用户可能误删除
- **法律合规要求**：数据保留政策

### ✅ 可以使用物理删除的场景：

- **临时数据**：缓存、日志等
- **敏感数据**：密码重置令牌等
- **存储空间紧张**：大量历史数据
- **性能要求极高**：高频查询场景

## 混合策略

很多企业采用**分层删除策略**：

1. **第一阶段**：软删除（用户操作）
2. **第二阶段**：定期清理（系统自动）

```typescript
// 用户删除：软删除
async userDelete(taskId: string) {
  return this.softDelete(taskId);
}

// 系统清理：物理删除超过1年的软删除记录
async systemCleanup() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return this.prisma.task.deleteMany({
    where: {
      isDeleted: true,
      deletedAt: { lt: oneYearAgo }
    }
  });
}
```

## 我们项目的建议

基于造价管理系统的特点，建议：

1. **任务数据**：使用软删除（重要业务数据）
2. **审核记录**：使用软删除（审计要求）
3. **用户操作日志**：定期物理删除（节省空间）
4. **临时文件**：直接物理删除

这样既保证了数据安全，又兼顾了性能和存储效率。

+++
title = "Tick 调度器深度剖析"
slug = "Depth-analysis-of-Tick-scheduler"
date = 2026-10-05T04:53:00
updated = 2026-10-05
description = "Tick 调度器深度剖析"
tags = ["笔记", "Minecraft","tick"]
categories = ["笔记"]
cover = ""
pinned = false
draft = false
isAI = false
+++

# Tick 调度器深度剖析

> 为什么同一刻里，红石火把比中继器先响应？为什么"位置"会影响红石的行为？本文从 `WorldTickScheduler`、`ChunkTickScheduler`、`OrderedTick` 到 `TickPriority` 的完整实现，揭示 tick 调度的底层机制。

## 一、Tick 的三层概念

Minecraft 中"tick"这个词容易混淆，先理清三个层次：

| 概念 | 含义 | 周期 |
|------|------|------|
| **Game Tick** | 整个世界的一次循环推进（主循环的一次迭代） | 50ms (20TPS) |
| **Block Tick** | 某个方块的定时任务（如中继器延时 1gt 后触发） | 可自定义 0~ 多 gt 延迟 |
| **Random Tick** | 区块随机挑选若干方块触发 `randomTick()`（作物生长、树叶消失）| 每区块 ~每 68.27 秒一次 |

本文剖析的是**中间那层 Block Tick（流体 tick 同理）**的调度系统：

```
scheduleTick(方块A, 延迟=1gt, 优先级=HIGH)
scheduleTick(方块B, 延迟=0gt, 优先级=NORMAL)
               ↓
【下一游戏刻到来】
               ↓
先执行 方块B（延迟更短，0gt）
再执行 方块A（延迟更长，1gt，但优先级 HIGH）
```

## 二、四个关键类的职责

```
┌───────────────────────────────────────────────────────────┐
│                    数据模型层                               │
├───────────────────────────────────────────────────────────┤
│ Tick<T>                存储/序列化的 tick 记录             │
│   ├─ type: T           方块或流体类型                       │
│   ├─ pos: BlockPos     位置                                 │
│   ├─ delay: int        相对延迟（gt）                       │
│   └─ priority          TickPriority                         │
│                                                             │
│ OrderedTick<T>         运行时调度的有序 tick                 │
│   ├─ 继承 type、pos、priority                               │
│   ├─ triggerTick       绝对触发时刻（world.getTime() + delay）│
│   └─ subTickOrder      同优先级内的调度顺序（递增计数器）     │
├───────────────────────────────────────────────────────────┤
│                    调度器层                                 │
├───────────────────────────────────────────────────────────┤
│ ChunkTickScheduler<T>   单个区块的 tick 队列                │
│   ├─ tickQueue          PriorityQueue<OrderedTick>          │
│   └─ queuedTicks        HashSet，用于快速去重                │
│                                                             │
│ WorldTickScheduler<T>   整个世界的 tick 调度                │
│   ├─ chunkTickSchedulers  Long2ObjectMap<ChunkPos, ChunkTS> │
│   ├─ tickableChunkTickSchedulers  本刻可执行的区块优先队列  │
│   └─ tickableTicks      本刻要执行的所有 tick 队列          │
└───────────────────────────────────────────────────────────┘
```

## 三、OrderedTick：排序的完整键

一个 tick 的执行顺序由三元组 `(triggerTick, priority, subTickOrder)` **完全确定**。

```java
public record OrderedTick<T>(
    T type,
    BlockPos pos,
    long triggerTick,   // 什么时候执行（绝对时间）
    TickPriority priority, // 优先级（-3 ~ +3）
    long subTickOrder   // 同优先级的调度先后，递增计数器
) {}
```

### 比较器（决定先执行谁）

```java
TRIGGER_TICK_COMPARATOR = (first, second) -> {
    int i = Long.compare(first.triggerTick, second.triggerTick);
    if (i != 0) return i;                    // 1. 触发刻更早 → 先执行
    i = first.priority.compareTo(second.priority);
    return i != 0 ? i                        // 2. 优先级数字更小 → 先执行
         : Long.compare(first.subTickOrder,   // 3. 先被安排的先执行
                        second.subTickOrder);
};
```

### subTickOrder 的含义

它是一个**全局递增计数器**（在 `ChunkTickScheduler.disable` 里初始化为负数开始），每次调度 tick 时递增。这意味着：

> **先调用 `scheduleTick` 的方块，同优先级下先执行。**

由于 `scheduleTick` 通常由 `neighborUpdate` 触发，而 `neighborUpdate` 的传播顺序由 `Direction.values()` 和方块位置决定，**这就是"位置依赖性"的直接来源**。

### 去重策略

```java
// OrderedTick.HASH_STRATEGY
// 两个 tick 只要 type 相同、pos 相同，就视为"同一个"（重复）——
// 完全忽略 triggerTick、priority、subTickOrder！
public static final Strategy<OrderedTick<?>> HASH_STRATEGY = new Strategy<>() {
    public boolean equals(@Nullable OrderedTick<?> a, @Nullable OrderedTick<?> b) {
        return a.type() == b.type() && a.pos().equals(b.pos());
    }
};
```

**关键结论：同一位置的同类型方块，调度器里永远只留一个 tick。** 如果已经在排队，后续的 scheduleTick 调用会被**静默丢弃**。

> 经典现象：一根红石火把被快速连续触发多次 `scheduleTick`，实际只会响应一次。这是 Mojang 防止"重复更新风暴"的重要保护。

## 四、ChunkTickScheduler：区块级调度

每个加载的区块有独立的调度器，数据结构很朴素：

```java
public class ChunkTickScheduler<T> {
    // 优先队列：按 TRIGGER_TICK_COMPARATOR，先 peek/poll 到最早要执行的
    private final Queue<OrderedTick<T>> tickQueue =
        new PriorityQueue<>(OrderedTick.TRIGGER_TICK_COMPARATOR);

    // 去重集合：快速判断"这位置的这类方块已经在排队了吗"
    private final Set<OrderedTick<?>> queuedTicks =
        new ObjectOpenCustomHashSet<>(OrderedTick.HASH_STRATEGY);
}
```

### 安排 tick：`scheduleTick(orderedTick)`

```java
public void scheduleTick(OrderedTick<T> orderedTick) {
    // 先 Set.add 去重；add 返回 true 代表真的是新的，才进队列
    if (this.queuedTicks.add(orderedTick)) {
        this.queueTick(orderedTick);
    }
}
```

### 序列化支持

`Tick` 用于保存到区块文件，`OrderedTick` 用于运行时。两者可以互转：

```java
// Tick → OrderedTick（加载区块时）
public OrderedTick<T> createOrderedTick(long time, long subTickOrder) {
    return new OrderedTick<>(type, pos, time + delay, priority, subTickOrder);
}

// OrderedTick → Tick（保存区块时）
public Tick<T> toTick(long time) {
    return new Tick<>(type, pos, (int)(triggerTick - time), priority);
}
```

## 五、WorldTickScheduler：世界级调度

这是调度的"大脑"，负责：

1. 把 `scheduleTick` 路由到对应区块的 `ChunkTickScheduler`
2. 每个游戏刻 `tick()` 时，收集所有到期 tick 并按序执行
3. 处理区块加载/卸载时的调度器挂载与卸载

### 一帧 tick() 的执行流程

```java
public void tick(long time, int maxTicks, BiConsumer<BlockPos, T> ticker) {
    // ========== 收集阶段 collect ==========
    // 1. 从 nextTriggerTickByChunkPos 筛选出 "下一次触发刻 ≤ 当前 time" 的区块
    collectTickableChunkTickSchedulers(time);

    // 2. 从每个候选区块的 ChunkTickScheduler 里取出一个 tick，
    //    取出后如果该区块还有同刻的 tick，再塞回区块候选队列
    //    重复直到本刻 tick 数量达到 maxTicks（65536）
    addTickableTicks(time, maxTicks);

    // 3. 那些取了但还不够早到触发刻的区块 tick，延迟放回全局调度表
    delayAllTicks();

    // ========== 执行阶段 run ==========
    // 4. 依次弹出 tickableTicks 的 tick，调用 ticker.accept(pos, type)
    //    ticker 实际上是 ServerWorld::tickBlock 或 ServerWorld::tickFluid
    tick(ticker);

    // ========== 清理阶段 cleanup ==========
    tickableTicks.clear();
    tickableChunkTickSchedulers.clear();
    tickedTicks.clear();  // tickedTicks 记录已执行的，用于回滚场景
}
```

### 区块间的 tick 顺序

`tickableChunkTickSchedulers` 是一个**优先队列**，比较器是：

```java
COMPARATOR = (a, b) ->
    OrderedTick.BASIC_COMPARATOR.compare(a.peekNextTick(), b.peekNextTick());
```

这意味着：**两个不同区块的 tick，在同一刻下的执行顺序，完全由它们的第一个 tick 的 (priority, subTickOrder) 决定**。跨区块的红石机械时序也因此变得非常脆弱——区块的加载顺序会影响 subTickOrder 计数器。

### maxTicks=65536

在 `ServerWorld.tick()` 中调用：

```java
this.blockTickScheduler.tick(m, 65536, this::tickBlock);
this.fluidTickScheduler.tick(m, 65536, this::tickFluid);
```

65536 是硬编码上限。正常 MC 里一个刻 blockTicks 数量一般几百到几千，这个上限主要是防止"调度器里有几百万 tick 时服务器卡死"的情况。如果触发上限，本刻剩余的 tick 会顺延到下一刻（可能导致时序异常）。

## 六、执行入口：`ServerWorld.tickBlock()`

调度器最终调用 `tickBlock(pos, block)`：

```java
// 在 ServerWorld.tick() 中被 WorldTickScheduler 回调
private void tickBlock(BlockPos pos, Block block) {
    BlockState state = this.getBlockState(pos);
    if (state.isOf(block)) {
        // 还得 double-check 位置上还是这种方块（期间可能被 setBlockState 改了）
        state.scheduledTick(this, pos, this.random);
    }
}
```

`scheduledTick` 是 Block 类的虚方法，每种方块 override 它实现逻辑：
- 中继器：切换为导通状态，再次调度下一刻
- 沙子/沙砾：检测下方 AIR → 生成 FallingBlock 实体
- 水/熔岩：检测周围流方向 → setBlockState 更新流动
- 观察者：检测前面方块变化后，1gt 后输出 1gt 信号

### 注意"状态过期"的双重检查

如果 `scheduleTick(位置P, 类型X)` 之后，在执行前位置 P 被 setBlockState 改成了类型 Y：

```java
if (!state.isOf(block)) return;  // 这个 tick 就被跳过
```

这就是为什么你能利用"安排了 sand tick → 活塞把 sand 推走 → tick 到来时发现不是 sand → 悬空沙子"的原理。

## 七、与邻居更新 (neighborUpdate) 的关系

这两个机制是正交的，但在红石中几乎总是一起出现：

| 机制 | 触发方式 | 执行时机 | 典型用途 |
|------|---------|---------|---------|
| **neighborUpdate** | 显式调用 `updateNeighbors(pos)` | 立即（在 setBlockState 的 flags=1 分支内同步执行） | 红石线、活塞检测信号变化 |
| **BlockTick** | `scheduleTick(delay>0)` 延迟调度 | 延迟 delay 个 game tick 后 | 中继器延时、沙子下落、红石火把冷却 |

### 活塞的"收到信号"时序

```
拉杆被玩家打开
  → setBlockState(REDSTONE_WIRE, power=15, NOTIFY_ALL)
        → 邻居 neighborUpdate() 传到活塞
            → PistonBlock.tryMove()
                → calculatePush() 计算可推
                → addSyncedBlockEvent(0, dir)
                ▶ 不是 scheduleTick！方块事件走 processSyncedBlockEvents() 通道

【当前 blockTicks 全部执行完】
▶ fluidTicks 全部执行完

【随后】
  processSyncedBlockEvents()
    → PistonBlock.onSyncedBlockEvent(type=0)
        → move(extend=true)
            → 把前方被推的方块替换为 MOVING_PISTON + PistonBlockEntity

【再过 1 game tick】
  PistonBlockEntity.tick() 推进 progress += 0.5
【再过 1 game tick】
  progress = 1.0，放最终方块，移除 BE
```

所以**活塞机械的"信号到输出"延迟**是：信号检测当刻 + 2 tick 动画 = 通常 2~3 gt。

### 为什么红石火把熄灭需要 1 tick

红石火把 `neighborUpdate` 检测到自己被点亮（上方有信号）：
```java
RedstoneTorchBlock.neighborUpdate:
  world.scheduleTick(pos, this, 2);  // 延迟 2 gt 才关（1.8后）
```

这是 Mojang 的 BUD 机制修复，强行把红石火把的响应从"同步邻居更新"挪到了 scheduledTick。

## 八、时序脆弱性来源

理解了调度机制，就能解释红石社区里经典的问题：

| 现象 | 根本原因 |
|------|---------|
| **某些设计只在特定种子/坐标生效** | subTickOrder 与 `pos` 编码位置、区块加载顺序相关 |
| **重载世界后时序变了** | subTickOrder 在区块反序列化时重新分配（从负数开始 ++i），顺序不同 |
| **跨区块红石不可靠** | 区块候选 tick 的队列是按区块级 peek 比较，当两区块都各自有 2+ tick 时会交错执行 |
| **快速重复按键只响应一次** | HASH_STRATEGY 去重：(type, pos) 相同就视为同一 tick，第二次 scheduleTick 静默丢弃 |
| **观察者 0-tick 脉冲争议** | 观察者输出是 `setBlockState(POWERED, NOTIFY_NEIGHBORS)`（同步邻居），而自身熄灭由 `scheduleTick(1gt)` 触发 → 两者不在同阶段，所以脉冲宽度为 1 gt |

## 九、性能调优相关

| 优化点 | 原理 |
|--------|------|
| 红石线数量指数增长 → TPS 崩溃 | 每次 NOTIFY_NEIGHBORS 触发 6 个 neighborUpdate，每个可能再发 scheduleTick，链反应后 O(6^深度) |
| 区块卸载/切换频繁 → subTickOrder 被重置 | 大型农场按区块对齐，并让常加载区块顺序稳定 |
| 65536 上限被击穿 | 几乎只在"超大规模红石服务器（SciCraft 级别）"出现，可以自定义 fork 客户端/服务器调整 |
| 随机 tick 太慢（作物农场） | 调整 game rule `randomTickSpeed`（默认 3），或用 chunk loader 让区块常驻 |

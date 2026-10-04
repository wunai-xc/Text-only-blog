+++
title = "Minecraft 源码目录全解"
slug = "Complete-solution-of-Minecraft-source-directory"
date = 2026-10-05T04:45:00
updated = 2026-10-05
description = "Minecraft 源码目录全解"
tags = ["笔记", "Minecraft","源码"]
categories = ["笔记"]
cover = ""
pinned = false
draft = false
isAI = false
+++

# Minecraft 源码目录结构全解

> 本文档基于 yarn 映射的 Minecraft Java 版源码，完整解析 `src/main/java/net/minecraft/` 下的所有顶层包、核心子包与关键文件，帮助快速建立对源码整体结构的心智模型。

---

## 顶层包总览

标准源码的顶层包结构（`net.minecraft.*`）如下：

```
net.minecraft/
├── 启动与版本根文件
│   ├── Bootstrap.java           全局 Bootstrap 初始化（启动时调用所有 register）
│   ├── SharedConstants.java     全局常量（游戏版本号、快照标识、数据版本）
│   ├── GameVersion.java         版本号接口
│   ├── MinecraftVersion.java    版本号实现（协议版本、数据版本等）
│   └── SaveVersion.java         存档数据版本号
│
├── block/                       ★ 方块系统（约 300+ 个 Block 子类）
├── block/entity/                ★ 方块实体（BlockEntity，箱子/熔炉/活塞等有状态方块）
├── block/piston/                活塞推动算法与行为枚举
├── block/enums/                 方块属性用的枚举（PistonType、SlabType、RailShape 等）
├── block/dispenser/             发射器行为族（物品射出、装桶、TNT 点火等）
├── block/cauldron/              炼药锅交互行为表
├── block/spawner/               刷怪笼逻辑（MobSpawnerLogic、TrialSpawner 系列）
├── block/vault/                 Vault（试炼密室宝箱）数据结构
├── block/jukebox/               唱片机播放管理器与歌曲注册表
├── block/pattern/               方块模式匹配（下界合金门、Wither 构造检测）
│
├── item/                        ★ 物品系统（Item 子类 + 物品组）
├── item/map/                    地图物品逻辑（FilledMapItem 的辅助）
├── item/consume/                物品消费动作
├── item/tooltip/                Tooltip 渲染组件
├── item/equipment/              装备类型辅助
│
├── entity/                      ★ 实体系统（Entity 超类 + 100+ 实体子类）
├── entity/ai/                   实体 AI（行为树、brain、goal selector）【部分版本】
│
├── world/                       ★ 世界与维度层（最复杂的包之一）
│   ├── chunk/                   区块存储、调色板、ProtoChunk、区块序列化
│   ├── gen/                     世界生成（特征、生物群系、结构、噪声）
│   ├── tick/                    ★ BlockTickScheduler / ChunkTickScheduler
│   ├── timer/                   全局 WorldTickScheduler
│   ├── block/                   方块更新传播器（BUD/邻居更新用的 LevelPropagator）
│   ├── entity/                  实体管理、EntityTracking、ChunkEntityManager
│   ├── spawner/                 自然刷怪（SpawnHelper 之外的系统）
│   ├── biome/                   生物群系
│   ├── dimension/               维度类型（Overworld/Nether/End）
│   ├── border/                  世界边界（WorldBorder）
│   ├── poi/                     POI（兴趣点，村民寻路用）
│   ├── storage/                 区域文件（Anvil .mca）读写
│   ├── explosion/               爆炸算法
│   ├── event/                   GameEvent / Sculk Sensor 振动事件
│   ├── level/                   光源计算、高度图
│   ├── debug/                   调试界面 DebugRenderer 的世界数据
│   ├── updater/                 邻接状态更新器
│   ├── rule/                    放置/破坏规则
│   └── waypoint/                路径点（指南针 / Recovery Compass）
│
├── server/                      ★ 服务端层
│   ├── MinecraftServer.java     服务端主循环、tick 调度中枢
│   ├── Main.java                服务端入口
│   ├── PlayerManager.java       在线玩家管理、玩家加入/退出
│   ├── ServerNetworkIo.java     Netty 连接接受器
│   ├── DataPackContents.java    数据包加载与重加载
│   ├── SaveLoading.java         存档载入流程
│   ├── world/                   ServerWorld（服务端专用世界实现）
│   ├── network/                 服务端→客户端数据包处理器
│   ├── command/                 命令系统（/gamemode、/give、/fill 等）
│   ├── function/                Minecraft Function（mcfunction）
│   ├── dedicated/               专用服务器配置（DedicatedServer）
│   ├── integrated/              单人玩家集成服务器
│   ├── rcon/                    远程控制台 RCON
│   ├── filter/                  聊天过滤器（文字审查）
│   ├── chase/                   观察者模式追踪工具
│   ├── debug/                   服务端调试命令
│   └── Banned*/Whitelist/       封禁/白名单/OP 权限列表
│
├── client/                      客户端层（MinecraftClient、窗口、键鼠输入）
│   ├── MinecraftClient.java     ★ 客户端主循环（最重要的客户端类）
│   ├── ClientBootstrap.java     客户端启动初始化
│   ├── Keyboard.java / Mouse.java / WindowSettings.java
│   ├── RunArgs.java             命令行参数解析
│   └── QuickPlay*.java          快速游戏功能
│
├── network/                     ★ 网络层
│   ├── ClientConnection.java    Netty 连接封装
│   ├── PacketByteBuf.java       数据包序列化缓冲区
│   ├── RegistryByteBuf.java     带注册表对象的数据包缓冲
│   ├── NetworkPhase.java        网络连接阶段枚举（Handshake/Status/Login/Play）
│   └── NetworkSide.java         服务端/客户端侧标识
│
├── nbt/                         ★ NBT 二进制格式（存档/数据包内部使用）
│   ├── NbtCompound.java         复合标签（NBT TAG_Compound）
│   ├── NbtIo.java               NBT 文件读写（gzip 压缩）
│   ├── NbtHelper.java           NBT ↔ BlockState / UUID 互转
│   ├── NbtOps.java              NBT 与 DynamicOps 桥接（Codec 互操作）
│   ├── SnbtParsing.java         SNBT 字符串解析（命令中使用的 {...} 语法）
│   └── NbtByte/Short/Int/Long/Float/Double/String/ByteArray/IntArray/LongArray
│
├── registry/                    ★ 注册表系统（核心抽象层）
│   ├── Registries.java          ★ 所有静态注册表的集中入口
│   ├── Registry.java            Registry 接口
│   ├── RegistryKeys.java        注册表的 Key（BLOCK、ITEM、ENTITY_TYPE...）
│   ├── SimpleRegistry.java      简单注册表实现
│   ├── DefaultedRegistry.java   带默认值（AIR）的注册表
│   ├── BuiltinRegistries.java   启动时内置静态注册的世界生成内容
│   ├── DynamicRegistryManager.java 动态注册表（数据包加载的 biomes/structures）
│   └── SerializableRegistries.java 可序列化注册表（用于网络同步、存档）
│
├── state/                       方块/流体属性状态系统
│   ├── State.java               State 基类（BlockState / FluidState 的抽象父类）
│   ├── StateManager.java        ★ 属性笛卡尔积生成器（所有 Block/Fluid 共用）
│   └── property/                Property<T> 及 8 种内置属性类型
│       ├── Property.java
│       ├── BooleanProperty.java
│       ├── EnumProperty.java
│       ├── IntProperty.java
│       └── DirectionProperty.java
│
├── recipe/                      ★ 合成/烧炼/锻造配方系统（1.18 后 Data-Driven）
│   ├── ShapedRecipe.java        有序合成
│   ├── ShapelessRecipe.java     无序合成
│   ├── SmeltingRecipe.java      烧炼（Furnace）
│   ├── BlastingRecipe.java      高炉
│   ├── SmokingRecipe.java       烟熏炉
│   ├── CampfireCookingRecipe.java  营火
│   ├── StonecuttingRecipe.java  切石机
│   ├── Smithing*.java           锻造台（升级/纹饰）
│   ├── RecipeManager.java       配方总管理器
│   └── Ingredient.java          配方匹配输入原料
│
├── inventory/                   ★ 物品库存系统
│   ├── Inventory.java           基本 27/54 格库存
│   ├── SimpleInventory.java     简单可变库存
│   ├── SidedInventory.java      带侧面访问（漏斗 hopper）
│   ├── DoubleInventory.java     大箱子的左右双格合并
│   ├── CraftingInventory.java   工作台 3×3 合成格
│   ├── RecipeInputInventory.java 配方输入
│   ├── SlotRange.java           槽位范围（1.21 新增，代替硬编码的 slot 区间）
│   └── Inventories.java         库存工具类（copy/drop/split）
│
├── screen/                      GUI 屏幕
│   ├── ScreenHandler.java       服务端 GUI 逻辑（Slot 布局、点击逻辑）
│   ├── NamedScreenHandlerFactory.java  GUI 工厂接口
│   └── handler/                 每类 GUI 的 ScreenHandler（Crafting/Furnace/Enchantment...）
│
├── command/                     命令引擎（Brigadier 之上的包装）
│   ├── CommandSource.java       命令执行上下文（ServerCommandSource）
│   ├── CommandRegistryAccess.java 注册表访问
│   ├── EntitySelector.java      @p/@a/@e 目标选择器解析
│   ├── argument/                命令参数类型（BlockPos、Entity、ItemStack...）
│   └── DataCommandObject.java   /data 命令读写的 NBT 路径访问
│
├── loot/                        Loot 表系统（掉落/宝箱/战利品）
│   ├── LootTable.java           战利品表
│   ├── LootPool.java            奖池
│   ├── LootDataType.java        loot 数据类型
│   └── LootTables.java          内置所有 Loot 表的 Key 定义
│
├── advancement/                 成就（Advancement）系统
│   ├── Advancement.java
│   ├── AdvancementManager.java
│   ├── AdvancementCriterion.java
│   ├── AdvancementProgress.java
│   └── PlayerAdvancementTracker.java  玩家的成就追踪
│
├── enchantment/                 附魔系统
│   ├── Enchantment.java         附魔基类（Sharpness/Power...）
│   ├── Enchantments.java        所有附魔的静态注册表入口
│   ├── EnchantmentHelper.java   附魔计算（伤害加成、掉落率加成）
│   └── EnchantmentLevelBasedValue.java 附魔等级的数值插值
│
├── fluid/                       流体系统
│   ├── Fluid.java               Fluid 类型基类（与 Block 对应）
│   ├── Fluids.java              所有内置 Fluid（WATER、FLOWING_WATER、LAVA、FLOWING_LAVA）
│   ├── FluidState.java          流体状态（类似 BlockState，但属性是 LEVEL）
│   └── FlowableFluid.java      流体流动计算（流速、流向、渗透到邻居）
│
├── particle/                    粒子系统
│   ├── ParticleEffect.java      粒子类型的 Codec
│   ├── ParticleTypes.java       所有内置粒子类型
│   ├── DustParticleEffect.java  红石粉尘、Trail、SculkCharge
│   └── VibrationParticleEffect.java  振动粒子（Sculk 相关）
│
├── potion/                      药水效果系统
│   ├── Potion.java              药水类型（Water、Awkward、Regeneration...）
│   └── Potions.java             所有药水类型的注册表入口
│
├── component/                   ★ 1.20.5 新增的数据组件系统（取代 ItemStack NBT 的一部分）
│   ├── DataComponentTypes.java  ★ 所有内置组件类型的 Key
│   ├── ComponentMap.java        组件的不可变映射
│   ├── ComponentHolder.java     持有组件的接口（ItemStack 主要实现类）
│   ├── EnchantmentEffectComponentTypes.java 附魔效果组件
│   └── ComponentType.java       单个组件类型定义
│
├── predicate/                   条件谓词（Loot/Advancement/Command 共用）
│   ├── BlockPredicate.java      方块匹配（方块、状态、NBT、标签）
│   ├── DamagePredicate.java     伤害来源匹配
│   ├── FluidPredicate.java      流体匹配
│   ├── LightPredicate.java      光照级别
│   ├── NbtPredicate.java        NBT 路径值
│   ├── StatePredicate.java      BlockState 精确匹配
│   └── TagPredicate.java        标签（#minecraft:logs 之类）
│
├── village/                     村民与村庄
│   ├── VillageGossip.java       村民交易/声望内部的"八卦"数据结构
│   └── ... 各版本差异较大
│
├── structure/                   结构（Villages/Strongholds/Mineshafts 等）
│   ├── Structure.java           结构类基类
│   ├── StructurePiecesGenerator.java 结构碎片生成
│   └── StructurePlacementData.java   结构放置参数
│
├── scoreboard/                  记分板系统
│   ├── Scoreboard.java          记分板主类
│   ├── ScoreboardObjective.java 计分项目（Objectives）
│   ├── ScoreboardCriterion.java 计分判据（dummy/health/deathCount...）
│   └── Team.java                队伍（颜色/碰撞规则/名字标签）
│
├── resource/                    资源加载与数据包
│   ├── ResourcePack.java        资源包
│   ├── DataConfiguration.java   数据包启用配置
│   └── ReloadableResourceManagerImpl.java 重载管理器
│
├── text/                        聊天文本组件（Text / LiteralTextContent ...）
│   └──（通常在另一包 util/text 或根包下）
│
├── util/                        ★ 通用工具集合（最大的杂项包）
│   ├── math/                    BlockPos/Vec3d/Vec3i/Direction/DirectionAxis/Box 等★
│   ├── shape/                   VoxelShape/AABB 碰撞箱与布尔运算 ★
│   ├── collection/              FastHash/Object2IntMap/PairList 等自定义集合
│   ├── dynamic/                 DynamicOps（Codec 互操作）★
│   ├── context/                 调用上下文（TypeContext）
│   ├── crash/                   崩溃报告（CrashReport）
│   ├── profiler/                性能分析器（Debug pie chart 数据源）
│   ├── logging/                 日志与警告抑制
│   ├── thread/                  线程工具（MainThreadExecutor）
│   ├── function/                额外函数式接口（TriConsumer 等）
│   ├── hit/                     射线穿透结果（BlockHitResult / EntityHitResult）
│   ├── path/                    路径查找结果
│   ├── annotation/              注解（@Environment 等）
│   ├── Identifier.java          ★ 资源定位符 "minecraft:stone"
│   ├── DyeColor.java            染色枚举（16色）
│   ├── Formatting.java          文本格式代码（§c §k...）
│   ├── Util.java                ★ 最常用工具类（计时、线程、MainExecutor）
│   ├── Pair.java                双值对
│   ├── Cooldown.java            冷却计时器
│   ├── ItemScatterer.java       掉落物品散射
│   ├── ActionResult.java        操作结果枚举（SUCCESS/CONSUME/PASS/FAIL）
│   ├── BlockRotation.java / BlockMirror.java  方块旋转/镜像
│   └── ... 上百个工具类
│
├── sound/                       声音系统
│   ├── SoundEvent.java          声音事件类型
│   └── SoundEvents.java         所有内置声音的注册表入口
│
├── stat/                        统计数据
│   ├── Stat.java                统计项（walkOneCm/useItem 等）
│   └── Stats.java               所有内置统计入口
│
├── datafixer/                   数据修正（DataFixerUpper，存档数据版本迁移）
│   ├── Schemas.java             数据版本的 schema 进化链
│   ├── FixUtil.java             TypeReferences 快捷引用
│   └── TypeReferences.java      DFU 类型引用常量
│
├── storage/                     数据存储
│   ├── ReadView.java / WriteView.java  1.21 通用 NBT 读写视图（取代 NbtCompound 直接访问）
│   └── DataCache.java
│
├── dialog/                      NPC 对话系统（1.21.1 Tricky Trials 新增）
│   ├── DialogTypes.java
│   └── Dialogs.java
│
├── data/                        Data Generator（数据驱动内容生成）
│   └── Main.java                `gradlew runData` 入口
│
├── gametest/                    Game Test 框架
│   └── Main.java                GameTest 自动测试运行器
│
├── test/                        单元测试
│
└── unused/                      未使用的遗留代码（Mojang 懒得删）
    └── ...
```

---

## 五个最大、最核心的包

按代码量和复杂度排序：

### 1. `world/` 世界层
- **最复杂，最值得先看**，所有红石/方块/实体/区块的交互都在这里
- 关键子包：
  - `world/tick/` BlockTickScheduler（红石微时序核心）
  - `world/chunk/` 区块与调色板（存储层）
  - `world/gen/` 世界生成（生物群系、噪声、结构）
  - `world/block/` 方块更新传播器（BUD 来源）
  - `World.java` 世界基类，`ServerWorld` 继承自它
  - `WorldEvents.java` 客户端世界特效事件常量（破块音、粒子）

### 2. `block/` 方块系统
- 每个 Block 子类 = 游戏中的一种方块（约 300 个文件）
- 关键基础类：
  - `Block.java` ★ 所有方块的超类（100+ 回调方法，见方块系统文章）
  - `BlockState.java` 方块状态（不可变记录）
  - `Blocks.java` ★ 所有内置方块的 static final 实例（Blocks.STONE、Blocks.PISTON...）
  - `AbstractBlock.java` Block 父类的 Settings 构建器
  - `FacingBlock.java` / `HorizontalFacingBlock.java` / `WallMountedBlock.java` 常见抽象基类
- 行为枚举：`piston/PistonBehavior.java`（NORMAL/DESTROY/BLOCK/PUSH_ONLY/IGNORE）

### 3. `server/` 服务端
- `MinecraftServer.java` ★ 整个游戏的 tick 大循环起点
- `PlayerManager.java` 玩家连接、加入、断开、数据包广播
- `world/ServerWorld.java` 服务端世界实现（`tick()` 方法就是微时序图）
- `network/ServerPlayNetworkHandler.java` 每个客户端连接对应的数据包处理循环
- `command/` 所有 `/` 命令的注册

### 4. `entity/` 实体系统
- `Entity.java` 所有实体的超类（位置、速度、NBT 序列化、tick 调度）
- `LivingEntity.java` 所有生物的父类（血量、AI、药水）
- `EntityType.java` 实体类型注册表（与方块 BLOCK 对应）
- `EntityDimensions.java` 实体碰撞箱（不同姿势、不同阶段不同尺寸）
- 每个 MC 实体对应一个文件：`CreeperEntity.java`/`ZombieEntity.java`/`PlayerEntity.java` 等
- 每个实体子类一般有 50-200 行的特定行为

### 5. `network/` + `server/network/` 网络
- `PacketByteBuf` 数据包编码解码的 Netty 缓冲区
- 每个数据包由两个文件组成（1.20.2 及以后拆分）：
  - `packet/c2s/play/*C2SPayload` 客户端→服务端
  - `packet/s2c/play/*S2CPayload` 服务端→客户端
- `NetworkPhase`：连接四阶段（HANDSHAKE → STATUS → LOGIN → CONFIGURATION → PLAY）

---

## 八张"全局地图"式的文件

这些文件是快速定位某个特性的入口地图，**务必先记下它们的位置**：

| 文件 | 作用 | 你会如何用它 |
|------|------|-------------|
| `Blocks.java` | 所有方块单例 static final 定义 | "红石块" → 找 `Blocks.REDSTONE_BLOCK` 反查类型 → `RedstoneBlock.java` |
| `Items.java` | 所有物品单例定义 | "附魔金苹果" → `Items.ENCHANTED_GOLDEN_APPLE` |
| `Fluids.java` | 所有流体类型 | 水/熔岩及其流动态 |
| `ParticleTypes.java` | 所有粒子类型 | 100+ 种粒子效果 |
| `SoundEvents.java` | 所有声音事件 | 400+ 种声音 key |
| `Enchantments.java` | 所有附魔 | 附魔效果 id → 类 |
| `EntityType.java` (文件) | 所有实体类型 Builder | 实体 key → 构造器 |
| `Registries.java` | 所有注册表的 Key | "我要注册一个 X，应该用哪个 RegistryKey" |

---

## 六个最关键的基础概念类

想读懂其他代码，先理解这六个类：

### 1. `util/Identifier.java`
```java
new Identifier("minecraft", "stone")     →  "minecraft:stone"
```
资源/方块/物品/附魔的**唯一名字**，全源码 99% 的注册表 key 用这个。由 namespace + path 组成。

### 2. `util/math/BlockPos.java`
```java
BlockPos pos = new BlockPos(x, y, z);
pos.offset(Direction.EAST, 2);
```
世界中一个方块坐标（整数 xyz）。绝大多数方法都以 BlockPos 为参数。

### 3. `util/math/Direction.java`
```java
Direction.NORTH / EAST / SOUTH / WEST / UP / DOWN
direction.getOffsetX() / getVector() / rotateY() / getOpposite()
```
6 个方向 + 各种轴向/旋转运算，方块朝向、红石传播方向全靠它。

### 4. `nbt/NbtCompound.java`
```java
compound.putString("id", "minecraft:creeper")
compound.putInt("health", 20)
compound.getCompound("Pos")...
```
**TAG_Compound** — 存档里所有方块、实体、物品的底层数据格式，类似 Map<String, NbtElement>。

### 5. `registry/Registry<T>`
```java
Registry.register(Registries.BLOCK, "stone", new StoneBlock(...))
```
Minecraft 对所有"可枚举的事物"都用 Registry。它维护 id(int) ↔ key(Identifier) ↔ obj(T) 的三向映射。

### 6. `state/StateManager.Owner<S>`
```java
appendProperties(builder) → builder.add(FACING, POWERED)
```
Block 与 Fluid 实现此接口，声明自己有哪些属性。StateManager 自动生成属性的笛卡尔积，每个组合一个 BlockState 实例。

---

## 启动与 tick 调用链（从入口到方块 tick）

```
server/Main.java
  → MinecraftServer.main(args)
    → MinecraftServer.startServer()
      ├─ Bootstrap.initialize()     →  所有 Registry.register() 全部执行完毕
      ├─ SaveLoader.load()         →  加载 world 存档
      └─ MinecraftServer.runServer()  主循环
           while (!isStopped):
             ├─ tick() ★ 每一帧执行
             │   ├─ tickTickManager()
             │   ├─ world.tick()   →  ServerWorld.tick()
             │   │                    ├─ weather
             │   │                    ├─ time
             │   │                    ├─ blockTickScheduler.tick()   （微时序 HIGH 先）
             │   │                    ├─ fluidTickScheduler.tick()
             │   │                    ├─ processSyncedBlockEvents()
             │   │                    ├─ entity.tick()
             │   │                    └─ player.tick()
             │   ├─ playerManager.update()  玩家发数据包
             │   └─ network.tick()         Netty IO 轮询
             └─ sleep(1ms)          让出 CPU，等下一刻
```

---

## 阅读源码建议顺序

如果你是第一次读 MC 源码，不要按字母顺序翻文件！用下面的路线：

```
第 1 步：基础概念
  util/Identifier            资源命名
  util/math/BlockPos         位置
  util/math/Direction        方向
  state/                     属性系统

第 2 步：方块层
  block/Block.java           方块基类（理解 30+ 个回调方法）
  block/BlockState.java      状态
  block/Blocks.java          地图索引
  registry/Registries.java   注册表总索引

第 3 步：世界层
  world/World.java           世界基类
  world/tick/                tick 调度器
  world/chunk/               区块存储

第 4 步：实战专题
  block/PistonBlock + block/piston/  → 活塞系统
  block/RedstoneWireBlock            → 红石线
  block/entity/HopperBlockEntity     → 漏斗
  world/gen/biome/                   → 生物群系
  entity/*Entity.java                → 自己感兴趣的实体

第 5 步：高级系统
  server/MinecraftServer.java
  server/network/
  world/gen/noise/          世界生成噪声
  datafixer/                存档升级
  component/                数据组件（1.20.5）
```

---

## 命名约定（Mojang 风格）

| 前缀/后缀 | 含义 | 例子 |
|-----------|------|------|
| `Abstract*` | 抽象基类，提供部分默认行为 | `AbstractFurnaceBlockEntity` |
| `*Block` | 方块 | `PistonBlock` |
| `*Entity` | 实体 | `CreeperEntity` |
| `*BlockEntity` | 方块实体 | `ChestBlockEntity` |
| `ScreenHandler` | GUI 服务端逻辑 | `FurnaceScreenHandler` |
| `*Payload` | 1.20.2+ 网络数据包 | `ChatMessageS2CPayload` |
| `*Types` / `*s`（复数） | 静态注册表入口 | `Blocks`、`Items`、`SoundEvents` |
| `get*State` / `set*State` | BlockState 访问 | `getBlockState` / `setBlockState` |
| `can*` / `is*` | 布尔判断 | `canPlaceAt` / `isEmittingRedstonePower` |
| `scheduleTick` | 安排 scheduledBlockTick | `world.scheduleTick(pos, block, delay)` |
| `on*` | 事件回调 | `onPlaced` / `onBroken` / `onUse` |

掌握这些命名约定后，很多时候你可以"用名字猜中功能"，不需要挨个打开文件。

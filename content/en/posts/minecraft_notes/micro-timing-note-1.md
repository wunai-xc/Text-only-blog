+++
title = "Micro-timing Note 1"
slug = "micro-timing-note-1"
date = 2026-10-02T00:33:00
updated = 2026-10-02
description = "Notes about Minecraft micro-timing"
tags = ["notes", "Minecraft"]
categories = ["notes"]
cover = ""
pinned = false
draft = false
isAI = false
+++

## 1 Micro-timing

Timing within a game tick.

When `tps = 20`, `1s = 20gt`
`1gt = 50ms`
`gt` is short for Gametick.

### 1.1 Order of events within `1gt`:

1. World border check `worldBorder.tick()`
2. Weather update `tickweather()`
3. Sleep handling
4. Ambient darkness calculation `calculateAmbientDarkness()`
5. Advance game time `tickTime()`
6. Block ticks `blockTickScheduler.tick()`
7. Fluid calculation `fluidTickScheduler.tick()`
8. Raid handling `raidManager.tick()`
9. Chunk generation and loading `chunkManager.tick()`
10. Synced block events `processSyncedBlockEvents()`
11. Entity tick `entity.tick()`
12. Player tick `player.tick()`
13. Miscellaneous chunk management `world.getChunkManager().tick()`

#### 1.1.1 In simpler terms:

1. `wtu` world time
2. `tt` scheduled ticks
3. `ct` chunk ticks, and `rt` random ticks
4. `be` block events
5. `eu` entity updates
6. `te` block entities
7. `nu` async events / player actions

### 1.2 Two kinds of updates

nc update order: `west, east, down, up, north, south`

pp update order: `west, east, north, south, down, up`

## 2 NTE scheduled-tick priority

### 2.1 Scheduled ticks

In Java Edition, scheduled ticks come in two kinds: block scheduled ticks and fluid scheduled ticks. The order in which a scheduled tick runs depends on its priority; the smaller the priority value, the earlier it runs within a game tick. The usual scheduled-tick priority is 0.

### 2.2 Repeater priority:

1. A repeater that latches another repeater has priority `-3`;
2. A normally working repeater has priority `-1` on the rising edge and `-2` on the falling edge;

### 2.3 Comparator priority:

1. A comparator that latches a repeater has priority `-1`;
2. A normally working comparator has priority `0`;

### 2.4 Priority of other NTE components:

Other NTE components, such as redstone torches, have priority `0`.
And priorities have the following properties:
 1. Within the same NTE event, a component with a smaller priority updates first;
 2. When priorities are equal, the basic component-update theorem applies.

### 2.5 NTE scheduled-tick component delays:

| Component | Rising edge | Falling edge |
| --- | --- | --- |
| Button | * | falling [20-30gt] |
| Detector rail | * | falling [0-20gt] |
| Lectern | * | falling [2gt] |
| Observer | rising [2gt] | falling [2gt] |
| Pressure plate | * | falling [0-10/20gt] |
| Target block | * | falling [8/20gt] |
| Tripwire hook | * | falling [0-10gt] |
| Lightning rod | * | falling [8gt] |
| Redstone torch | rising [2gt] | falling [2gt] |
| Redstone comparator | rising [2gt] | falling [2gt] |
| Redstone repeater | rising [2/4/6/8gt] | falling [2/4/6/8gt] |
| Command block | rising [1 (needs testing)] | * |
| Dispenser | rising [4gt] | * |
| Dropper | rising [4gt] | * |
| Redstone lamp | * | falling [4gt] |
| Crafter | rising [4gt] | * |

## 3 The two meanings of "piston 3gt in place"

`3gt` to complete the work with activation delay; `b36` exists for `3gt`.

## 5 Observer

A piston pushes a lit observer; after it is in place there is no update.

## 6 Tree farm bone-meal dispenser

Four shots of bone meal on a `4gt` tree farm improve efficiency by **23%**.
Four shots of bone meal on a `6gt` tree farm improve efficiency by **4%**.

## 7 Key points for timing analysis, shared by astx

#### How an observer works:

1. State change
2. pp update
3. If it turns on, schedule a tick
4. Finally, nc update

#### A lit observer does not accept a pp update that schedules a tick.

#### In an NTE executed at that scheduled tick, a tick can still be scheduled even if it has not begun its work.
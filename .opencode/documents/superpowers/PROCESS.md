# Superpowers 工程流程

## 概述

Superpowers 是一套从创意到交付的完整工程流程，包含头脑风暴、设计文档、实施计划、执行实现、自检、验证测试和完成七个阶段。

---

## 完整流程图

```mermaid
flowchart TD
    A["🎯 创意/需求"] --> B["🧠 头脑风暴 Brainstorming"]
    B --> C["📝 撰写设计文档 Spec"]
    C --> D["📋 编写实施计划 Writing Plans"]
    D --> E["🚀 执行实现 Subagent Driven Dev"]
    E --> F["🔍 自检 Code Review"]
    F --> G["✅ 验证测试 Verification"]
    G --> H["🎉 完成 Finishing Branch"]
    
    B -.->|"探索项目上下文"| I["查看文件/文档/提交历史"]
    B -.->|"视觉问题?| J["提供 Visual Companion"]
    B -.->|"一次一个问题"| K["澄清性问题"]
    B -.->|"2-3种方案| L["方案对比与推荐"]
    
    C -.->|"保存至"| M["docs/superpowers/specs/"]
    C -.->|"自检"| N["占位符/一致性/范围/歧义"]
    
    D -.->|"分步骤| O["任务分解 + 检查点"]
    
    E -.->|"独立任务| P["Subagent 执行"]
    E -.->|"并发| Q["并行 Subagent"]
    
    F -.->|"自检清单| R["代码审查清单"]
    
    G -.->|"验证命令| S["lint/typecheck/测试"]
    
    H -.->|"合并方式| T["Merge/PR/Cleanup"]
```

---

## 阶段详解

### 1️⃣ 头脑风暴 Brainstorming

**目的**: 将想法转化为完整的设计

**检查清单**:
- [ ] 探索上下文 - 查看项目文件、文档、最近提交
- [ ] 视觉问题? - 需要可视化就先提供 Visual Companion
- [ ] 一次一个问题 - 理解目的/约束/成功标准
- [ ] 提出 2-3 方案 - 包含权衡分析和推荐
- [ ] 展示设计 - 分段展示，每段获批后继续
- [ ] 写入设计文档 - `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
- [ ] 自检 - 占位符/一致性/范围/歧义
- [ ] 用户审批 - 用户确认后才能进入下一步

**硬规则**: 在用户批准设计前，**绝对不能**写代码或调用实现类 skill

**相关文件**:
- Skill: `brainstorming`
- Visual Companion: `visual-companion.md`

---

### 2️⃣ 撰写设计文档 (Spec)

**保存位置**: `docs/superpowers/specs/<date>-<topic>-design.md`

**自检清单**:
- [ ] 扫描占位符 (TBD/TODO/模糊需求)
- [ ] 检查内部一致性 (架构 vs 功能描述)
- [ ] 范围检查 (是否足够一个实施计划)
- [ ] 歧义检查 (是否有多种解释)

---

### 3️⃣ 编写实施计划 (Writing Plans)

**目的**: 将设计拆解为可执行的步骤

**检查清单**:
- [ ] 任务分解 - 大的设计 → 小的可操作任务
- [ ] 检查点 - 设定 Review 节点
- [ ] 执行步骤 - 明确的先后顺序

**相关文件**:
- Skill: `writing-plans`

---

### 4️⃣ 执行实现 (Subagent Driven Development)

**目的**: 使用 subagent 并行或串行执行独立任务

**执行方式**:

| 方式 | 适用场景 |
|------|---------|
| 串行 | 任务有依赖，必须按顺序 |
| 并行 | 独立任务，可同时执行 |

**相关文件**:
- Skill: `subagent-driven-development`

---

### 5️⃣ 自检 (Code Review)

**时机**: 实现完成后、提 PR 前

**自检清单**:
- [ ] 功能是否完整
- [ ] 代码质量/风格
- [ ] 是否有副作用
- [ ] 测试覆盖

**相关文件**:
- Skill: `code-reviewer`
- Skill: `receiving-code-review`

---

### 6️⃣ 验证测试 (Verification)

**必须验证**:
- [ ] Lint 检查
- [ ] Typecheck
- [ ] 测试通过

**相关文件**:
- Skill: `verification-before-completion`

---

### 7️⃣ 完成 (Finishing Branch)

**选项**:
- Merge 到主分支
- 创建 PR
- 清理分支

**相关文件**:
- Skill: `finishing-a-development-branch`

---

## 关键原则

1. **YAGNI (You Aren't Gonna Need It)** - 彻底删除不必要的功能
2. **一次一问** - 不以问题压倒用户
3. **增量验证** - 每段设计获批后才继续
4. **设计优先** - 禁止在批准前写代码
5. **隔离与清晰** - 小而专注的模块

---

## 流程总结

```
🧠 头脑风暴 → 📝 设计文档 → 📋 实施计划 → 🚀 实现 → 🔍 自检 → ✅ 验证 → 🎉 完成
```

**每个阶段都有检查点和用户审批，确保方向正确再继续。**

---

## 相关 Skills

| Skill | 用途 |
|-------|------|
| brainstorming | 头脑风暴，将想法转化为设计 |
| writing-plans | 编写实施计划 |
| subagent-driven-development | Subagent 执行模式 |
| code-reviewer | 代码自检 |
| receiving-code-review | 接收代码审查反馈 |
| verification-before-completion | 验证测试 |
| finishing-a-development-branch | 完成开发分支 |

---

**文档更新时间**: 2026-04-09 23:30

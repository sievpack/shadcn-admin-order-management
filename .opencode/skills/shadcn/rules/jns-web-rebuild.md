

样式与UI
前端框架使用React 18
Vite 作为构建工具
Shadcn/UI 组件库，所有组件必须符合shadcn-ui v4的设计风格
所有的通知(Toast)都必须使用shadcn-ui的Sonner组件
Alert组件必须使用shadcn-ui的Alert Dialog组件
Tailwind CSS 用于样式
Axios 用于 API 调用
使用 Tailwind CSS 编写样式，禁止内联 style（除非动态值）。
组件样式优先通过 className 组合实现，遵循 Tailwind 最佳实践。
使用 Shadcn/UI 组件库作为基础，自定义主题通过 tailwind.config.js 覆盖。
响应式设计：采用移动优先，使用 sm:、md: 等断点。

组件编写
优先函数组件 + Hooks，避免类组件。
每个组件一个文件，使用 PascalCase 命名，导出方式：export default function ComponentName() {}。
使用 Props 类型定义：interface ComponentNameProps { ... }，并在组件参数中解构。
复杂逻辑抽取到自定义 hooks（以 use 前缀命名）。
使用 React.memo 或 useMemo/useCallback 仅在必要时优化，避免过度使用。

后端框架使用FastAPI
数据库使用Microsoft SQL Server
根据现有数据库结构创建 SQLAlchemy 模型

# Coolove UI

从 `stock-widget`（A+ 助手）提炼的可调透明度玻璃风格组件库。纯 CSS + 一个可选的小 JS，无依赖，Vue / 原生 HTML 都能用。当前版本见 `coolove-ui.css` 头部注释和 [CHANGELOG](./CHANGELOG.md)。

```
coolove-ui/
├── coolove-ui.css          # 全部 token 与组件样式（cl- 前缀）
├── coolove-ui.js           # 可选：主题控制、toast、右键菜单、对话框、走势图等
├── vue/useCooloveTheme.ts  # Vue 3 接入（不依赖 coolove-ui.js）
├── index.html              # 组件展示页，直接双击打开
└── CHANGELOG.md
```

## 风格要点（来自原项目）

| 规则 | 做法 |
| --- | --- |
| 窗口可调透明度 | `--window-bg = 主题底色 × --bg-opacity`，配合 `backdrop-filter: blur(--glass-blur)`。**整个窗口只有一层玻璃**，内部区域不要再铺 `--window-bg`，否则透明度会叠加失真 |
| 内部元素不自带底色 | 卡片、输入框只叠加极淡的白/黑蒙层（`--surface-1 ~ 4` = 2.5% ~ 12%） |
| 浮层永远看得清 | 弹窗、菜单、下拉用不透明的 `--solid-bg`；需要时 `data-overlay="glass"` 改成半透明 |
| 红涨绿跌 | `--rise / --fall` 语义色（文字），`--rise-strong / --fall-strong`（柱、K 线），`data-trend="intl"` 一键切换 |
| 小部件尺度 | 11–14px 字号、26–30px 控件高度、8 / 12 / 14 / 22px 圆角 |
| 紧凑列表 | 悬停/选中不改变卡片内部布局，拖动柄与删除按钮浮在列表留白里 |
| 窗口装饰 | 红黄绿交通灯（悬停显示图标）、A+ 品牌徽标、底部状态栏 |

## 快速开始

```html
<link rel="stylesheet" href="coolove-ui.css">
<script src="coolove-ui.js"></script>

<div class="cl-window">
  <header class="cl-titlebar">…</header>
  <div class="cl-list">
    <div class="cl-card">…</div>
  </div>
  <footer class="cl-statusbar">…</footer>
</div>

<script>
  CooloveUI.applyTheme({ theme: 'dark', opacity: 0.85, accent: '#1d9bf0' })
  CooloveUI.init()
</script>
```

不用 JS 也可以，直接在 `<html>` 上写属性和变量：

```html
<html data-theme="dark" data-trend="cn" style="--bg-opacity:.7; --accent:#8b5cf6">
```

## 可调参数

| 参数 | 位置 | 说明 |
| --- | --- | --- |
| `data-theme` | 属性 | `dark` / `light` / `custom` |
| `--bg-opacity` | 变量 | 窗口背景不透明度 0–1 |
| `--glass-blur` | 变量 | 模糊半径，默认 26px |
| `--accent` | 变量 | 强调色，其余强调色深浅自动派生 |
| `--r` | 变量 | 圆角缩放，1 为原版 |
| `--custom-rgb` / `--custom-fg` | 变量 | 自定义主题底色（`"31 41 55"`）与文字色 |
| `data-density` | 属性 | `comfortable` / `compact` |
| `data-trend` | 属性 | `cn` 红涨绿跌 / `intl` 绿涨红跌 |
| `data-overlay` | 属性 | `solid` / `glass` |
| `--spark-stroke` | 变量 | 迷你走势线宽，默认 1.2px |
| `--list-gutter` | 变量 | `.cl-list` 横向留白（浮动操作所在位置），默认 10px |

> token 都声明在 `:root, [data-theme]` 上。改 `--bg-opacity` 这类变量时，要写在带 `data-theme` 的同一个元素上，派生色才会跟着重算。

### 图表 token

| token | 用途 |
| --- | --- |
| `--chart-grid` / `--chart-axis` / `--chart-hover` / `--chart-area` | 网格线、坐标文字、悬停十字线、面积填充 |
| `--series-1..4` | 多条线的系列色（如 MA5/10/20/30），浅色主题自动加深 |
| `--series-avg` | 均价线 |

## 组件一览

- **窗口**：`cl-window` `cl-titlebar` `cl-traffic` `cl-brand` `cl-statusbar`（`__time.is-delayed / is-stale`）`cl-panel`
- **按钮**：`cl-btn`（primary / soft / outline / ghost / danger / danger-solid，sm / lg / icon / pill / block，`is-loading`）、`cl-iconbtn`（accent / danger / sm）、`cl-btn-group`、`cl-close`
- **表单**：`cl-input`（sm / lg）`cl-input-wrap`（前后缀）`cl-select` `cl-textarea` `cl-stepper` `cl-search`（`__results` `__message`）`cl-field` `cl-setting`
- **选择**：`cl-switch` `cl-check` `cl-radio` `cl-segmented`（block / subtle / ghost / sm / xs）`cl-range` `cl-swatches` `cl-color`
- **标签**：`cl-pill`（rise / fall / solid）`cl-badge` `cl-tag` `cl-dot`（live 呼吸）`cl-count` `cl-kbd` `cl-tile`、`data-tip` 提示
- **列表**：`cl-list`（flush）`cl-card`（`__main / __main--stack / __info / __row / __title / __sub / __chart / __side / __value / __figure / __meta / __icon / __handle / __remove / __strip`，`is-selected / is-dragging / is-drop-target`）
- **数据**：`cl-stat`（compact）`cl-stat-grid` `cl-table` `cl-kv` `cl-spark` `cl-chart__*` `cl-tooltip-card` `cl-bars` `cl-accordion` `cl-empty` `cl-tabs`
- **反馈**：`cl-alert`（success / warning / danger / banner）`cl-progress` `cl-ring` `cl-meter` + `cl-legend`（dot）`cl-spinner` `cl-skeleton` `cl-toast`
- **浮层**：`cl-menu`（static）`cl-popover` `cl-dialog`（xs / sm / lg / tall）`cl-sheet` `cl-drawer`；`cl-backdrop--contained` 可把弹窗限制在小部件窗口内

## coolove-ui.js API

```js
CooloveUI.applyTheme(opts, el?)        // 应用主题，返回当前配置
CooloveUI.init(root?)                  // 绑定 data-cl-* 声明式交互
CooloveUI.toast(msg, { type, duration, action: { label, onClick } })
CooloveUI.contextMenu(event, [{ label, icon, shortcut, danger, disabled, onClick }, 'sep'])
CooloveUI.openDialog('#id') / closeDialog()
CooloveUI.sparkline(svgEl, values, { reference, area, tone })
CooloveUI.configure({ root })          // 浮层挂载点（需在 token 作用域内）
```

声明式属性：`data-cl-open="#dlg"`、`data-cl-close`、`data-cl-menu="#menu"`、`data-cl-select`（分段 / 标签页）、`data-cl-toggle`、`svg[data-cl-spark="1,2,3"][data-ref="2"]`。

## 在 Vue 3 + Tauri 项目里使用

stock-widget 已经完整接入，可以照着做：

1. 把 `coolove-ui.css` 和 `vue/useCooloveTheme.ts` 复制到项目的 `src/coolove-ui/`（stock-widget 里用 `npm run sync:ui` 从本仓库同步），`main.ts` 先引入 `coolove-ui.css` 再引入项目自己的样式。
2. `index.html` 里 `<div id="app" class="cl-window">`，窗口内部区域不再设置背景色。
3. 在 settings store 的 `applySettings()` 里调用 `applyCooloveTheme({ theme, opacity, blur, accent, customBg, customFg, trend, fontFamily })`。
4. 组件同时写 `cl-*` 类（外观）和项目自己的语义类（测试、业务钩子），如 `class="cl-card stock-card"`。
5. 只有布局和业务特有的尺寸写在组件的 scoped style 里；颜色一律用 token，不写十六进制色值。

旧变量名 `--window-bg`、`--solid-bg`、`--text-*`、`--border-color`、`--divider-color`、`--input-bg`、`--card-bg`、`--card-bg-hover`、`--radius`、`--radius-sm` 都保留，方便逐步迁移。

### 关于真正的桌面模糊

`backdrop-filter` 只能模糊 WebView 内部的内容，透明窗口背后的桌面不会被模糊。想要系统级毛玻璃，可以在 Tauri 端用 [`window-vibrancy`](https://crates.io/crates/window-vibrancy)：Windows 用 `apply_acrylic` / `apply_mica`，macOS 用 `apply_vibrancy`。开启后可以把 `--glass-blur` 设为 0，只保留 `--bg-opacity` 控制色调深浅。

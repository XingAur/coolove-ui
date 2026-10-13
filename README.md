# Coolove UI

从 `stock-widget`（A+ 助手）提炼的可调透明度玻璃风格组件库。纯 CSS + 一个可选的小 JS，无依赖，Vue / 原生 HTML 都能用。

```
coolove-ui/
├── coolove-ui.css          # 全部 token 与组件样式（cl- 前缀）
├── coolove-ui.js           # 可选：主题控制、toast、右键菜单、对话框、走势图等
├── vue/useCooloveTheme.ts  # Vue 3 接入（不依赖 coolove-ui.js）
└── index.html            # 组件展示页，直接双击打开
```

## 风格要点（来自原项目）

| 规则 | 做法 |
| --- | --- |
| 窗口可调透明度 | `--window-bg = 主题底色 × --bg-opacity`，配合 `backdrop-filter: blur(--glass-blur)` |
| 内部元素不自带底色 | 卡片、输入框只叠加极淡的白/黑蒙层（`--surface-1 ~ 4` = 2.5% ~ 12%） |
| 浮层永远看得清 | 弹窗、菜单、下拉用不透明的 `--solid-bg`；需要时 `data-overlay="glass"` 改成半透明 |
| 红涨绿跌 | `--rise / --fall` 语义色，`data-trend="intl"` 一键切换 |
| 小部件尺度 | 11–14px 字号、26–30px 控件高度、8 / 12 / 14 / 22px 圆角 |
| 窗口装饰 | 红黄绿交通灯（悬停显示图标）、A+ 品牌徽标、底部状态栏 |

## 快速开始

```html
<link rel="stylesheet" href="coolove-ui.css">
<script src="coolove-ui.js"></script>

<div class="cl-window">
  <header class="cl-titlebar">…</header>
  <div class="cl-window__body">
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

> token 都声明在 `:root, [data-theme]` 上。改 `--bg-opacity` 这类变量时，要写在带 `data-theme` 的同一个元素上，派生色才会跟着重算。

## 组件一览

- **窗口**：`cl-window` `cl-titlebar` `cl-traffic` `cl-brand` `cl-statusbar` `cl-panel`
- **按钮**：`cl-btn`（primary / soft / outline / ghost / danger / danger-solid，sm / lg / icon / pill / block，`is-loading`）、`cl-iconbtn`、`cl-btn-group`、`cl-close`
- **表单**：`cl-input` `cl-input-wrap`（前后缀）`cl-select` `cl-textarea` `cl-stepper` `cl-search` `cl-field` `cl-setting`
- **选择**：`cl-switch` `cl-check` `cl-radio` `cl-segmented`（accent / subtle / block）`cl-range` `cl-swatches` `cl-color`
- **标签**：`cl-pill`（rise / fall / solid）`cl-badge` `cl-tag` `cl-dot`（live 呼吸）`cl-count` `cl-kbd`、`data-tip` 提示
- **列表**：`cl-card`（选中条、拖动柄、悬停删除、明细条 `cl-card__strip`）
- **数据**：`cl-stat` `cl-table`（可排序表头）`cl-kv` `cl-spark` `cl-bars` `cl-accordion` `cl-empty` `cl-tabs`
- **反馈**：`cl-alert` `cl-progress`（striped / indeterminate）`cl-ring` `cl-meter` + `cl-legend` `cl-spinner` `cl-skeleton` `cl-toast`
- **浮层**：`cl-menu` `cl-popover` `cl-dialog` `cl-sheet` `cl-drawer`；`cl-backdrop--contained` 可把弹窗限制在小部件窗口内

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

## 接入 stock-widget / disk-cleaner（Vue 3 + Tauri）

1. 把 `coolove-ui.css` 放到 `src/styles/`，在 `main.ts` 里 `import './styles/coolove-ui.css'`。原项目的 `--window-bg`、`--solid-bg`、`--text-*`、`--border-color`、`--card-bg` 等变量名都保留了，旧组件不用改。
2. 把 `vue/useCooloveTheme.ts` 放到 `src/composables/`，在 settings store 的 `applySettings()` 里调用 `applyCooloveTheme(...)`，可替换原来手写的 `applyCustomTheme / clearCustomTheme`。
3. 根节点（`#app`）加上 `class="cl-window"`，或保留原样式。

### 关于真正的桌面模糊

`backdrop-filter` 只能模糊 WebView 内部的内容，透明窗口背后的桌面不会被模糊。想要系统级毛玻璃，可以在 Tauri 端用 [`window-vibrancy`](https://crates.io/crates/window-vibrancy)：Windows 用 `apply_acrylic` / `apply_mica`，macOS 用 `apply_vibrancy`。开启后可以把 `--glass-blur` 设为 0，只保留 `--bg-opacity` 控制色调深浅。

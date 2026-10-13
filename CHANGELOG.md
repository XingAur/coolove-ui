# Changelog

## 0.4.1

- 修复：组件内的 `.cl-rise / .cl-fall` 被组件默认文字色盖掉（如 `.cl-stat--md` 磁贴的涨跌幅显示为灰色）。状态色规则统一移到样式表末尾，特异性提升到 0,2,0，保证压过同级的默认颜色。

## 0.4.0

完整替换 stock-widget 界面时调整：

- `.cl-statusbar` 改为与 A+ 助手底栏一致：贴底、无分隔线（`padding: 4px 10px 6px`）；需要分隔线时用新增的 `.cl-statusbar--divided`。新增 `.cl-statusbar__actions`（右侧操作组，不换行），底栏里的 `.cl-search` 自动占满剩余宽度。
- 新增 `.cl-list--dense`：股票卡片固定 44px 行高（收紧卡片上下内边距、右侧数值间距和涨跌胶囊），对应 A+ 助手 1.2.8 的紧凑自选列表。
- 新增 `.cl-stat--md`（行情磁贴：12px 标题、17px 数值）与 `.cl-stat__arrow`（数值前的 ▲▼）。
- 新增 `.cl-card--row`（无最小高度的紧凑数据行，排名/持仓对照）与 `.cl-card.is-active`（强调色高亮行）。
- 新增 `.cl-section-head`（小节标题 + `__sub` 副标题，右侧操作自动靠右，`--lg` 大号）与 `.cl-hint`（10px 说明文字）。
- 新增 `.cl-actionbar` / `__item`（详情页底部“图标 + 文字”操作栏，内置更多菜单定位）。
- 新增 `.cl-table--compact` 与 `.cl-table-wrap--plain`（面板内的 10px 明细表）。
- `.cl-eyebrow` 改为块级，始终独占标题上方一行（与行内标题同排时不再挤在一起）。
- 新增 `.cl-divided`（子元素间 1px 分隔线，`--soft` 更淡）。

## 0.3.0

接入 stock-widget 弹窗与详情页时新增：

- **图表 token**：`--chart-grid / --chart-axis / --chart-hover / --chart-area`，系列色 `--series-1..4`、`--series-avg`（浅色主题自动换成更深的版本）。
- **SVG 图表元素**：`.cl-chart__grid / __axis / __hover / __area / __line / __baseline / __bar--rise|fall|flat / __tag / __tag-text / __point`，涨跌柱跟随 `data-trend`。
- **悬停信息卡** `.cl-tooltip-card`（`__title / __row / __key`）。
- **图例** `.cl-legend--dot`（圆点）。
- **输入** `.cl-input--lg`（金额等关键输入），与前缀 `¥` 搭配。
- **提示** `.cl-alert--banner`（对话框头部下方的通栏提示）。
- **方块图标** `.cl-tile`（`--sm / --success / --warning / --danger / --violet / --muted`），用于交易类型、文件类型。
- `.cl-eyebrow--accent`。
- 分段选择新增 `.cl-segmented--ghost`（无轨道、选中浅强调色，用于图表时间范围）、`.cl-segmented--sm`（18px）与 `.cl-segmented--xs`（16px），用于状态行与卡片头部。

## 0.2.2

- `.cl-setting` 允许换行：窄面板里控件较宽时，说明文字保留至少 8em，控件换到下一行。
- `.cl-swatch` 去掉透明边框，避免色块内出现一圈暗环。

## 0.2.1

- 修复：`.cl-list` 作为滚动容器时子项被压扁，展开明细条的卡片会与下一张重叠（子项改为 `flex-shrink: 0`）。
- 涨跌胶囊和卡片主数值不再使用等宽数字，避免负号与数字之间出现空隙。

## 0.2.0

接入 A+ 助手（stock-widget）时补齐的基础能力：

- **列表卡片**：悬停/选中不再改变卡片内部布局（去掉悬停右移和右侧让位），拖动柄、删除按钮浮在 `.cl-list` 的左右留白里；轻推效果改为可选的 `.cl-card--nudge`。
- 新增 `.cl-card__chart`（走势图槽）、`.cl-card__row`、`.cl-card__main--stack`（标题在上、代码+走势在下）、`.cl-card__figure`（右侧主数值，`--lg` 大号）、`.cl-card__meta`（9px 说明，`.is-estimate` 估算色）、`.cl-card__value--sm`、`.cl-card--tall`。
- `.cl-card__strip` 支持 `.is-rise / .is-fall / .is-flat` 给汇总行着色。
- `.cl-list` 自带 `--list-gutter` 横向留白，`.cl-list--flush` 取消留白并把浮动操作收回卡片内。
- 新增 `.cl-stat-grid`、`.cl-stat--compact`（小部件账户汇总）；`.cl-stat__value/__delta` 支持涨跌色。
- 新增 `.cl-search__message`（搜索框提示气泡，`--danger / --success / --down`）。
- 新增 `.cl-statusbar__time.is-stale`。
- 新增 `.cl-dialog--xs`（260px）和 `.cl-dialog--tall`（440×640，设置面板）。
- 走势图线宽改为变量 `--spark-stroke`（默认 1.2px），参考线变细并在浅色主题减淡。

## 0.1.0

- 由 glass-ui 改名为 coolove-ui，类名前缀 `cl-`。

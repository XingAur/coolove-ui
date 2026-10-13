# Changelog

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

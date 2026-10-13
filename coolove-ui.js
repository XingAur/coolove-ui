/*!
 * Coolove UI —— 主题控制 + 轻量交互（无依赖，约 8KB）
 *
 *   CooloveUI.applyTheme({ theme: 'dark', opacity: 0.85, accent: '#1d9bf0' })
 *   CooloveUI.init()                      // 绑定页面上 data-cl-* 声明的交互
 *   CooloveUI.toast('已刷新', { type: 'success' })
 *   CooloveUI.contextMenu(event, [{ label: '置顶', onClick }])
 *   CooloveUI.sparkline(svg, [1, 2, 3], { reference: 2 })
 *
 * 在 Vue 里一般只需要 applyTheme / toast / contextMenu / sparkline，其余交互用组件状态驱动即可。
 */
(function (global) {
  'use strict'

  var DEFAULTS = {
    theme: 'dark',          // 'dark' | 'light' | 'custom'
    opacity: 0.85,          // 窗口背景不透明度 0~1
    blur: 26,               // 模糊半径 px
    accent: '#1d9bf0',      // 强调色
    customBg: '#1f2937',    // 自定义主题底色
    customFg: '#ffffff',    // 自定义主题文字色
    radius: 1,              // 圆角缩放
    density: 'comfortable', // 'comfortable' | 'compact'
    trend: 'cn',            // 'cn' 红涨绿跌 | 'intl' 绿涨红跌
    overlay: 'solid',       // 'solid' 浮层不透明 | 'glass' 浮层也半透明
    fontFamily: null
  }

  var state = Object.assign({}, DEFAULTS)
  var config = { root: null } // 浮层（toast / 右键菜单）挂载点，需在 token 作用域内

  function overlayRoot() {
    return config.root || document.querySelector('[data-cl-root]') || document.body
  }

  function hexToTriplet(hex) {
    var h = String(hex || '').replace('#', '')
    if (h.length === 3) h = h.replace(/./g, '$&$&')
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
    return [0, 2, 4].map(function (i) { return parseInt(h.slice(i, i + 2), 16) }).join(' ')
  }

  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)) }

  /** 应用主题。target 默认 <html>；只传需要改的字段即可。 */
  function applyTheme(opts, target) {
    var el = target || document.documentElement
    state = Object.assign({}, state, opts || {})
    var s = el.style

    el.setAttribute('data-theme', state.theme)
    el.setAttribute('data-density', state.density)
    el.setAttribute('data-trend', state.trend)
    el.setAttribute('data-overlay', state.overlay)

    s.setProperty('--bg-opacity', String(clamp(Number(state.opacity), 0, 1)))
    s.setProperty('--glass-blur', clamp(Number(state.blur), 0, 80) + 'px')
    s.setProperty('--accent', state.accent)
    s.setProperty('--r', String(state.radius))
    if (state.fontFamily) s.setProperty('--font-family', state.fontFamily)

    if (state.theme === 'custom') {
      var rgb = hexToTriplet(state.customBg) || '31 41 55'
      s.setProperty('--custom-rgb', rgb)
      s.setProperty('--custom-fg', state.customFg)
    } else {
      s.removeProperty('--custom-rgb')
      s.removeProperty('--custom-fg')
    }
    el.dispatchEvent(new CustomEvent('cl:theme', { detail: Object.assign({}, state), bubbles: true }))
    return Object.assign({}, state)
  }

  function getTheme() { return Object.assign({}, state) }

  /* ---------------- 滑块：同步填充进度 --val ---------------- */
  function syncRange(input) {
    var min = Number(input.min || 0)
    var max = Number(input.max || 100)
    var pct = ((Number(input.value) - min) / (max - min || 1)) * 100
    input.style.setProperty('--val', String(clamp(pct, 0, 100)))
  }

  /* ---------------- Toast ---------------- */
  function toast(message, opts) {
    opts = opts || {}
    var root = overlayRoot()
    var stack = root.querySelector(':scope > .cl-toast-stack')
    if (!stack) {
      stack = document.createElement('div')
      stack.className = 'cl-toast-stack'
      stack.setAttribute('role', 'status')
      stack.setAttribute('aria-live', 'polite')
      root.appendChild(stack)
    }
    var el = document.createElement('div')
    el.className = 'cl-toast' + (opts.type ? ' cl-toast--' + opts.type : '')
    var text = document.createElement('span')
    text.textContent = message
    el.appendChild(text)
    if (opts.action) {
      var btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'cl-toast__action'
      btn.textContent = opts.action.label
      btn.addEventListener('click', function () {
        if (opts.action.onClick) opts.action.onClick()
        dismiss()
      })
      el.appendChild(btn)
    }
    stack.appendChild(el)
    while (stack.children.length > 4) stack.firstElementChild.remove()

    var timer = setTimeout(dismiss, opts.duration || 2600)
    function dismiss() {
      clearTimeout(timer)
      if (!el.isConnected) return
      el.classList.add('is-leaving')
      setTimeout(function () { el.remove() }, 180)
    }
    return dismiss
  }

  /* ---------------- 菜单定位 ---------------- */
  function placeFixed(menu, x, y) {
    menu.style.left = '0px'
    menu.style.top = '0px'
    var r = menu.getBoundingClientRect()
    var vw = window.innerWidth
    var vh = window.innerHeight
    menu.style.left = clamp(x, 8, vw - r.width - 8) + 'px'
    menu.style.top = (y + r.height > vh - 8 ? Math.max(8, y - r.height) : y) + 'px'
  }

  var openMenu = null
  function closeMenu() {
    if (!openMenu) return
    if (openMenu.dataset.clTemp) openMenu.remove()
    else openMenu.hidden = true
    if (openMenu._trigger) openMenu._trigger.setAttribute('aria-expanded', 'false')
    openMenu = null
  }

  function showMenu(menu, x, y, trigger) {
    closeMenu()
    menu.hidden = false
    menu._trigger = trigger || null
    if (trigger) trigger.setAttribute('aria-expanded', 'true')
    placeFixed(menu, x, y)
    openMenu = menu
    var first = menu.querySelector('.cl-menu__item:not(:disabled)')
    if (first && trigger) first.focus({ preventScroll: true })
  }

  /** 右键菜单：items = [{ label, icon?, shortcut?, danger?, disabled?, onClick? } | 'sep'] */
  function contextMenu(event, items) {
    event.preventDefault()
    var menu = document.createElement('div')
    menu.className = 'cl-menu'
    menu.setAttribute('role', 'menu')
    menu.dataset.clTemp = '1'
    items.forEach(function (it) {
      if (it === 'sep') {
        var sep = document.createElement('div')
        sep.className = 'cl-menu__sep'
        menu.appendChild(sep)
        return
      }
      var b = document.createElement('button')
      b.type = 'button'
      b.className = 'cl-menu__item' + (it.danger ? ' cl-menu__item--danger' : '')
      b.setAttribute('role', 'menuitem')
      b.disabled = !!it.disabled
      if (it.icon) b.insertAdjacentHTML('beforeend', it.icon)
      b.appendChild(document.createTextNode(it.label))
      if (it.shortcut) {
        var k = document.createElement('span')
        k.className = 'cl-menu__shortcut'
        k.textContent = it.shortcut
        b.appendChild(k)
      }
      b.addEventListener('click', function () {
        closeMenu()
        if (it.onClick) it.onClick()
      })
      menu.appendChild(b)
    })
    overlayRoot().appendChild(menu)
    showMenu(menu, event.clientX, event.clientY)
    return menu
  }

  /* ---------------- 对话框 ---------------- */
  var dialogStack = []
  var FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), select, textarea, [tabindex]:not([tabindex="-1"])'

  function openDialog(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : target
    if (!el || !el.hidden) return
    el._returnFocus = document.activeElement
    el.hidden = false
    dialogStack.push(el)
    var focusEl = el.querySelector('[autofocus]') || el.querySelector('.cl-dialog__body ' + FOCUSABLE) || el.querySelector(FOCUSABLE)
    if (focusEl) setTimeout(function () { focusEl.focus({ preventScroll: true }) }, 30)
    el.dispatchEvent(new CustomEvent('cl:open', { bubbles: true }))
  }

  function closeDialog(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : (target || dialogStack[dialogStack.length - 1])
    if (!el || el.hidden) return
    el.hidden = true
    dialogStack = dialogStack.filter(function (d) { return d !== el })
    if (el._returnFocus && el._returnFocus.focus) el._returnFocus.focus({ preventScroll: true })
    el.dispatchEvent(new CustomEvent('cl:close', { bubbles: true }))
  }

  /* ---------------- 迷你走势图 ---------------- */
  function sparkline(svg, values, opts) {
    opts = opts || {}
    var data = (values || []).map(Number).filter(function (v) { return Number.isFinite(v) })
    if (data.length < 2) { svg.innerHTML = ''; return }
    var W = opts.width || 100
    var H = opts.height || 30
    var pad = 2
    var ref = opts.reference != null ? Number(opts.reference) : null
    var lo = Math.min.apply(null, ref != null ? data.concat(ref) : data)
    var hi = Math.max.apply(null, ref != null ? data.concat(ref) : data)
    if (hi === lo) { hi += 1; lo -= 1 }
    var x = function (i) { return (i / (data.length - 1)) * W }
    var y = function (v) { return pad + (1 - (v - lo) / (hi - lo)) * (H - pad * 2) }
    var pts = data.map(function (v, i) { return x(i).toFixed(2) + ',' + y(v).toFixed(2) })
    var tone = opts.tone || (data[data.length - 1] >= (ref != null ? ref : data[0]) ? 'rise' : 'fall')

    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H)
    svg.setAttribute('preserveAspectRatio', 'none')
    svg.setAttribute('class', 'cl-spark cl-spark--' + tone)
    var html = ''
    if (opts.area) html += '<path class="cl-spark__area" d="M0,' + H + ' L' + pts.join(' L') + ' L' + W + ',' + H + ' Z"/>'
    if (ref != null) html += '<line class="cl-spark__ref" x1="0" x2="' + W + '" y1="' + y(ref).toFixed(2) + '" y2="' + y(ref).toFixed(2) + '" vector-effect="non-scaling-stroke"/>'
    html += '<polyline class="cl-spark__line" points="' + pts.join(' ') + '" vector-effect="non-scaling-stroke"/>'
    svg.innerHTML = html
  }

  /* ---------------- 声明式绑定 ---------------- */
  function init(root) {
    root = root || document

    root.querySelectorAll('input.cl-range').forEach(syncRange)
    root.querySelectorAll('svg[data-cl-spark]').forEach(function (svg) {
      sparkline(svg, svg.getAttribute('data-cl-spark').split(','), {
        reference: svg.hasAttribute('data-ref') ? svg.getAttribute('data-ref') : null,
        area: svg.hasAttribute('data-area'),
        tone: svg.getAttribute('data-tone') || undefined
      })
    })

    if (root._clBound) return
    root._clBound = true

    root.addEventListener('input', function (e) {
      if (e.target.matches && e.target.matches('input.cl-range')) syncRange(e.target)
    })

    root.addEventListener('click', function (e) {
      var t = e.target
      if (!(t instanceof Element)) return

      // 菜单外点击关闭
      if (openMenu && !openMenu.contains(t) && !(openMenu._trigger && openMenu._trigger.contains(t))) closeMenu()

      // 打开对话框：data-cl-open="#id"
      var opener = t.closest('[data-cl-open]')
      if (opener) { openDialog(opener.getAttribute('data-cl-open')); return }

      // 关闭对话框：data-cl-close 或点击遮罩
      var closer = t.closest('[data-cl-close]')
      if (closer) { closeDialog(closer.closest('.cl-backdrop')); return }
      if (t.classList.contains('cl-backdrop') && !t.hasAttribute('data-cl-static')) { closeDialog(t); return }

      // 下拉菜单：data-cl-menu="#id"
      var mt = t.closest('[data-cl-menu]')
      if (mt) {
        var menu = document.querySelector(mt.getAttribute('data-cl-menu'))
        if (menu) {
          if (openMenu === menu) { closeMenu(); return }
          var r = mt.getBoundingClientRect()
          showMenu(menu, r.left, r.bottom + 6, mt)
        }
        return
      }
      if (t.closest('.cl-menu .cl-menu__item') && openMenu && !openMenu.dataset.clTemp) {
        var item = t.closest('.cl-menu__item')
        if (item.hasAttribute('aria-checked')) {
          var group = item.getAttribute('data-group')
          if (group) openMenu.querySelectorAll('[data-group="' + group + '"]').forEach(function (i) { i.setAttribute('aria-checked', 'false') })
          item.setAttribute('aria-checked', group ? 'true' : String(item.getAttribute('aria-checked') !== 'true'))
        }
        closeMenu()
      }

      // 分段选择 / 标签页：容器上标 data-cl-select
      var seg = t.closest('[data-cl-select] > *')
      if (seg && !seg.disabled) {
        var box = seg.parentElement
        var attr = box.getAttribute('role') === 'tablist' ? 'aria-selected' : 'aria-pressed'
        Array.prototype.forEach.call(box.children, function (c) {
          c.setAttribute(attr, String(c === seg))
          var p = c.getAttribute('aria-controls')
          if (p) { var panel = document.getElementById(p); if (panel) panel.hidden = c !== seg }
        })
        box.dispatchEvent(new CustomEvent('cl:change', { detail: { value: seg.getAttribute('data-value'), item: seg }, bubbles: true }))
      }

      // 多选标签：data-cl-toggle
      var tg = t.closest('[data-cl-toggle]')
      if (tg) tg.setAttribute('aria-pressed', String(tg.getAttribute('aria-pressed') !== 'true'))

      // 标签删除
      var x = t.closest('.cl-tag__x')
      if (x) {
        var tag = x.closest('.cl-tag')
        tag.style.transition = 'opacity .15s, transform .15s'
        tag.style.opacity = '0'
        tag.style.transform = 'scale(.9)'
        setTimeout(function () { tag.remove() }, 150)
      }

      // 步进器
      var step = t.closest('.cl-stepper button')
      if (step) {
        var input = step.parentElement.querySelector('input')
        var delta = Number(step.getAttribute('data-step') || (step === step.parentElement.firstElementChild ? -1 : 1)) * Number(input.step || 1)
        var v = Number(input.value || 0) + delta
        if (input.min !== '') v = Math.max(Number(input.min), v)
        if (input.max !== '') v = Math.min(Number(input.max), v)
        input.value = String(Math.round(v * 1000) / 1000)
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (openMenu) { closeMenu(); return }
        if (dialogStack.length) closeDialog()
      }
      if (openMenu && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        var items = Array.prototype.slice.call(openMenu.querySelectorAll('.cl-menu__item:not(:disabled)'))
        var i = items.indexOf(document.activeElement)
        var next = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]
        if (next) { e.preventDefault(); next.focus() }
      }
    })

    window.addEventListener('resize', closeMenu)
    window.addEventListener('scroll', closeMenu, true)
  }

  global.CooloveUI = {
    DEFAULTS: DEFAULTS,
    configure: function (c) { Object.assign(config, c || {}) },
    applyTheme: applyTheme,
    getTheme: getTheme,
    init: init,
    toast: toast,
    contextMenu: contextMenu,
    closeMenu: closeMenu,
    openDialog: openDialog,
    closeDialog: closeDialog,
    sparkline: sparkline,
    syncRange: syncRange
  }
})(typeof window !== 'undefined' ? window : this)

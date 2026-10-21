/**
 * Vue 3 接入：悬浮底栏 .cl-dock 的滑动回弹、拖动吸附与液态折射。
 * 不依赖 coolove-ui.js，逻辑与 CooloveUI.dock 保持一致。
 *
 *   <nav ref="tabbar" class="cl-dock cl-dock--liquid">
 *     <span class="cl-dock__indicator" />
 *     <button class="cl-dock__item">…首页</button>
 *     <button class="cl-dock__item">…数码</button>
 *     <button class="cl-dock__fab" @click="publish">…</button>
 *     <button class="cl-dock__item">…发现</button>
 *     <button class="cl-dock__item">…我的</button>
 *   </nav>
 *
 *   const tabbar = ref<HTMLElement | null>(null)
 *   const active = ref(0)                      // 选中的列（含 fab 的位置），双向同步
 *   useCooloveDock(tabbar, active)
 */
import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

const LIQUID_ID = 'cl-liquid'
// 位移图：红色通道管横向、绿色通道管纵向；中间 0.5 不位移，越靠边越往里取样，形成水滴边缘的折射
const LIQUID_MAP =
  'data:image/svg+xml,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>" +
      "<defs><linearGradient id='x'><stop offset='0' stop-color='#ff0000'/><stop offset='.28' stop-color='#800000'/><stop offset='.72' stop-color='#800000'/><stop offset='1' stop-color='#000000'/></linearGradient>" +
      "<linearGradient id='y' x2='0' y2='1'><stop offset='0' stop-color='#00ff00'/><stop offset='.32' stop-color='#008000'/><stop offset='.68' stop-color='#008000'/><stop offset='1' stop-color='#000000'/></linearGradient></defs>" +
      "<rect width='100' height='100' fill='url(#x)'/><rect width='100' height='100' fill='url(#y)' style='mix-blend-mode:screen'/></svg>"
  )

/** 只有 Chromium 内核支持 backdrop-filter: url()（Windows WebView2、安卓 WebView、Chrome / Edge） */
export function supportsLiquidGlass(): boolean {
  if (typeof CSS === 'undefined' || !CSS.supports?.('backdrop-filter', 'url(#a)')) return false
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent
  return /Chrome\/|Chromium|Edg\//.test(ua) && !/Firefox\//.test(ua)
}

/** 往页面里放一次折射滤镜，strength 为位移强度（px） */
export function ensureLiquidFilter(strength = 28): void {
  if (typeof document === 'undefined' || document.getElementById(LIQUID_ID)) return
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.setAttribute('aria-hidden', 'true')
  svg.style.position = 'absolute'
  svg.innerHTML =
    `<filter id="${LIQUID_ID}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
    `<feImage href="${LIQUID_MAP}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${strength}" xChannelSelector="R" yChannelSelector="G"/>` +
    `</filter>`
  document.body.appendChild(svg)
}

export interface CooloveDockOptions {
  /** 点击或拖动松手后选中了新的一列 */
  onChange?: (index: number, item: HTMLElement) => void
  /** 初始选中列（没有 aria-current / is-active 时使用） */
  index?: number
  /** 折射强度 px，默认 28 */
  strength?: number
}

export interface CooloveDockController {
  /** 切换到第 i 列（不触发 onChange） */
  set(index: number): void
  get(): number
  destroy(): void
}

/** 绑定一个 .cl-dock；列 = 除选中块以外的子元素，.cl-dock__fab 与 [data-no-select] 不会被选中 */
export function bindCooloveDock(el: HTMLElement, opts: CooloveDockOptions = {}): CooloveDockController {
  const indicator = el.querySelector<HTMLElement>(':scope > .cl-dock__indicator')
  let timer = 0
  let drag: { id: number; x: number; start: number; moved: boolean } | null = null
  let suppressClick = false

  const cols = () => Array.from(el.children).filter((c) => c !== indicator) as HTMLElement[]
  const selectable = (c?: Element) =>
    !!c && c.classList.contains('cl-dock__item') && !c.hasAttribute('data-no-select') && !(c as HTMLButtonElement).disabled
  const get = () => Number(getComputedStyle(el).getPropertyValue('--i')) || 0

  if (el.classList.contains('cl-dock--liquid') && supportsLiquidGlass()) {
    ensureLiquidFilter(opts.strength)
    el.setAttribute('data-liquid', 'on')
  }
  el.style.setProperty('--n', String(cols().length))

  function set(i: number, silent: boolean) {
    const list = cols()
    if (!selectable(list[i])) return
    const from = get()
    if (i !== from && indicator) {
      // 跨的列越多拉得越长，最多 1.45 倍
      el.style.setProperty('--stretch', String(Math.min(1.45, 1.12 + Math.abs(i - from) * 0.1)))
      el.classList.add('is-moving')
      clearTimeout(timer)
      timer = window.setTimeout(() => el.classList.remove('is-moving'), 170)
    }
    el.style.setProperty('--i', String(i))
    el.removeAttribute('data-none')
    list.forEach((c, k) => {
      if (!selectable(c)) return
      if (k === i) c.setAttribute('aria-current', 'page')
      else c.removeAttribute('aria-current')
    })
    if (!silent) {
      opts.onChange?.(i, list[i])
      el.dispatchEvent(new CustomEvent('cl:change', { detail: { index: i, item: list[i], value: list[i].dataset.value }, bubbles: true }))
    }
  }

  function itemOf(target: EventTarget | null): HTMLElement | null {
    const item = target instanceof Element ? target.closest<HTMLElement>('.cl-dock > *') : null
    return item && item.parentElement === el ? item : null
  }

  function onClick(e: MouseEvent) {
    if (suppressClick) {
      suppressClick = false
      e.preventDefault()
      e.stopPropagation()
      return
    }
    const item = itemOf(e.target)
    if (!item) return
    const i = cols().indexOf(item)
    if (selectable(item) && i !== get()) set(i, false)
  }

  function onDown(e: PointerEvent) {
    if (!indicator || e.button > 0) return
    const item = itemOf(e.target)
    if (!item || !selectable(item)) return
    drag = { id: e.pointerId, x: e.clientX, start: cols().indexOf(item), moved: false }
  }

  function onMove(e: PointerEvent) {
    if (!drag || !indicator || e.pointerId !== drag.id) return
    const dx = e.clientX - drag.x
    if (!drag.moved) {
      if (Math.abs(dx) < 6) return
      drag.moved = true
      el.setPointerCapture?.(e.pointerId)
      el.classList.add('is-dragging')
    }
    const w = indicator.offsetWidth
    const max = (cols().length - 1) * w
    el.style.setProperty('--drag-x', `${Math.max(0, Math.min(max, drag.start * w + dx))}px`)
  }

  function onUp(e: PointerEvent) {
    if (!drag || !indicator || e.pointerId !== drag.id) return
    const d = drag
    drag = null
    if (!d.moved) return
    const w = indicator.offsetWidth || 1
    const x = parseFloat(el.style.getPropertyValue('--drag-x')) || 0
    // 吸附到最近的可选列
    let best = -1
    let bestDist = Infinity
    cols().forEach((c, k) => {
      const dist = Math.abs(k * w - x)
      if (selectable(c) && dist < bestDist) {
        best = k
        bestDist = dist
      }
    })
    // 先把手指位置写成 --i 再去掉拖动态（画面不动），下一帧再设目标列，选中块从手指处弹过去
    el.style.setProperty('--i', String(x / w))
    el.classList.remove('is-dragging')
    suppressClick = true
    setTimeout(() => (suppressClick = false), 0)
    if (best >= 0) requestAnimationFrame(() => set(best, best === d.start))
  }

  function onCancel() {
    if (!drag) return
    el.classList.remove('is-dragging')
    drag = null
  }

  el.addEventListener('click', onClick, true)
  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerup', onUp)
  el.addEventListener('pointercancel', onCancel)

  const initial = cols().findIndex((c) => c.getAttribute('aria-current') === 'page' || c.classList.contains('is-active'))
  if (initial >= 0) set(initial, true)
  else if (opts.index != null) set(opts.index, true)

  return {
    set: (i) => set(i, true),
    get,
    destroy() {
      clearTimeout(timer)
      el.removeEventListener('click', onClick, true)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onCancel)
    }
  }
}

/** 组件里用：index 与底栏选中列双向同步 */
export function useCooloveDock(el: Ref<HTMLElement | null>, index: Ref<number>, opts: Omit<CooloveDockOptions, 'index'> = {}) {
  let controller: CooloveDockController | null = null
  onMounted(() => {
    if (!el.value) return
    controller = bindCooloveDock(el.value, {
      ...opts,
      index: index.value,
      onChange: (i, item) => {
        index.value = i
        opts.onChange?.(i, item)
      }
    })
  })
  watch(index, (i) => {
    if (controller && controller.get() !== i) controller.set(i)
  })
  onBeforeUnmount(() => controller?.destroy())
  return { get: () => controller }
}

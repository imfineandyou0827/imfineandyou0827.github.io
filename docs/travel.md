# 旅程

记录我的旅行与见闻。

<script setup>
import { ref, computed, onMounted } from 'vue'
import { places, visited } from './travel-data'

// 照片索引（异步加载，照片墙 / 统计 / 信息窗体共用）
const regionPhotos = ref({})
const totalPhotos = computed(() =>
  Object.values(regionPhotos.value).reduce((n, arr) => n + arr.length, 0)
)
const hasPhotos = computed(() =>
  Object.values(regionPhotos.value).some((arr) => arr.length)
)
const placeCount = places.length
const visitedCount = visited.length

// 地图与标记引用（非响应式）
let map = null
const markers = {}
const infoWindows = {}
const activePlace = ref(places[0].name)

function showPhotoGallery(placeName, startIndex = 0) {
  const photos = regionPhotos.value[placeName] || []
  if (!photos.length) return
  let current = Math.min(startIndex, photos.length - 1)

  const modal = document.createElement('div')
  modal.className = 'gallery-modal'
  modal.innerHTML = `
    <div class="gallery-backdrop" data-close></div>
    <div class="gallery-box">
      <button class="gallery-close" data-close aria-label="关闭">✕</button>
      <div class="gallery-stage"><img src="${photos[current].url}" alt="${photos[current].caption || placeName}"></div>
      <div class="gallery-bar">
        <button class="gallery-nav" id="gallery-prev" aria-label="上一张">←</button>
        <div class="gallery-info">
          <div class="gallery-caption">${photos[current].caption || placeName}</div>
          <div class="gallery-counter">${current + 1} / ${photos.length}</div>
        </div>
        <button class="gallery-nav" id="gallery-next" aria-label="下一张">→</button>
      </div>
    </div>
  `
  document.body.appendChild(modal)

  const img = modal.querySelector('.gallery-stage img')
  const caption = modal.querySelector('.gallery-caption')
  const counter = modal.querySelector('.gallery-counter')
  function render() {
    img.src = photos[current].url
    img.alt = photos[current].caption || placeName
    caption.textContent = photos[current].caption || placeName
    counter.textContent = `${current + 1} / ${photos.length}`
  }
  function step(d) {
    current = (current + d + photos.length) % photos.length
    render()
  }
  function close() {
    document.removeEventListener('keydown', onKey)
    modal.remove()
  }
  function onKey(e) {
    if (e.key === 'Escape') close()
    else if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'ArrowRight') step(1)
  }
  modal.querySelector('#gallery-prev').onclick = () => step(-1)
  modal.querySelector('#gallery-next').onclick = () => step(1)
  modal.querySelectorAll('[data-close]').forEach((el) => (el.onclick = close))
  document.addEventListener('keydown', onKey)
}

function flyTo(placeName) {
  activePlace.value = placeName
  if (!map || !markers[placeName]) return
  const marker = markers[placeName]
  map.setZoomAndCenter(14, marker.getPosition())
  const iw = infoWindows[placeName]
  if (iw) iw.open(map, marker.getPosition())
}

onMounted(() => {
  // 供地图信息窗体里的内联 onclick 使用
  window.showPhotoGallery = showPhotoGallery

  // 照片索引
  fetch('/photos/photos.json')
    .then((res) => res.json())
    .then((data) => {
      regionPhotos.value = data
    })

  const script = document.createElement('script')
  script.src = 'https://webapi.amap.com/maps?v=2.0&key=2b8f301df116637eb0206846d8e5c054'

  script.onload = () => {
    map = new AMap.Map('travel-map', {
      zoom: 4,
      center: [104, 36],
      mapStyle: 'amap://styles/whitesmoke',
      features: ['bg', 'road', 'building', 'point']
    })

    // 浅色地图配色：去过的城市用绿色高亮，其余省份用淡蓝灰轮廓
    const highlightStroke = '#7ed6a7'
    const highlightFill = '#e6f7ec'
    const normalStroke = '#b3c6e0'

    // 中国轮廓 + 高亮去过的城市（跳过未访问的市级区域，减少多边形数量）
    AMap.plugin(['AMap.GeoJSON'], function () {
      fetch('/geojson/china-cities-full.geojson')
        .then((res) => res.json())
        .then((geojson) => {
          geojson.features.forEach((feature) => {
            const name = feature.properties.name
            const level = feature.properties.level
            const isVisited = visited.includes(name)
            if (!isVisited && level === 'city') return
            const coords = feature.geometry.coordinates
            const opts = (path) => ({
              path,
              strokeColor: isVisited ? highlightStroke : normalStroke,
              fillColor: isVisited ? highlightFill : '#ffffff',
              fillOpacity: isVisited ? 0.6 : 0,
              strokeWeight: 1.5,
              zIndex: 100,
              extData: { name }
            })
            if (feature.geometry.type === 'MultiPolygon') {
              coords.forEach((sub) => new AMap.Polygon(opts(sub[0])).setMap(map))
            } else if (feature.geometry.type === 'Polygon') {
              new AMap.Polygon(opts(coords[0])).setMap(map)
            }
          })
        })
    })

    // 标记点（带旅行顺序编号）
    const cityColor = '#667eea'
    const natureColor = '#34c3a0'
    places.forEach((p, i) => {
      const color = p.type === 'city' ? cityColor : natureColor
      const marker = new AMap.Marker({
        position: [p.lng, p.lat],
        content: `<div style="width:26px;height:26px;line-height:22px;text-align:center;background:${color};color:#fff;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);font-size:13px;font-weight:700;cursor:pointer;">${i + 1}</div>`,
        offset: new AMap.Pixel(-13, -13),
        zIndex: 110
      })
      marker.setMap(map)
      markers[p.name] = marker

      const photos = regionPhotos.value[p.name] || []
      const previewImg = photos.length
        ? `<img src="${photos[0].url}" style="width:200px;height:150px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid #ddd;margin-bottom:8px;" onclick="showPhotoGallery('${p.name}')" title="点击查看所有照片">`
        : ''
      const content = `
        <div style="text-align:center;min-width:220px;padding:12px;">
          <div style="font-size:32px;margin-bottom:8px;">${p.icon}</div>
          <h3 style="margin:0 0 8px;color:#333;">${p.name}</h3>
          <p style="margin:0 0 4px;color:#666;">${p.description || ''}</p>
          <p style="margin:0 0 12px;color:#999;font-size:12px;">${p.date || ''}</p>
          ${previewImg ? `<div style="margin-top:12px;">${previewImg}<div style="font-size:12px;color:#666;">📸 ${photos.length} 张照片 · 点击查看</div></div>` : ''}
        </div>
      `
      const iw = new AMap.InfoWindow({
        content,
        offset: new AMap.Pixel(0, -30)
      })
      infoWindows[p.name] = iw
      marker.on('click', () => {
        activePlace.value = p.name
        iw.open(map, marker.getPosition())
      })
    })

    // 自适应视野到所有标记点
    map.setFitView(Object.values(markers))
  }
  document.head.appendChild(script)
})
</script>

## 我的足迹地图

<div class="travel-stats">
  <div class="stat">
    <span class="stat-num">{{ placeCount }}</span>
    <span class="stat-label">足迹</span>
  </div>
  <div class="stat">
    <span class="stat-num">{{ visitedCount }}</span>
    <span class="stat-label">点亮城市</span>
  </div>
  <div class="stat">
    <span class="stat-num">{{ totalPhotos }}</span>
    <span class="stat-label">照片</span>
  </div>
</div>

<div class="travel-layout">
  <aside class="place-list">
    <div class="panel-title">📍 我的足迹</div>
    <div
      v-for="(p, i) in places"
      :key="p.name"
      class="place-item"
      :class="{ active: activePlace === p.name }"
      @click="flyTo(p.name)"
    >
      <span class="place-index">{{ i + 1 }}</span>
      <div class="place-item-body">
        <div class="place-item-title">{{ p.icon }} {{ p.name }}</div>
        <div class="place-item-meta">{{ p.date }}</div>
      </div>
    </div>
  </aside>

  <div class="map-wrap">
    <div
      id="travel-map"
      style="width: 100%; height: 60vh; min-height: 480px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);"
    ></div>
  </div>
</div>

## 旅行记录

<div class="travel-timeline">
  <div
    v-for="(p, i) in places"
    :key="p.name"
    class="timeline-item"
    :class="{ even: i % 2 === 1 }"
  >
    <div class="timeline-dot"><div class="dot-inner"></div></div>
    <div class="timeline-card">
      <div class="card-header">
        <div class="travel-icon">{{ p.icon }}</div>
        <div class="travel-info">
          <h3>{{ p.title }}</h3>
          <div class="travel-meta">
            <span class="travel-date">{{ p.date }}</span>
            <span class="travel-location">📍 {{ p.name }}</span>
          </div>
        </div>
      </div>
      <div class="card-content">
        <div class="travel-highlights">
          <div class="highlight-item">
            <span class="highlight-label">景点</span>
            <span class="highlight-value">{{ p.highlights[0] }}</span>
          </div>
          <div class="highlight-item">
            <span class="highlight-label">感受</span>
            <span class="highlight-value">{{ p.highlights[1] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

## 照片墙

<div class="photo-wall" v-if="hasPhotos">
  <template v-for="p in places" :key="'photos-' + p.name">
    <div class="photo-section" v-if="regionPhotos[p.name] && regionPhotos[p.name].length">
      <h3 class="photo-title">{{ p.icon }} {{ p.name }}</h3>
      <div class="photo-grid">
        <figure
          v-for="(photo, idx) in regionPhotos[p.name]"
          :key="idx"
          class="photo-item"
          @click="showPhotoGallery(p.name, idx)"
        >
          <img :src="photo.url" :alt="photo.caption || p.name" loading="lazy">
        </figure>
      </div>
    </div>
  </template>
</div>

<style scoped>
.travel-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 24px 0 24px;
}
.travel-layout {
  display: flex;
  gap: 16px;
  margin: 0 0 48px;
  align-items: stretch;
}
.stat {
  text-align: center;
  background: #fff;
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 16px;
  padding: 16px 20px;
  min-width: 100px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}
.stat-num {
  display: block;
  font-size: 26px;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}
.stat-label {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #8a94a6;
}
.place-list {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 12px;
  background: #fff;
  border: 1px solid rgba(102, 126, 234, 0.12);
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}
.panel-title {
  color: #333;
  font-size: 14px;
  font-weight: 700;
  padding: 2px 4px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 4px;
}
.place-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.place-item:hover {
  background: rgba(102, 126, 234, 0.06);
  border-color: rgba(102, 126, 234, 0.3);
}
.place-item.active {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}
.place-index {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  line-height: 22px;
  text-align: center;
  background: #667eea;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
}
.place-item-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.place-item-meta {
  font-size: 11px;
  color: #999;
}
.map-wrap {
  flex: 1;
  min-width: 0;
}

.travel-timeline {
  position: relative;
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
}
.travel-timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
  transform: translateX(-50%);
  border-radius: 2px;
}
.timeline-item {
  position: relative;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
}
.timeline-item.even {
  flex-direction: row-reverse;
}
.timeline-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #fff;
  border: 4px solid #667eea;
  border-radius: 50%;
  z-index: 10;
  box-shadow: 0 0 0 6px rgba(102, 126, 234, 0.1);
}
.dot-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
}
.timeline-card {
  width: 45%;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
}
.timeline-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}
.card-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
.travel-icon {
  font-size: 32px;
  margin-right: 16px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}
.travel-info h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.travel-meta {
  display: flex;
  gap: 12px;
  font-size: 14px;
  opacity: 0.9;
}
.travel-date {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}
.card-content {
  padding: 20px;
}
.travel-highlights {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.highlight-label {
  min-width: 60px;
  font-weight: 600;
  color: #667eea;
  font-size: 14px;
  padding: 4px 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  text-align: center;
}
.highlight-value {
  flex: 1;
  color: #4a5568;
  line-height: 1.6;
  font-size: 14px;
}

.photo-wall {
  margin: 40px auto;
  max-width: 900px;
}
.photo-section {
  margin: 0 0 32px;
}
.photo-section:last-child {
  margin-bottom: 0;
}
.photo-title {
  font-size: 20px;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.photo-item {
  margin: 0;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  background: #f5f5f5;
}
.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  display: block;
}
.photo-item:hover img {
  transform: scale(1.06);
}

@media (max-width: 768px) {
  .travel-stats {
    gap: 8px;
  }
  .stat {
    padding: 10px 12px;
    min-width: 0;
    flex: 1;
  }
  .stat-num {
    font-size: 20px;
  }
  .stat-label {
    font-size: 11px;
  }
  .travel-layout {
    flex-direction: column;
  }
  .place-list {
    width: 100%;
    max-height: 200px;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .panel-title {
    display: none;
  }
  .place-item {
    min-width: 132px;
    flex-shrink: 0;
  }
  .travel-timeline::before {
    left: 30px;
  }
  .timeline-item,
  .timeline-item.even {
    flex-direction: row;
  }
  .timeline-dot {
    left: 30px;
  }
  .timeline-card {
    width: calc(100% - 60px);
    margin-left: 60px;
  }
}
</style>

<style>
/* 灯箱弹窗挂在 body 上，需全局样式 */
.gallery-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gallery-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
}
.gallery-box {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 92vw;
  max-height: 92vh;
  z-index: 1;
}
.gallery-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  font-size: 22px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  line-height: 36px;
}
.gallery-close:hover {
  background: rgba(255, 255, 255, 0.3);
}
.gallery-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 92vw;
  max-height: 78vh;
}
.gallery-stage img {
  max-width: 92vw;
  max-height: 78vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
}
.gallery-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  color: #fff;
}
.gallery-nav {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
}
.gallery-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}
.gallery-info {
  text-align: center;
  min-width: 160px;
}
.gallery-caption {
  font-size: 15px;
}
.gallery-counter {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
}
</style>

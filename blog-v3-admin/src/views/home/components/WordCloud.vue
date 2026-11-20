<template>
  <div class="tag-cloud-container">
    <div ref="tagContainerRef" class="tag-cloud-block" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getTagDictionary } from "@/api/tag";

const tagContainerRef = ref<HTMLDivElement | null>(null);

const radius = 120;
const fallLength = 800;

const baseAngleX = Math.PI / 500;
const baseAngleY = Math.PI / 500;

let angleX = baseAngleX;
let angleY = baseAngleY;
let extraAngleX = 0;
let extraAngleY = 0;

let timer: number;

interface TagItem {
  el: HTMLSpanElement;
  x: number;
  y: number;
  z: number;
}

let tagList: TagItem[] = [];

function initTagCloud(tags: string[]) {
  if (!tagContainerRef.value) return;

  const container = tagContainerRef.value;
  container.innerHTML = "";
  container.style.position = "relative";
  container.style.perspective = "500px";
  container.style.width = `${radius * 2}px`;
  container.style.height = `${radius * 2}px`;
  container.style.margin = "auto";

  tags.forEach(tag => {
    const span = document.createElement("span");
    span.className = "tag-item";
    span.innerText = tag;
    span.style.whiteSpace = "nowrap";
    span.style.position = "absolute";
    span.style.color = randomColor();
    span.addEventListener("click", () => {
      const baseUrl = location.origin.includes("www.echoblog.com.cn")
        ? "https://www.echoblog.com.cn/admin/#"
        : "http://localhost:12000/#";
      const path = "/article/tagManagement";
      window.location.href = baseUrl + path;
    });
    span.addEventListener("mouseenter", () => {
      pauseAnimation();
      tagList.forEach(tagItem => {
        if (tagItem.el !== span) {
          span.style.fontWeight = "900";
          tagItem.el.style.color = "#ccc";
          tagItem.el.style.opacity = "0.5";
          tagItem.el.style.cursor = "pointer";
        }
      });
    });
    span.addEventListener("mouseleave", () => {
      resumeAnimation();
      tagList.forEach(tagItem => {
        span.style.fontWeight = "500";
        tagItem.el.style.color = randomColor();
        tagItem.el.style.opacity = "1";
      });
    });
    container.appendChild(span);
  });
  const items = Array.from(
    container.getElementsByClassName("tag-item")
  ) as HTMLSpanElement[];
  const len = items.length;
  tagList = items.map((el, i) => {
    const k = -1 + (2 * (i + 1) - 1) / len;
    const a = Math.acos(k);
    const b = a * Math.sqrt(len * Math.PI);
    const x = radius * Math.sin(a) * Math.cos(b);
    const y = radius * Math.sin(a) * Math.sin(b);
    const z = radius * Math.cos(a);
    return { el, x, y, z };
  });
  draw();
  bindMouseEvents(container);
  startAnimation();
}

function draw() {
  tagList.forEach(tag => {
    const scale = fallLength / (fallLength - tag.z);
    const alpha = (tag.z + radius) / (2 * radius);
    const left = tag.x + radius + "px";
    const top = tag.y + radius + "px";
    const fontSize = 14 * scale + "px";
    const opacity = alpha + 0.5;
    const zIndex = Math.floor(scale * 100);

    tag.el.style.left = left;
    tag.el.style.top = top;
    tag.el.style.fontSize = fontSize;
    tag.el.style.opacity = opacity.toString();
    tag.el.style.zIndex = zIndex.toString();
    tag.el.style.transform = `translate(-50%, -50%)`;
  });
}

function rotateX() {
  tagList.forEach(tag => {
    const y = tag.y * Math.cos(angleX) - tag.z * Math.sin(angleX);
    const z = tag.z * Math.cos(angleX) + tag.y * Math.sin(angleX);
    tag.y = y;
    tag.z = z;
  });
}

function rotateY() {
  tagList.forEach(tag => {
    const x = tag.x * Math.cos(angleY) - tag.z * Math.sin(angleY);
    const z = tag.z * Math.cos(angleY) + tag.x * Math.sin(angleY);
    tag.x = x;
    tag.z = z;
  });
}

function startAnimation() {
  clearInterval(timer);
  timer = window.setInterval(() => {
    angleX = baseAngleX + extraAngleX;
    angleY = baseAngleY + extraAngleY;
    rotateX();
    rotateY();
    draw();
  }, 16);
}

function pauseAnimation() {
  clearInterval(timer);
}

function resumeAnimation() {
  startAnimation();
}

function bindMouseEvents(container: HTMLDivElement) {
  container.addEventListener("mousemove", e => {
    const rect = container.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - radius;
    const offsetY = e.clientY - rect.top - radius;
    const distance = Math.sqrt(offsetX ** 2 + offsetY ** 2);
    const speedFactor = Math.min(distance / radius, 1);
    extraAngleY = offsetX * 0.0004 * speedFactor;
    extraAngleX = offsetY * 0.0004 * speedFactor;
  });

  container.addEventListener("mouseleave", () => {
    extraAngleX = 0;
    extraAngleY = 0;
  });
}

function randomColor() {
  return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
    Math.random() * 256
  )}, ${Math.floor(Math.random() * 256)})`;
}

onMounted(async () => {
  const res = await getTagDictionary();
  if (res.code === 0) {
    const tags = res.result.map((v: { tag_name: any }) => v.tag_name);
    initTagCloud(tags);
  }
});
</script>

<style scoped>
.tag-cloud-container {
  width: 100%;
  height: 35vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-cloud-block {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

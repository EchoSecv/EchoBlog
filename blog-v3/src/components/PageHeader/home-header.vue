<template>
  <div id="home">
    <!-- 视频模式 -->
    <video
      v-if="currentMedia.type === 'video'"
      ref="videoA"
      class="bg-video absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000"
      autoplay
      muted
      playsinline
      :src="currentMedia.src"
      @ended="handleVideoEnd"
      :style="{ opacity: 1 }"
    />
    <img
      v-else
      :src="currentMedia.src"
      class="bg-video absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000"
    />

    <div
      class="video-mask absolute top-0 left-0 w-full h-full bg-black pointer-events-none transition-opacity duration-700"
      :style="{ opacity: showMask ? 1 : 0 }"
    ></div>

    <div class="floating-buttons">
      <button @click="switchToPrev" class="fab-btn">Left</button>
      <button @click="switchToNext" class="fab-btn">Right</button>
    </div>


    <div class="font">Echo博客</div>
    <TypeWriter class="type-writer" size="1.2em" :typeList="saying"></TypeWriter>
    <Waves />
    <div v-if="showScrollBottom" class="scroll-bottom">
      <i @click="scrollToBottom" class="iconfont icon-arrowdown"></i>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import videoList from "@/assets/mp4/video.js";
import TypeWriter from "@/components/TypeWriter/type-writer";
import Waves from "@/components/WelcomeComps/waves.vue";
import { debounce } from "@/utils/tool";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const saying = ref([]);
const showScrollBottom = ref(true);

const scrollToBottom = () => {
  const homeElement = document.querySelector("#home");
  if (homeElement) {
    window.scrollTo({ top: homeElement.offsetHeight - 90, behavior: "smooth" });
  }
};

const scrollListener = debounce(() => {
  showScrollBottom.value = document.documentElement.scrollTop <= 50;
}, 50);

const initOneSentence = async () => {
  try {
    const res = await fetch("https://v1.hitokoto.cn/?c=d&encode=json").then((r) => r.json());
    saying.value = [`${res.hitokoto} —— ${res.from}`];
  } catch {
    saying.value = ["你来人间一趟，你要看看太阳 —— 海子"];
  }
};

let autoSwitchTimer = null;

const startAutoSwitch = () => {
  autoSwitchTimer = setInterval(() => {
    triggerMaskAndSwitch("next");
  }, 7000);
};

const stopAutoSwitch = () => {
  if (autoSwitchTimer) {
    clearInterval(autoSwitchTimer);
    autoSwitchTimer = null;
  }
};

onMounted(() => {
  initOneSentence();
  window.addEventListener("scroll", scrollListener);
  startAutoSwitch();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", scrollListener);
  stopAutoSwitch();
});

// 媒体播放逻辑
const currentIndex = ref(0);
const currentMedia = computed(() => videoList[currentIndex.value]);

const videoA = ref(null);
const showMask = ref(false);

const triggerMaskAndSwitch = (direction) => {
  stopAutoSwitch();
  showMask.value = true;
  setTimeout(() => {
    if (direction === 'next') {
      currentIndex.value = (currentIndex.value + 1) % videoList.length;
    } else {
      currentIndex.value = (currentIndex.value - 1 + videoList.length) % videoList.length;
    }
    setTimeout(() => {
      startAutoSwitch();
      showMask.value = false;
    }, 300); // 黑幕淡出后重启
  }, 600); // 黑幕淡入时长
};

const switchToPrev = () => {
  triggerMaskAndSwitch('prev');
};

const switchToNext = () => {
  triggerMaskAndSwitch('next');
};

watch(currentIndex, () => {
  if (videoA.value && currentMedia.value.type === "video") {
    videoA.value.currentTime = 0;
    videoA.value.play();
  }
});
</script>


<style lang="scss" scoped>
#home {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--home-bg);
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;

  .bg {
    z-index: 1;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: 100%;
    z-index: 2;
    background-color: var(--home-mask-color);
  }

  .scroll-bottom {
    position: absolute;
    cursor: pointer;
    bottom: 70px;
    left: 50%;
    color: var(--menu-color);
    transform: translate(-50%, -50%);
    z-index: 1000;

    .icon-arrowdown {
      display: inline-block;
      font-size: 1.5em;
      animation: bounce 2s infinite;
    }
  }
}

.font {
  position: absolute;
  top: 45%;
  left: 50%;
  z-index: 999;
  transform: translate(-50%, -50%);
  font-size: clamp(1em, 4vmin, 20em);
  color: var(--global-white);
  padding: 0.5rem;
  cursor: pointer;
}
.font:hover {
  animation: anime 0.4s cubic-bezier(0.445, 0.05, 0.55, 0.95) alternate forwards;
}

@keyframes anime {
  from {
    font-variation-settings:
      "wght" 300,
      "slnt" 15;
    text-shadow: none;
  }
  to {
    font-variation-settings:
      "wght" 800,
      "slnt" 0;
    text-shadow:
      1px 1px 0px #00e6e6,
      2px 2px 0px #01cccc,
      5px 5px 5px #dda121;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(20px);
    opacity: 0.4;
  }
  50% {
    transform: translateY(0);
    opacity: 1;
  }
}

.type-writer {
  position: absolute;
  top: 60%;
  left: 50%;
  z-index: 999;
  transform: translate(-50%, -50%);
}

.video-mask {
  z-index: 3;
  background-color: black;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.7s ease;
}
.floating-buttons {
  position: absolute;
  bottom: 10%;
  width: 90%;
  right: 5%;
  z-index: 1001;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .fab-btn {
    padding: 0.1em 0.1em;
    width: 5vw;
    height: 5vh;
    font-size: clamp(6px, 0.83vw, 16px);
    background: none;
    opacity: 0.7;
    color: white;
    border: none;
    border-radius: clamp(6px, 0.83vw, 16px);
    cursor: pointer;
    transition: all 0.7s ease;
  }

  .fab-btn:hover {
    background: rgba(255, 255, 255, 0.9);
    color: black;
    opacity: 1;
  }
}

</style>

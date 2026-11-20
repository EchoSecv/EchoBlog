<template>
  <div ref="donutChartRef" style="width: 100%; height: 35vh" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Highcharts from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d";
import { getStatistic } from "@/api/home";
console.log("Highcharts3D = ", Highcharts3D);

const donutChartRef = ref<HTMLElement | null>(null);
let chart: Highcharts.Chart;
const staticsData = ref({
  articleCount: 0,
  categoryCount: 0,
  tagCount: 0,
  userCount: 0
});

function responsiveFont(basePx: number, minPx = 6, maxPx = 18) {
  const scale = window.innerWidth / 1920;
  return Math.max(minPx, Math.min(maxPx, basePx * scale));
}

const getStatisticData = async () => {
  const res = await getStatistic();
  if (res.code === 0) {
    Object.assign(staticsData.value, res.result);
    const data = [
      {
        name: "文章",
        y: staticsData.value.articleCount,
        color: colorMap["文章"]
      },
      {
        name: "分类",
        y: staticsData.value.categoryCount,
        color: colorMap["分类"]
      },
      {
        name: "标签",
        y: staticsData.value.tagCount,
        color: colorMap["标签"]
      },
      {
        name: "用户",
        y: staticsData.value.userCount,
        color: colorMap["用户"]
      }
    ];
    renderChart(data);
  }
};

const colorMap = {
  文章: {
    linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
    stops: [
      [0, "#57CB57"],
      [0.5, "#44AA44"],
      [1, "#2E8B57"]
    ]
  },
  分类: {
    linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
    stops: [
      [0, "#FFD700"],
      [0.5, "#FFCC00"],
      [1, "#FFA500"]
    ]
  },
  标签: {
    linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
    stops: [
      [0, "#00BFFF"],
      [0.5, "#0080FF"],
      [1, "#1E90FF"]
    ]
  },
  用户: {
    linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
    stops: [
      [0, "#FF6666"],
      [0.5, "#CC0000"],
      [1, "#990000"]
    ]
  }
};

const renderChart = (data: Highcharts.PointOptionsObject[]) => {
  if (!donutChartRef.value) return;

  if (chart) {
    chart.destroy();
  }
  chart = Highcharts.chart(donutChartRef.value!, {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      options3d: {
        enabled: true,
        alpha: 45,
        beta: 0,
        depth: 20
      }
    },
    title: {
      text: "站点统计"
    },
    credits: { enabled: false },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.y}</b>"
    },
    plotOptions: {
      pie: {
        size: "100%",
        innerSize: "80%",
        depth: 20,
        dataLabels: {
          enabled: true,
          distance: 15,
          connectorWidth: 1,
          formatter: function () {
            const { name, y, percentage } = this.point;
            const fontSize = responsiveFont(14);
            const fontColorMap: Record<string, string> = {
              文章: "#57CB57",
              分类: "#FFCC00",
              标签: "#0080FF",
              用户: "#cc0000"
            };
            const color = fontColorMap[name] || "#FFFFFF";
            return `<span style="color: ${color}; font-size: ${fontSize}px;">
              ${name}: ${y} (${percentage.toFixed(1)}%)
            </span>`;
          },
          style: {
            textOutline: "none"
          }
        }
      }
    },
    series: [
      {
        name: "数量",
        data
      }
    ]
  });
};

onMounted(() => {
  getStatisticData();
});
</script>

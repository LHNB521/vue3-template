<template>
  <div class="charts-container">
    <AppHeader />
    
    <div class="charts-content p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Charts & Analytics</h1>
        <p class="text-gray-600">Data visualization with ECharts</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <el-card>
          <template #header>
            <span class="font-semibold">Line Chart</span>
          </template>
          <v-chart :option="lineChartOption" class="chart" />
        </el-card>

        <el-card>
          <template #header>
            <span class="font-semibold">Bar Chart</span>
          </template>
          <v-chart :option="barChartOption" class="chart" />
        </el-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <el-card>
          <template #header>
            <span class="font-semibold">Pie Chart</span>
          </template>
          <v-chart :option="pieChartOption" class="chart" />
        </el-card>

        <el-card>
          <template #header>
            <span class="font-semibold">Area Chart</span>
          </template>
          <v-chart :option="areaChartOption" class="chart" />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import AppHeader from '@/components/AppHeader.vue'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const lineChartOption = {
  title: {
    text: 'Monthly Sales',
  },
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330],
      type: 'line',
      smooth: true,
    },
  ],
}

const barChartOption = {
  title: {
    text: 'Product Categories',
  },
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    data: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [120, 200, 150, 80, 70],
      type: 'bar',
      itemStyle: {
        color: '#3b82f6',
      },
    },
  ],
}

const pieChartOption = {
  title: {
    text: 'Traffic Sources',
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: 'Search Engine' },
        { value: 735, name: 'Direct' },
        { value: 580, name: 'Email' },
        { value: 484, name: 'Social Media' },
        { value: 300, name: 'Others' },
      ],
    },
  ],
}

const areaChartOption = {
  title: {
    text: 'User Growth',
  },
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      areaStyle: {
        color: 'rgba(59, 130, 246, 0.3)',
      },
      lineStyle: {
        color: '#3b82f6',
      },
    },
  ],
}
</script>

<style lang="scss" scoped>
.charts-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.charts-content {
  max-width: 1200px;
  margin: 0 auto;
}

.chart {
  height: 300px;
}
</style>

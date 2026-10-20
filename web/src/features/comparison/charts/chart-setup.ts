import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';

// Tree-shaking: Chart.js only bundles what is registered here (radar + bar charts), instead of
// importing 'chart.js/auto', which pulls in every chart type.
Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

Chart.defaults.font.family = "'Inter', ui-sans-serif, system-ui, sans-serif";

// Import Chart from this module, so registration always happens before a chart is created
export { Chart };

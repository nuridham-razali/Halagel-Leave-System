import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Calendar, Download, Maximize2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function BehaviorAnalytics() {
  const { isDarkMode } = useTheme();

  // Mock Data for Charts
  const areaOptions: ApexOptions = {
    chart: { type: 'area', stacked: true, fontFamily: 'Inter, sans-serif', toolbar: { show: false }, background: 'transparent' },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
    colors: ['#EF4444', '#10B981', '#6B7280', '#F59E0B', '#6366F1'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
    legend: { position: 'top' },
    grid: { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)' }
  };
  const areaSeries = [
    { name: 'MC', data: [15, 20, 12, 25, 18, 15, 22, 10, 15, 30, 20, 15] },
    { name: 'Annual', data: [40, 35, 50, 45, 60, 55, 70, 80, 65, 50, 45, 90] },
    { name: 'Unpaid', data: [5, 2, 8, 3, 5, 2, 10, 5, 3, 8, 4, 12] },
  ];

  const scatterOptions: ApexOptions = {
    chart: { type: 'scatter', zoom: { enabled: true }, fontFamily: 'Inter, sans-serif', toolbar: { show: false }, background: 'transparent' },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
    colors: ['#6366F1', '#10B981', '#F59E0B', '#EF4444'],
    xaxis: { title: { text: 'Total Leave Days Taken' }, tickAmount: 10 },
    yaxis: { title: { text: 'Behavior Score' }, min: 0, max: 100 },
    grid: { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)' },
    annotations: {
      yaxis: [{ y: 50, borderColor: '#EF4444', label: { text: 'High Risk Threshold', style: { color: '#fff', background: '#EF4444' } } }],
      xaxis: [{ x: 20, borderColor: '#F59E0B', label: { text: 'High Usage', style: { color: '#fff', background: '#F59E0B' } } }]
    }
  };
  const scatterSeries = [
    { name: 'Engineering', data: [[5, 95], [12, 85], [25, 45], [8, 90], [18, 60]] },
    { name: 'Sales', data: [[15, 75], [22, 55], [30, 35], [10, 88], [5, 92]] },
    { name: 'Marketing', data: [[8, 85], [14, 70], [20, 50], [12, 80], [6, 95]] }
  ];

  const radarOptions: ApexOptions = {
    chart: { type: 'radar', fontFamily: 'Inter, sans-serif', toolbar: { show: false }, background: 'transparent' },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
    labels: ['Monday MCs', 'Friday MCs', 'Bridge Leaves', 'Unpaid Leaves', 'Late Notices'],
    stroke: { width: 2 },
    fill: { opacity: 0.2 },
    markers: { size: 4 },
    colors: ['#6366F1', '#9CA3AF'],
    yaxis: { show: false }
  };
  const radarSeries = [
    { name: 'Selected Employee', data: [80, 60, 40, 20, 50] },
    { name: 'Dept Average', data: [30, 40, 20, 10, 20] }
  ];

  const heatmapOptions: ApexOptions = {
    chart: { type: 'heatmap', fontFamily: 'Inter, sans-serif', toolbar: { show: false }, background: 'transparent' },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
    dataLabels: { enabled: false },
    colors: ['#6366F1'],
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }
  };
  const heatmapSeries = [
    { name: 'Monday', data: [15, 20, 18, 25, 22, 15, 28, 12, 18, 30, 25, 20] },
    { name: 'Tuesday', data: [8, 10, 5, 12, 8, 10, 15, 8, 10, 12, 8, 10] },
    { name: 'Wednesday', data: [5, 8, 10, 5, 12, 8, 10, 5, 8, 10, 5, 8] },
    { name: 'Thursday', data: [10, 12, 8, 15, 10, 12, 18, 10, 12, 15, 10, 12] },
    { name: 'Friday', data: [20, 25, 22, 30, 28, 20, 35, 18, 25, 40, 30, 25] }
  ];

  const renderGauge = (title: string, value: number, color: string) => (
    <div className="bg-bg-card p-4 rounded-xl border border-border-subtle flex flex-col items-center justify-center">
      <div className="relative w-20 h-20 mb-2">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-bg-deep"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="currentColor" strokeWidth="3"
          />
          <path
            className={color}
            strokeDasharray={`${value}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="currentColor" strokeWidth="3"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text-main">
          {value}%
        </div>
      </div>
      <span className="text-xs font-medium text-text-muted text-center">{title}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Behavior Analytics</h1>
          <p className="text-sm text-text-muted">Deep dive into company-wide leave patterns</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-border-subtle rounded-lg text-text-main bg-bg-card hover:bg-bg-hover text-sm font-medium">
            <Calendar className="w-4 h-4" />
            This Year
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Row 1: Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {renderGauge('MC Usage', 65, 'text-red-500')}
        {renderGauge('Annual Leave', 45, 'text-emerald-500')}
        {renderGauge('Unpaid Leave', 12, 'text-gray-400')}
        {renderGauge('Emergency', 8, 'text-amber-500')}
        {renderGauge('Compassionate', 2, 'text-indigo-500')}
      </div>

      {/* Row 2: Area Chart */}
      <div className="bg-bg-card p-6 rounded-xl border border-border-subtle">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-main">Company-Wide Leave Trends (12 Months)</h2>
          <button className="text-text-muted hover:text-text-main"><Maximize2 className="w-4 h-4" /></button>
        </div>
        <div className="h-80">
          <Chart options={areaOptions} series={areaSeries} type="area" height="100%" />
        </div>
      </div>

      {/* Row 3: Scatter & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card p-6 rounded-xl border border-border-subtle">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-main">Employee Behavior Score Distribution</h2>
            <button className="text-text-muted hover:text-text-main"><Maximize2 className="w-4 h-4" /></button>
          </div>
          <div className="h-72">
            <Chart options={scatterOptions} series={scatterSeries} type="scatter" height="100%" />
          </div>
        </div>
        
        <div className="bg-bg-card p-6 rounded-xl border border-border-subtle">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-main">Leave Patterns by Day of Week</h2>
            <button className="text-text-muted hover:text-text-main"><Maximize2 className="w-4 h-4" /></button>
          </div>
          <div className="h-72">
            <Chart options={heatmapOptions} series={heatmapSeries} type="heatmap" height="100%" />
          </div>
        </div>
      </div>

      {/* Row 4: Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-bg-card p-6 rounded-xl border border-border-subtle lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-main">Individual vs Dept Average</h2>
          </div>
          <select className="w-full mb-4 p-2 bg-bg-deep border border-border-subtle text-text-main rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500">
            <option>Jane Smith (Sales)</option>
            <option>John Doe (Engineering)</option>
          </select>
          <div className="h-64">
            <Chart options={radarOptions} series={radarSeries} type="radar" height="100%" />
          </div>
        </div>
        
        <div className="bg-bg-card p-6 rounded-xl border border-border-subtle lg:col-span-2 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-indigo-500/15 text-indigo-400 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">Predictive Insights Engine</h3>
          <p className="text-text-muted max-w-md mb-6">
            Our AI-driven forecast model requires at least 3 months of historical data to generate accurate predictions for future leave trends.
          </p>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Generate Preliminary Report
          </button>
        </div>
      </div>
    </div>
  );
}

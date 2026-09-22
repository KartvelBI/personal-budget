export type AIVisualType =
  | 'bar-chart'
  | 'horizontal-bar'
  | 'area-chart'
  | 'donut-chart'
  | 'kpi-cards'
  | 'client-rank-table';

export interface AIChartDataPoint {
  name: string;
  value: number;
  secondaryValue?: number;
  label?: string;
  color?: string;
  meta?: Record<string, any>;
}

export interface AIKpiCard {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
}

export interface AIVisualData {
  type: AIVisualType;
  title?: string;
  subtitle?: string;
  data?: AIChartDataPoint[];
  kpiCards?: AIKpiCard[];
  unit?: string;
  totalFormatted?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  visual?: AIVisualData;
  suggestions?: string[];
}

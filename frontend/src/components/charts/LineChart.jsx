import { useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceArea,
} from 'recharts';
import { CHART_COLORS } from '../../config/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const LineChart = ({
  data = [],
  lines = [],
  xAxisKey = 'date',
  height = 300,
  showGrid = true,
  showLegend = true,
  showBrush = false,
  enableZoom = false,
  currency = 'USD',
  formatXAxis = (value) => formatDate(value, 'MMM dd'),
  formatYAxis = (value) => formatCurrency(value, currency, true),
}) => {
  const [zoomState, setZoomState] = useState({
    refAreaLeft: '',
    refAreaRight: '',
    left: 'dataMin',
    right: 'dataMax',
    top: 'dataMax+1',
    bottom: 'dataMin-1',
    animation: true,
  });

  const [selecting, setSelecting] = useState(false);

  const zoom = () => {
    let { refAreaLeft, refAreaRight } = zoomState;

    if (refAreaLeft === refAreaRight || refAreaRight === '') {
      setZoomState({
        ...zoomState,
        refAreaLeft: '',
        refAreaRight: '',
      });
      return;
    }

    // xAxis domain
    if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    setZoomState({
      refAreaLeft: '',
      refAreaRight: '',
      left: refAreaLeft,
      right: refAreaRight,
    });
    setSelecting(false);
  };

  const zoomOut = () => {
    setZoomState({
      refAreaLeft: '',
      refAreaRight: '',
      left: 'dataMin',
      right: 'dataMax',
      top: 'dataMax+1',
      bottom: 'dataMin-1',
      animation: true,
    });
  };

  return (
    <div>
      {enableZoom && selecting && (
        <div className="text-xs text-gray-500 mb-1 text-center">
          Selecciona el área para hacer zoom. <button onClick={zoomOut} className="text-primary-600 hover:underline">Reset zoom</button>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: showBrush ? 25 : 5 }}
          onMouseDown={enableZoom ? (e) => {
            if (e && e.activeLabel) {
              setZoomState({ ...zoomState, refAreaLeft: e.activeLabel });
              setSelecting(true);
            }
          } : undefined}
          onMouseMove={enableZoom ? (e) => {
            if (selecting && e && e.activeLabel) {
              setZoomState({ ...zoomState, refAreaRight: e.activeLabel });
            }
          } : undefined}
          onMouseUp={enableZoom ? zoom : undefined}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            allowDataOverflow
            dataKey={xAxisKey}
            domain={[zoomState.left, zoomState.right]}
            type="category"
            tickFormatter={formatXAxis}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            allowDataOverflow
            domain={[zoomState.bottom, zoomState.top]}
            type="number"
            tickFormatter={formatYAxis}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            yAxisId="1"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value, name) => [formatCurrency(value, currency), name]}
            labelFormatter={(label) => formatDate(label, 'MMM dd, yyyy')}
          />
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              yAxisId="1"
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              animationDuration={300}
            />
          ))}

          {enableZoom && zoomState.refAreaLeft && zoomState.refAreaRight && (
            <ReferenceArea
              yAxisId="1"
              x1={zoomState.refAreaLeft}
              x2={zoomState.refAreaRight}
              strokeOpacity={0.3}
              fill="#0ea5e9"
              fillOpacity={0.3}
            />
          )}

          {showBrush && data.length > 0 && (
            <Brush
              dataKey={xAxisKey}
              height={20}
              stroke="#0ea5e9"
              tickFormatter={formatXAxis}
            />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

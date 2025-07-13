import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface ProgressChartProps {
  data: Array<{
    date: string;
    weight: number;
  }>;
}

export const ProgressChart = ({ data }: ProgressChartProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: '2-digit'
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-md">
          <p className="text-sm font-medium">
            {formatDate(label)}
          </p>
          <p className="text-sm text-primary">
            Peso: <span className="font-semibold">{payload[0].value} kg</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            className="text-xs"
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={['dataMin - 1', 'dataMax + 1']}
            className="text-xs"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ 
              fill: 'hsl(var(--primary))', 
              strokeWidth: 0, 
              r: 6 
            }}
            activeDot={{ 
              r: 8, 
              stroke: 'hsl(var(--primary))',
              strokeWidth: 2,
              fill: 'hsl(var(--background))'
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
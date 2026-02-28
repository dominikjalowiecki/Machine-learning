import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

function DataVisualization({ formData }) {
  if (!formData) return null;

  const referenceRanges = {
    Glucose: { min: 83, max: 143.4, optimal: 107, label: 'Glukoza (mg/dL)' },
    BloodPressure: {
      min: 56,
      max: 86,
      optimal: 70,
      label: 'Ciśnienie (mm Hg)',
    },
    BMI: { min: 23, max: 39.4, optimal: 30.1, label: 'BMI (kg/m²)' },
    Age: { min: 21, max: 48, optimal: 27, label: 'Wiek (lat)' },
    Insulin: { min: 48, max: 250.5, optimal: 102.5, label: 'Insulina (μU/mL)' },
    SkinThickness: { min: 15, max: 41, optimal: 27, label: 'Fałd skórny (mm)' },
  };

  const barData = Object.keys(referenceRanges).map((key) => {
    const value = formData[key];
    const range = referenceRanges[key];

    let statusLabel = 'Norma';
    let color = '#10b981';

    if (value < range.min) {
      statusLabel = 'Poniżej normy';
      color = '#3b82f6';
    } else if (value > range.max) {
      statusLabel = 'Powyżej normy';
      color = '#ef4444';
    }

    return {
      name: range.label.split(' ')[0],
      wartość: parseFloat(value.toFixed(1)),
      minimum: range.min,
      optimum: range.optimal,
      maksimum: range.max,
      status: statusLabel,
      color: color,
    };
  });

  return (
    <div className='space-y-6'>
      <div className='rounded-sm shadow-md bg-white p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>
          Porównanie z zakresami referencyjnymi
        </h3>
        <ResponsiveContainer width='100%' height={350}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
            <XAxis
              dataKey='name'
              tick={{ fill: '#6b7280', fontSize: 11 }}
              angle={-15}
              textAnchor='end'
              height={60}
            />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value, name) => {
                if (name === 'wartość') return [value.toFixed(1), 'Wartość'];
                if (name === 'minimum') return [value.toFixed(1), 'Min'];
                if (name === 'maksimum') return [value.toFixed(1), 'Max'];
                if (name === 'optimum') return [value.toFixed(1), 'Optimum'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey='wartość' radius={[8, 8, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey='minimum' fill='#cbd5e1' radius={[4, 4, 0, 0]} />
            <Bar dataKey='optimum' fill='#94a3b8' radius={[4, 4, 0, 0]} />
            <Bar dataKey='maksimum' fill='#64748b' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DataVisualization;

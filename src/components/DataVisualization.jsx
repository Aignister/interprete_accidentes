import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6384'];

const DataVisualization = ({ data }) => {
  const [activeTab, setActiveTab] = useState('severity');
  
  if (!data || !data.detailedData) {
    return <div className="text-center py-8 text-gray-500">No hay datos para visualizar</div>;
  }
  
  // Preparamos los datos para los gráficos Datps para los graficos
  const { severityCounts, vehicleTypeCounts } = data.detailedData;
  
  // Datos para el grafico de gravedad
  const severityData = Object.entries(severityCounts).map(([name, value]) => ({
    name,
    cantidad: value
  }));
  
  // Datos para el grafico de tipos de vehículos
  const vehicleData = Object.entries(vehicleTypeCounts).map(([name, value]) => ({
    name,
    cantidad: value
  }));
  
  // Datos para el grafico de factores de riesgo
  const riskFactorsData = [
    { name: 'Alcohol', value: data.detailedData.alcoholInvolved },
    { name: 'Exceso de Velocidad', value: data.detailedData.speedingInvolved },
    { name: 'Ninguno', value: data.summary['Accidentes válidos'] - 
      (data.detailedData.alcoholInvolved + data.detailedData.speedingInvolved - 
       // Se restan los que tienen ambos factores para no contarlos dos veces, para llegar a una aproximacion
       Math.min(data.detailedData.alcoholInvolved, data.detailedData.speedingInvolved) * 0.5)
    }
  ];
  
  return (
    <div className="mt-8">
      <div className="flex mb-4 border-b">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'severity' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('severity')}
        >
          Gravedad
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'vehicles' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('vehicles')}
        >
          Vehículos
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'riskFactors' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('riskFactors')}
        >
          Factores de Riesgo
        </button>
      </div>
      
      <div className="bg-gray-50 p-2 rounded-lg">
        {activeTab === 'severity' && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={severityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {activeTab === 'vehicles' && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={vehicleData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {activeTab === 'riskFactors' && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskFactorsData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {riskFactorsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualization;
import { useRef } from 'react';
import DataVisualization from './DataVisualization';

const ReportViewer = ({ report, isLoading }) => {
  const reportRef = useRef(null);

  const downloadReport = () => {
    if (!report) return;
    
    // Creamos un blob con el contenido del reporte en formato JSON
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Creamos un enlace temporal para la descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte-accidentes.json';
    document.body.appendChild(a);
    a.click();
    
    // Limpiamos los recursos
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Función para renderizar el análisis léxico
  const renderLexicalAnalysis = () => {
    if (!report || !report.lexicalAnalysis || !report.lexicalAnalysis.tokens) {
      return null;
    }
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Analisis Lexico</h3>
        <div className="max-h-60 overflow-y-auto border rounded p-2">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.lexicalAnalysis.tokens.slice(0, 20).map((token, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{token.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{token.type}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{token.value}</td>
                </tr>
              ))}
              {report.lexicalAnalysis.tokens.length > 20 && (
                <tr>
                  <td colSpan="3" className="px-3 py-2 text-sm text-gray-500 text-center">
                    ... y {report.lexicalAnalysis.tokens.length - 20} tokens más
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Función para renderizar el análisis sintáctico
  const renderSyntacticAnalysis = () => {
    if (!report || !report.syntacticAnalysis) {
      return null;
    }
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Analisis Sintactico</h3>
        <div className="max-h-60 overflow-y-auto border rounded p-2">
          {report.syntacticAnalysis.isValid ? (
            <div className="p-3 bg-green-100 text-green-800 rounded">
              <p className="font-medium">Analisis sintactico exitoso</p>
              <p>Se validaron {report.syntacticAnalysis.validatedRows} registros correctamente.</p>
            </div>
          ) : (
            <div>
              <div className="p-3 mb-3 bg-red-100 text-red-800 rounded">
                <p className="font-medium">Se encontraron errores sintacticos:</p>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {report.syntacticAnalysis.errors && report.syntacticAnalysis.errors.slice(0, 5).map((error, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    Fila {error.row}, {error.column}: {error.message} (valor: {error.value})
                  </li>
                ))}
                {report.syntacticAnalysis.errors && report.syntacticAnalysis.errors.length > 5 && (
                  <li className="text-sm text-gray-500">
                    ... y {report.syntacticAnalysis.errors.length - 5} errores más
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Función para renderizar el análisis semántico
  const renderSemanticAnalysis = () => {
    if (!report || !report.semanticAnalysis) {
      return null;
    }
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Analisis Semantico</h3>
        <div className="max-h-60 overflow-y-auto border rounded p-2">
          {report.semanticAnalysis.isValid ? (
            <div className="p-3 bg-green-100 text-green-800 rounded">
              <p className="font-medium">Analisis semantico exitoso</p>
              <p>Todos los datos son coherentes y tienen sentido en el contexto.</p>
            </div>
          ) : (
            <div>
              <div className="p-3 mb-3 bg-red-100 text-red-800 rounded">
                <p className="font-medium">Se encontraron errores semanticos:</p>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {report.semanticAnalysis.errors && report.semanticAnalysis.errors.slice(0, 5).map((error, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    Fila {error.row}, {error.field}: {error.message} (valor: {error.value})
                  </li>
                ))}
                {report.semanticAnalysis.errors && report.semanticAnalysis.errors.length > 5 && (
                  <li className="text-sm text-gray-500">
                    ... y {report.semanticAnalysis.errors.length - 5} errores más
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Función para renderizar el resumen del reporte
  const renderSummary = () => {
    if (!report || !report.summary) {
      return null;
    }
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Resumen</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <ul className="space-y-2">
            {Object.entries(report.summary).map(([key, value]) => (
              <li key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div ref={reportRef} className="h-full">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Analizando datos...</p>
        </div>
      ) : report ? (
        <div>
    
          {renderSummary()}
          
          {/* Visualización gráfica de los datos */}
          <DataVisualization data={report} />
          
          <div className="mt-8 border-t pt-4">
            <h3 className="text-xl font-semibold mb-4">Detalles del Analisis</h3>
            
            {renderLexicalAnalysis()}
            {renderSyntacticAnalysis()}
            {renderSemanticAnalysis()}
          </div>
          <div className="mb-4">
            <button
              onClick={downloadReport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Descargar Reporte
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p className="text-center">Sube un archivo CSV y haz clic en "Iniciar Analisis" para ver el reporte</p>
        </div>
      )}
    </div>
  );
};

export default ReportViewer;
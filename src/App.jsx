import { useState } from 'react';
import FileUploader from './components/FileUploader';
import ReportViewer from './components/ReportViewer';
import Parser from './services/Parser';

function App() {
  const [csvData, setCsvData] = useState(null);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = (data) => {
    setCsvData(data);
    setReport(null);
    setError(null);
  };

  const generateReport = async () => {
    if (!csvData) {
      setError("Ingrese un archivo CSV para analizar.");
      return;
    }

    setIsLoading(true);
    try {
      const parser = new Parser(csvData);
      
      // Realizacion del analisis lexico, semantico y sintactico
      const lexicalAnalysis = parser.performLexicalAnalysis();
      const syntacticAnalysis = parser.performSyntacticAnalysis(lexicalAnalysis);
      const semanticAnalysis = parser.performSemanticAnalysis(syntacticAnalysis);
      
      // Generacion de reporte final
      const finalReport = parser.generateReport(semanticAnalysis);
      
      setReport(finalReport);
      setError(null);
    } catch (err) {
      setError(`Error al analizar el archivo: ${err.message}`);
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="bg-gray-900 px-6 py-6 shadow-md">
        <div className="flex justify-center items-center">
          <span className="text-white text-2xl font-bold">
            <span className="text-blue-400">Interprete </span>
            de accidentes automovilisticos
          </span>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
            {/* Panel izquierdo */}
            <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Cargar datos</h2>
              <FileUploader onFileUpload={handleFileUpload} />

              {csvData && (
                <div className="mt-6">
                  <button 
                    onClick={generateReport}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Analizando...' : 'Iniciar Análisis'}
                  </button>
                </div>
              )}
              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
                  {error}
                </div>
              )}
            </div>
            {/* Panel derecho */}
            <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Reporte</h2>
              <ReportViewer report={report} isLoading={isLoading} />
            </div>
          </div>
        </div>
    </div>
  );
}

export default App;
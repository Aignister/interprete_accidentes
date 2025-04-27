import { useState, useRef } from 'react';
import Papa from 'papaparse';

const FileUploader = ({ onFileUpload }) => {
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Por favor, sube un archivo CSV válido');
      return;
    }

    setFileName(file.name);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          console.error("Error al procesar el CSV:", results.errors);
          alert("Error al procesar el archivo CSV");
          return;
        }
        onFileUpload(results.data);
      }
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center border-2 border-dashed p-6 rounded-lg transition-colors ${
        dragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleChange}
        className="hidden"
      />
      
      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
      </svg>
      
      <p className="mb-2 text-sm text-gray-600">
        <span className="font-semibold">Haz clic para seleccionar</span> o arrastra y suelta
      </p>
      <p className="text-xs text-gray-500">Solo archivos CSV</p>
      
      {fileName && (
        <div className="mt-4 p-2 bg-blue-50 text-blue-700 rounded-md w-full text-center">
          Archivo cargado: {fileName}
        </div>
      )}
      
      <button
        type="button"
        onClick={onButtonClick}
        className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Seleccionar Archivo
      </button>
    </div>
  );
};

export default FileUploader;
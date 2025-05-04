// Tokens a utilizar dentro del interprete
const TOKEN_TYPES = {
  ACCIDENT_ID: 'id',                // Identificador del accidente
  DATE: 'fecha',                              // Fecha del accidente
  TIME: 'hora',                               // Hora del accidente
  LOCATION: 'ubicacion',                   // Ubicacion del accidente
  VEHICLE_TYPE: 'tipo_vehiculo',              // Tipo de vehiculo involucrado
  SEVERITY: 'gravedad',                       // Gravedad del accidente
  CASUALTIES: 'victimas',                     // Numero de victimas
  WEATHER_CONDITION: 'condicion_climatica',   // Condicion climática
  ROAD_CONDITION: 'condicion_via',            // Condicion de la vía
  DRIVER_AGE: 'edad_conductor',               // Edad del conductor
  ALCOHOL_INVOLVED: 'alcohol_involucrado',    // Alcohol involucrado
  SPEEDING_INVOLVED: 'exceso_velocidad'       // Exceso de velocidad
};

// Mapeo entre nombres de campo en español y tipos de token
const FIELD_TO_TOKEN_MAP = {
  'id': TOKEN_TYPES.ACCIDENT_ID,
  'fecha': TOKEN_TYPES.DATE,
  'hora': TOKEN_TYPES.TIME,
  'ubicacion': TOKEN_TYPES.LOCATION,
  'tipo_vehiculo': TOKEN_TYPES.VEHICLE_TYPE,
  'gravedad': TOKEN_TYPES.SEVERITY,
  'victimas': TOKEN_TYPES.CASUALTIES,
  'condicion_climatica': TOKEN_TYPES.WEATHER_CONDITION,
  'condicion_via': TOKEN_TYPES.ROAD_CONDITION,
  'edad_conductor': TOKEN_TYPES.DRIVER_AGE,
  'alcohol_involucrado': TOKEN_TYPES.ALCOHOL_INVOLVED,
  'exceso_velocidad': TOKEN_TYPES.SPEEDING_INVOLVED
};

// Reglas sintacticas para validar los datos
const SYNTACTIC_RULES = {
  ACCIDENT_ID: {
    pattern: /^ACC-\d{4}-\d{6}$/,
    message: 'ID del accidente debe tener formato ACC-YYYY-XXXXXX'
  },
  DATE: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: 'La fecha debe tener formato YYYY-MM-DD'
  },
  TIME: {
    pattern: /^\d{2}:\d{2}$/,
    message: 'La hora debe tener formato HH:MM'
  },
  DRIVER_AGE: {
    pattern: /^\d{1,3}$/,
    message: 'La edad del conductor debe ser un número entre 1 y 999'
  },
  CASUALTIES: {
    pattern: /^\d+$/,
    message: 'El número de víctimas debe ser un numero entero'
  },
  ALCOHOL_INVOLVED: {
    pattern: /^(si|no|true|false|1|0)$/i,
    message: 'Alcohol involucrado debe ser si/no, true/false, o 1/0'
  },
  SPEEDING_INVOLVED: {
    pattern: /^(si|no|true|false|1|0)$/i,
    message: 'Exceso de velocidad debe ser si/no, true/false, o 1/0'
  }
};

// Reglas semanticas para validar la coherencia
const SEMANTIC_RULES = {
  validateDate: (date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate) && parsedDate <= new Date();
  },
  validateTime: (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
  },
  validateDriverAge: (age) => {
    const numAge = Number(age);
    return numAge >= 16 && numAge <= 100; // Edad de conductor entre 16 y 100 años
  },
  validateSeverity: (severity) => {
    return ['leve', 'moderado', 'grave', 'fatal'].includes(severity.toLowerCase());
  },
  validateWeatherCondition: (condition) => {
    return ['soleado', 'nublado', 'lluvioso', 'nevado', 'niebla'].includes(condition.toLowerCase());
  },
  validateRoadCondition: (condition) => {
    return ['seco', 'mojado', 'hielo', 'nieve', 'obra'].includes(condition.toLowerCase());
  }
}; 

class Parser {
  constructor(csvData) {
    this.csvData = csvData;
    this.symbolTable = new Map(); // Tabla de simbolos 
  }

  // Analisis lexico de los datos CSV
  performLexicalAnalysis() {
    const tokens = [];
    
    this.csvData.forEach((row, rowIndex) => {
      const rowTokens = [];
      
      // Se procesa cada campo del CSV como un token
      Object.entries(row).forEach(([key, value]) => {
        // Aquí es donde hacemos el mapeo correcto
        const normalizedKey = key.trim().toLowerCase();
        const tokenType = FIELD_TO_TOKEN_MAP[normalizedKey] || 'UNKNOWN';
        
        rowTokens.push({
          name: key,                                  // Nombre del campo  
          type: tokenType,                            // Tipo de token 
          value: value,                               // Valor del token
          row: rowIndex + 1,                          // Fila en el CSV
          position: Object.keys(row).indexOf(key) + 1 // Posicion en la fila
        });
      });
      
      tokens.push(rowTokens);
    });
    
    return { tokens: tokens.flat() };
  }

  // Analsis sintactico de los tokens generados en el analisis lexico
  performSyntacticAnalysis(lexicalResult) {
    const errors = [];
    const validatedRows = [];
    
    // Agrupar tokens por fila
    const tokensByRow = lexicalResult.tokens.reduce((acc, token) => {
      if (!acc[token.row]) {
        acc[token.row] = [];
      }
      acc[token.row].push(token);
      return acc;
    }, {});
    
    // Validar la sintaxis de cada fila
    Object.entries(tokensByRow).forEach(([rowIndex, rowTokens]) => {
      const rowErrors = [];
      const validatedRow = {};
      
      rowTokens.forEach(token => {
        validatedRow[token.name] = token.value;
        
        // Verificar si el token cumple con la regla sintáctica
        const rule = SYNTACTIC_RULES[token.type];
        if (rule && !rule.pattern.test(token.value)) {
          rowErrors.push({
            row: parseInt(rowIndex),
            column: token.name,
            message: rule.message,
            value: token.value
          });
        }
      });
      
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        validatedRows.push(validatedRow);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      validatedRows
    };
  }

  // Realizar el analisis semantico de los datos validados 
  performSemanticAnalysis(syntacticResult) {
    if (!syntacticResult.isValid) {
      return {
        isValid: false,
        errors: syntacticResult.errors,
        message: "No se puede realizar el análisis semántico debido a errores sintácticos."
      };
    }
    
    const semanticErrors = [];
    const validRows = [];
    
    syntacticResult.validatedRows.forEach((row, rowIndex) => {
      const rowErrors = [];
      
      // Validacion de coherencia semantica
      if (row.fecha && !SEMANTIC_RULES.validateDate(row.fecha)) {
        rowErrors.push({
          row: rowIndex + 1,
          field: 'fecha',
          message: 'La fecha no es válida o es en el futuro',
          value: row.fecha
        });
      }
      
      if (row.hora && !SEMANTIC_RULES.validateTime(row.hora)) {
        rowErrors.push({
          row: rowIndex + 1,
          field: 'hora',
          message: 'La hora no tiene un formato válido',
          value: row.hora
        });
      }
      
      if (row.edad_conductor && !SEMANTIC_RULES.validateDriverAge(row.edad_conductor)) {
        rowErrors.push({
          row: rowIndex + 1,
          field: 'edad_conductor',
          message: 'La edad del conductor debe estar entre 16 y 100 años',
          value: row.edad_conductor
        });
      }
      
      if (row.gravedad && !SEMANTIC_RULES.validateSeverity(row.gravedad)) {
        rowErrors.push({
          row: rowIndex + 1,
          field: 'gravedad',
          message: 'La gravedad debe ser: leve, moderado, grave o fatal',
          value: row.gravedad
        });
      }
      
      if (row.condicion_climatica && !SEMANTIC_RULES.validateWeatherCondition(row.condicion_climatica)) {
        rowErrors.push({
          row: rowIndex + 1,
          field: 'condicion_climatica',
          message: 'La condición climática no es válida',
          value: row.condicion_climatica
        });
      }
      
      if (row.condicion_via && !SEMANTIC_RULES.validateRoadCondition(row.condicion_via)) {
        rowErrors.push({
          row: rowIndex + 1,
          field: 'condicion_via',
          message: 'La condición de la vía no es válida',
          value: row.condicion_via
        });
      }
      
      // Si no hay errores, se agrega la fila a la tabla de simbolos
      if (rowErrors.length === 0) {
        const accidentId = row.id || `accident-${rowIndex}`;
        this.symbolTable.set(accidentId, row);
        validRows.push(row);
      } else {
        semanticErrors.push(...rowErrors);
      }
    });
    
    return {
      isValid: semanticErrors.length === 0,
      errors: semanticErrors,
      validRows,
      symbolTable: Array.from(this.symbolTable.entries())
    };
  }

  // Genera el reporte final basado en el analisis semantico
  generateReport(semanticResult) {
    // Si hay errores, devolvemos un reporte con los errores
    if (!semanticResult.isValid) {
      return {
        status: 'error',
        lexicalAnalysis: {
          tokens: this.performLexicalAnalysis().tokens
        },
        syntacticAnalysis: {
          errors: semanticResult.errors,
          isValid: false
        },
        semanticAnalysis: {
          errors: semanticResult.errors,
          isValid: false
        },
        summary: {
          'Total de accidentes analizados': this.csvData.length,
          'Accidentes validos': 0,
          'Accidentes con errores': this.csvData.length
        }
      };
    }
    
    // Si todo es valido, generamos el reporte
    const validRows = semanticResult.validRows;
    
    // Accidentes por gravedad
    const severityCounts = validRows.reduce((acc, row) => {
      const severity = (row.gravedad || '').toLowerCase();
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});
    
    // Accidentes por tipo de vehiculo
    const vehicleTypeCounts = validRows.reduce((acc, row) => {
      const vehicleType = row.tipo_vehiculo || 'No especificado';
      acc[vehicleType] = (acc[vehicleType] || 0) + 1;
      return acc;
    }, {});
    
    // Accidentes con alcohol y exceso de velocidad
    const alcoholInvolved = validRows.filter(row => {
      const value = (row.alcohol_involucrado || '').toLowerCase();
      return value === 'si' || value === 'true' || value === '1';
    }).length;
    
    const speedingInvolved = validRows.filter(row => {
      const value = (row.exceso_velocidad || '').toLowerCase();
      return value === 'si' || value === 'true' || value === '1';
    }).length;
    
    // Victimas totales
    const totalCasualties = validRows.reduce((sum, row) => {
      return sum + (parseInt(row.victimas) || 0);
    }, 0);
    
    // Reporte final
    return {
      status: 'success',
      lexicalAnalysis: {
        tokens: this.performLexicalAnalysis().tokens
      },
      syntacticAnalysis: {
        isValid: true,
        validatedRows: validRows.length
      },
      semanticAnalysis: {
        isValid: true,
        symbolTable: semanticResult.symbolTable
      },
      summary: {
        'Total de accidentes analizados': this.csvData.length,
        'Accidentes validos': validRows.length,
        'Total de victimas': totalCasualties,
        'Accidentes con alcohol involucrado': alcoholInvolved,
        'Accidentes con exceso de velocidad': speedingInvolved,
        'Accidentes por gravedad': Object.entries(severityCounts)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      },
      detailedData: {
        severityCounts,
        vehicleTypeCounts,
        alcoholInvolved,
        speedingInvolved,
        totalCasualties
      }
    };
  }
}

export default Parser;
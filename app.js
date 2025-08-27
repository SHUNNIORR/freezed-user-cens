// buscar.js
const fs = require("fs");

// Obtener argumentos de la consola
const [,, userId, freezeValue] = process.argv;

if (!userId) {
  console.error("❌ Debes ingresar un userId");
  console.log("👉 Ejemplo: node buscar.js 4646259");
  process.exit(1);
}


// Leer el archivo original
const fileName = "spool 2.txt";
const outputFile = "spool 2_modificado.txt";
const data = fs.readFileSync(fileName, "utf8");

// Separar en filas
const lines = data.split("\n");

let found = false;

for (let i = 0; i < lines.length; i++) {
  const cols = lines[i].split("|");

  // Verificar si la fila empieza con 1 y la columna 4 (índice 4 porque empieza en 0) tiene el userId
  if (cols[0] === "1" && cols[4] === userId) {
    found = true;

    // Buscar la siguiente fila que inicie con 14
    for (let j = i + 1; j < lines.length; j++) {
      const cols2 = lines[j].split("|");
      if (cols2[0] === "14") {
         // Extraer columnas 7, 9, 10, 11, 12 (índices 6, 8, 9, 10, 11 en el array)
        // const result = {
        //   col7: calculateFreezeValue(cols2[7]) || null,
        //   col9: calculateFreezeValue(cols2[9]) || null,
        //   col10: calculateFreezeValue(cols2[10]) || null,
        //   col11: extractAndSubtract(cols2[11]) || null,
        //   col12: calculateFreezeValue(cols2[12]) || null,
        // };
        // Aplicar transformaciones
        cols2[7] = calculateFreezeValue(cols2[7]);   // col7
        cols2[9] = calculateFreezeValue(cols2[9]);   // col9
        cols2[10] = calculateFreezeValue(cols2[10]);   // col10
        cols2[11] = extractAndSubtract(cols2[11]);   // col11
        cols2[12] = calculateFreezeValue(cols2[12]); // col12

         // Reconstruir la línea modificada
        lines[j] = cols2.join("|");

        console.log("✅ Fila 14 modificada:");
        console.log(lines[j]);

        // Guardar copia del archivo
        fs.writeFileSync(outputFile, lines.join("\n"), "utf8");
        console.log(`📂 Archivo generado: ${outputFile}`);

        process.exit(0);
      }
    }
  }
}

if (!found) {
  console.log("❌ No se encontró ningún bloque con userId:", userId);
}

function calculateFreezeValue(currentValue){
    let value = Number(currentValue) - freezeValue;
    return String(value);
}

function extractAndSubtract(col11) {
  const regex = /\(3900\)(.*?)\(96\)/;
  const match = col11.match(regex);

  if (!match) return col11; // Si no encuentra nada, retorna el original

  // Valor original
  const original = parseInt(match[1], 10);

  // Resta con freezeValue
  const newValue = String(original - freezeValue).padStart(10, "0");

  // Reemplazo en la cadena
  return col11.replace(regex, `(3900)${newValue}(96)`);
}


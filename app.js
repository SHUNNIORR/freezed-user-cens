// modulo para escribir y modificar archivos
const fs = require("fs");

// Obtener argumentos
const [,, userIdArg, freezeValueArg] = process.argv;

if (!userIdArg || !freezeValueArg) {
  console.error("❌ Debes ingresar userId y freezeValue");
  console.log("👉 Ejemplo: node buscar.js 27506859 1000");
  process.exit(1);
}

const freezeValue = Number(freezeValueArg || 0);

// Archivos
const originalFile = "spool 2.txt";
const outputFile = "spool 2_modificado.txt";

// Decidir si usar el modificado (si ya existe) o el original
const fileToUse = fs.existsSync(outputFile) ? outputFile : originalFile;

// Leer como Buffer y decodificar en Latin1 (ISO-8859-1 / ANSI)
const rawData = fs.readFileSync(fileToUse);
let data = rawData.toString("latin1");

// Separar en filas (LF o CRLF)
let lines = data.split(/\r?\n/);

let found = false;

for (let i = 0; i < lines.length; i++) {
  const cols = lines[i].split("|");

  if (cols[0] === "1" && cols[11] === userIdArg) {
    found = true;

    // Buscar la fila 14 del mismo bloque
    for (let j = i + 1; j < lines.length; j++) {
      const cols2 = lines[j].split("|");

      if (cols2[0] === "14") {
        // Aplicar transformaciones
        cols2[7]  = calculateFreezeValue(cols2[7]);   // col7
        cols2[9]  = calculateFreezeValue(cols2[9]);   // col9
        cols2[10] = calculateFreezeValue(cols2[10]);  // col10
        cols2[11] = extractAndSubtract(cols2[11]);    // col11
        cols2[12] = calculateFreezeValue(cols2[12]);  // col12

        // Reconstruir la línea modificada
        lines[j] = cols2.join("|");

        console.log("✅ Fila 14 modificada:");
        console.log(lines[j]);

        // Reconstruir archivo completo
        const updatedFile = lines.join("\n");

        // Guardar en Latin1 (sin iconv-lite)
        fs.writeFileSync(outputFile, Buffer.from(updatedFile, "latin1"));

        console.log(`📂 Archivo actualizado: ${outputFile}`);
        process.exit(0);
      }
    }
  }
}

if (!found) {
  console.log("❌ No se encontró ningún bloque con userId:", userIdArg);
}

// Helpers
function calculateFreezeValue(currentValue) {
  if (!currentValue) return currentValue;
  let value = Number(currentValue) - freezeValue;
  return String(value);
}

function extractAndSubtract(col11) {
  const regex = /\(3900\)(.*?)\(96\)/;
  const match = col11.match(regex);

  if (!match) return col11;

  const original = parseInt(match[1], 10);
  let newValue = original - freezeValue;

  return col11.replace(regex, `(3900)${String(newValue).padStart(10, "0")}(96)`);
}
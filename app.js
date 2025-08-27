// buscar.js
const fs = require("fs");

// Obtener argumentos de la consola
const [,, userId, freezeValue] = process.argv;

if (!userId) {
  console.error("❌ Debes ingresar un userId");
  console.log("👉 Ejemplo: node buscar.js 4646259");
  process.exit(1);
}

// Leer el archivo txt
const data = fs.readFileSync("spool 2.txt", "utf8");

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
        console.log("✅ Fila encontrada:");
        console.log(lines[j]);
        process.exit(0);
      }
    }
  }
}

if (!found) {
  console.log("❌ No se encontró ningún bloque con userId:", userId);
}

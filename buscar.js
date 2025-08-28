const fs = require("fs");
const iconv = require("iconv-lite");

function processFile(filePath, userId, freezeValue) {
  // Leer archivo como Latin1 (ISO-8859-1)
  const rawData = fs.readFileSync(filePath);
  const data = iconv.decode(rawData, "latin1");

  const lines = data.split(/\r?\n/); // soporta LF y CRLF
  let updatedLines = [...lines];
  let found = false;
  let row14 = null;

  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split("|");

    if (cols[0] === "1" && cols[11] === userId) {
      found = true;

      for (let j = i + 1; j < lines.length; j++) {
        const cols2 = lines[j].split("|");

        if (cols2[0] === "14") {
          cols2[7]  = calculateFreezeValue(cols2[7], freezeValue);
          cols2[9]  = calculateFreezeValue(cols2[9], freezeValue);
          cols2[10] = calculateFreezeValue(cols2[10], freezeValue);
          cols2[11] = extractAndSubtract(cols2[11], freezeValue);
          cols2[12] = calculateFreezeValue(cols2[12], freezeValue);

          updatedLines[j] = cols2.join("|");
          row14 = cols2;
          break;
        }
      }
    }
  }

  if (!found) {
    throw new Error("❌ No se encontró ningún bloque con userId: " + userId);
  }

  // Reconstruir archivo con LF (como original)
  const updatedFile = updatedLines.join("\n");
  return { updatedFile, row14 };
}

// Helpers
function calculateFreezeValue(currentValue, freezeValue) {
  let value = Number(currentValue) - freezeValue;
  // if (value < 0) value = 0;
  return String(value).padStart(currentValue.length, "0");
}

function extractAndSubtract(col11, freezeValue) {
  const regex = /\(3900\)(.*?)\(96\)/;
  const match = col11.match(regex);

  if (!match) return col11;

  let newValue = parseInt(match[1], 10) - freezeValue;
  if (newValue < 0) newValue = 0;

  const newValueStr = String(newValue).padStart(10, "0");
  return col11.replace(regex, `(3900)${newValueStr}(96)`);
}

module.exports = { processFile };

const fs = require("fs");

function processFile(filePath, userIdArg, freezeValue) {
  const data = fs.readFileSync(filePath, "utf8");
  let lines = data.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split("|");

    if (cols[0] === "1" && cols[11] === userIdArg) {
      for (let j = i + 1; j < lines.length; j++) {
        const cols2 = lines[j].split("|");

        if (cols2[0] === "14") {
          cols2[7]  = calculateFreezeValue(cols2[7], freezeValue);
          cols2[9]  = calculateFreezeValue(cols2[9], freezeValue);
          cols2[10]  = calculateFreezeValue(cols2[10], freezeValue);
          cols2[11] = extractAndSubtract(cols2[11], freezeValue);
          cols2[12] = calculateFreezeValue(cols2[12], freezeValue);

          lines[j] = cols2.join("|");

          return {
            row14: cols2,
            updatedFile: lines.join("\n"),
          };
        }
      }
    }
  }
  throw new Error(`No se encontró userId: ${userIdArg}`);
}

function calculateFreezeValue(currentValue, freezeValue) {
  if (!currentValue) return currentValue;
  let value = Number(currentValue) - freezeValue;
  if (value < 0) value = 0;
  return String(value).padStart(currentValue.length, "0");
}

function extractAndSubtract(col11, freezeValue) {
  const regex = /\(3900\)(.*?)\(96\)/;
  const match = col11.match(regex);

  if (!match) return col11;

  let newValueNum = parseInt(match[1], 10) - freezeValue;
  if (newValueNum < 0) newValueNum = 0;

  const newValue = String(newValueNum).padStart(10, "0");
  return col11.replace(regex, `(3900)${newValue}(96)`);
}

module.exports = { processFile };

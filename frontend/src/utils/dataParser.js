/**
 * Safe parser for Python query results and SQL queries.
 * Strictly avoids eval() and new Function().
 */

/**
 * Safely parse Python tuple string output, e.g. "[(Decimal('123.45'), 'Category'), ...]"
 * Returns an array of rows, where each row is an array of values, or null if unparseable.
 */
export function parsePythonQueryResult(rawStr) {
  if (!rawStr || typeof rawStr !== 'string') return null;

  const str = rawStr.trim();

  // If it's an error message or empty
  if (str.startsWith('SQL execution failed:')) {
    return { error: str };
  }
  if (str === '[]' || str === '()') {
    return { rows: [], isEmpty: true };
  }
  if (!str.startsWith('[') || !str.endsWith(']')) {
    return null;
  }

  try {
    // Transform python-specific syntax into valid JSON where possible, safely
    let sanitized = str.slice(1, -1).trim();
    if (!sanitized) return { rows: [], isEmpty: true };

    const rows = [];
    let insideTuple = false;
    let currentTupleStr = '';
    let inQuote = false;
    let quoteChar = '';

    // Split tuples: ( ... ), ( ... )
    for (let i = 0; i < sanitized.length; i++) {
      const char = sanitized[i];

      if ((char === "'" || char === '"') && sanitized[i - 1] !== '\\') {
        if (!inQuote) {
          inQuote = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuote = false;
        }
      }

      if (!inQuote) {
        if (char === '(') {
          insideTuple = true;
          currentTupleStr = '';
          continue;
        } else if (char === ')') {
          insideTuple = false;
          const parsedRow = parseTupleItems(currentTupleStr);
          if (parsedRow !== null) {
            rows.push(parsedRow);
          }
          currentTupleStr = '';
          continue;
        }
      }

      if (insideTuple) {
        currentTupleStr += char;
      }
    }

    if (rows.length === 0) return null;
    return { rows, isEmpty: rows.length === 0 };
  } catch {
    return null;
  }
}

/**
 * Parse comma-separated items inside a tuple string, handling Decimal, datetime, None, etc.
 */
function parseTupleItems(tupleContent) {
  const items = [];
  let currentItem = '';
  let inQuote = false;
  let quoteChar = '';
  let parenDepth = 0;

  for (let i = 0; i < tupleContent.length; i++) {
    const char = tupleContent[i];

    if ((char === "'" || char === '"') && tupleContent[i - 1] !== '\\') {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
      }
    }

    if (!inQuote) {
      if (char === '(') parenDepth++;
      else if (char === ')') parenDepth--;
      else if (char === ',' && parenDepth === 0) {
        if (currentItem.trim().length > 0) {
          items.push(cleanValue(currentItem.trim()));
        }
        currentItem = '';
        continue;
      }
    }

    currentItem += char;
  }

  if (currentItem.trim().length > 0) {
    items.push(cleanValue(currentItem.trim()));
  }

  return items;
}

/**
 * Cleans individual serialized python token to primitive JS value
 */
function cleanValue(token) {
  if (!token) return null;

  // Decimal('123.45')
  const decimalMatch = token.match(/Decimal\(['"]?([0-9.-]+)['"]?\)/);
  if (decimalMatch) {
    const val = parseFloat(decimalMatch[1]);
    return isNaN(val) ? decimalMatch[1] : val;
  }

  // datetime.date(2026, 3, 15) or datetime.datetime(2026, 3, 15, 10, 30)
  const dateMatch = token.match(/datetime\.(date|datetime)\(([^)]+)\)/);
  if (dateMatch) {
    const parts = dateMatch[2].split(',').map((p) => p.trim());
    if (parts.length >= 3) {
      const year = parts[0];
      const month = String(parts[1]).padStart(2, '0');
      const day = String(parts[2]).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // None
  if (token === 'None') return null;

  // Booleans
  if (token === 'True') return true;
  if (token === 'False') return false;

  // Quoted strings: 'text' or "text"
  if (
    (token.startsWith("'") && token.endsWith("'")) ||
    (token.startsWith('"') && token.endsWith('"'))
  ) {
    return token.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
  }

  // Pure numbers
  if (!isNaN(token) && token !== '') {
    return Number(token);
  }

  return token;
}

/**
 * Extract column aliases or names from SQL SELECT query
 */
export function extractColumnNamesFromSql(sql) {
  if (!sql || typeof sql !== 'string') return [];

  try {
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    const selectMatch = cleanSql.match(/^SELECT\s+(DISTINCT\s+)?(.*?)\s+FROM\s+/i);
    if (!selectMatch) return [];

    const selectClause = selectMatch[2];
    const columns = [];
    let current = '';
    let parenDepth = 0;

    for (let i = 0; i < selectClause.length; i++) {
      const char = selectClause[i];
      if (char === '(') parenDepth++;
      else if (char === ')') parenDepth--;
      else if (char === ',' && parenDepth === 0) {
        columns.push(current.trim());
        current = '';
        continue;
      }
      current += char;
    }
    if (current.trim().length > 0) {
      columns.push(current.trim());
    }

    return columns.map((col, idx) => {
      // Check for AS alias (e.g. SUM(x) AS total_sales or SUM(x) total_sales)
      const asMatch = col.match(/\s+AS\s+[`"']?([a-zA-Z0-9_]+)[`"']?$/i);
      if (asMatch) return formatColumnHeader(asMatch[1]);

      // Direct column identifier or function
      const simpleCol = col.replace(/[`"']/g, '').trim();
      const lastWordMatch = simpleCol.match(/([a-zA-Z0-9_]+)$/);
      if (lastWordMatch && !simpleCol.includes('(')) {
        return formatColumnHeader(lastWordMatch[1]);
      }

      return formatColumnHeader(simpleCol) || `Column ${idx + 1}`;
    });
  } catch {
    return [];
  }
}

function formatColumnHeader(name) {
  if (!name) return '';
  return name
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Analyze parsed rows to determine if they can be reliably visualized in a chart.
 * Strictly verifies types so NO fake or misconfigured charts are produced.
 */
export function detectChartableData(rows, columnNames = []) {
  if (!Array.isArray(rows) || rows.length < 2) return null;

  const firstRow = rows[0];
  if (!Array.isArray(firstRow) || firstRow.length < 2) return null;

  // Look for 1 label/category column and at least 1 numeric value column
  let labelIndex = -1;
  const numericIndices = [];

  for (let colIdx = 0; colIdx < firstRow.length; colIdx++) {
    const val = firstRow[colIdx];
    const isNum = typeof val === 'number' && !isNaN(val);

    if (isNum) {
      // Check if all rows have numbers at this index
      const allNumbers = rows.every((r) => typeof r[colIdx] === 'number' && !isNaN(r[colIdx]));
      if (allNumbers) {
        numericIndices.push(colIdx);
      }
    } else if (labelIndex === -1 && (typeof val === 'string' || typeof val === 'number')) {
      labelIndex = colIdx;
    }
  }

  if (numericIndices.length === 0) return null;
  if (labelIndex === -1) {
    // If all are numbers, first can be x-axis label (e.g. Year/Month number)
    labelIndex = 0;
    numericIndices.splice(numericIndices.indexOf(0), 1);
    if (numericIndices.length === 0) return null;
  }

  const labelName = columnNames[labelIndex] || `Dimension`;
  const chartData = rows.map((row, rIdx) => {
    const item = {
      name: String(row[labelIndex] !== null && row[labelIndex] !== undefined ? row[labelIndex] : `#${rIdx + 1}`),
    };
    numericIndices.forEach((numIdx) => {
      const metricName = columnNames[numIdx] || `Metric ${numIdx}`;
      item[metricName] = Number(row[numIdx]) || 0;
    });
    return item;
  });

  const series = numericIndices.map((numIdx) => ({
    key: columnNames[numIdx] || `Metric ${numIdx}`,
    name: columnNames[numIdx] || `Metric ${numIdx}`,
  }));

  // Decide best chart type: if label resembles time (months/years/dates) -> line or bar, else bar
  const isTimeLike = chartData.some((d) =>
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4}|\d{4}-\d{2})/i.test(d.name)
  );

  return {
    data: chartData,
    series,
    labelKey: 'name',
    labelTitle: labelName,
    preferredType: isTimeLike ? 'line' : 'bar',
  };
}

/**
 * Extract reliable KPI cards from single-row numeric query results
 */
export function extractReliableKpis(rows, columnNames = [], intent = '') {
  if (!Array.isArray(rows) || rows.length !== 1) return [];

  const row = rows[0];
  if (!Array.isArray(row)) return [];

  const kpis = [];

  row.forEach((val, idx) => {
    if (typeof val === 'number' && !isNaN(val)) {
      const title = columnNames[idx] || (intent ? formatColumnHeader(intent) : `Metric ${idx + 1}`);
      kpis.push({
        title,
        value: val,
        formatted: formatNumber(val, title),
      });
    }
  });

  return kpis;
}

function formatNumber(num, label = '') {
  if (typeof num !== 'number' || isNaN(num)) return String(num);

  const isCurrency = /sales|revenue|profit|price|cost|amount/i.test(label);

  if (Math.abs(num) >= 1_000_000) {
    const formatted = (num / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    });
    return isCurrency ? `$${formatted}M` : `${formatted}M`;
  }

  if (Math.abs(num) >= 1_000) {
    const formatted = num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return isCurrency ? `$${formatted}` : formatted;
  }

  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return isCurrency ? `$${formatted}` : formatted;
}

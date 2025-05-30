export function fixJSONOption(input: string) {
  try {
    // First try to parse as-is
    const parsed = JSON.parse(input);
    return {
      type: 'fixed',
      original: input,
      fixed: JSON.stringify(parsed, null, 2),
      issues: [],
      success: true
    };
  } catch (error) {
    // If parsing fails, try to fix common issues
    const issues: string[] = [];
    let fixed = input.trim();

    // 1. Replace single quotes with double quotes (but preserve strings)
    if (fixed.includes("'")) {
      issues.push("Converted single quotes to double quotes");
      // More sophisticated replacement that handles nested quotes
      fixed = fixed.replace(/'/g, '"');

      // Handle escaped quotes properly
      fixed = fixed.replace(/\\"/g, "\\'");
      fixed = fixed.replace(/\\'/g, '"');
    }

    // 2. Fix unquoted property names
    const unquotedPropertyRegex = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g;
    if (unquotedPropertyRegex.test(fixed)) {
      issues.push("Added quotes around unquoted property names");
      fixed = fixed.replace(unquotedPropertyRegex, '$1"$2":');
    }

    // 3. Remove trailing commas
    if (fixed.includes(',}') || fixed.includes(',]')) {
      issues.push("Removed trailing commas");
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    }

    // // 4. Add missing commas between properties/elements
    // // This is more complex and requires careful regex
    // const missingCommaObjectRegex = /("\s*)\s*\n\s*([a-zA-Z_$"])/g;
    // const missingCommaArrayRegex = /([}\]"0-9])\s*\n\s*([{\["0-9])/g;

    // if (missingCommaObjectRegex.test(fixed) || missingCommaArrayRegex.test(fixed)) {
    //   issues.push("Added missing commas");
    //   // Add commas between object properties
    //   fixed = fixed.replace(/("\s*)\s*\n\s*("/g, '$1,\n  "');
    //   // Add commas between array elements
    //   fixed = fixed.replace(/([}\]"0-9])\s*\n\s*([{\["0-9])/g, '$1,\n  $2');
    // }

    // 5. Fix missing quotes around string values
    const unquotedStringRegex = /:\s*([a-zA-Z][a-zA-Z0-9\s]*[a-zA-Z0-9])\s*([,}\]])/g;
    if (unquotedStringRegex.test(fixed)) {
      issues.push("Added quotes around unquoted string values");
      fixed = fixed.replace(unquotedStringRegex, ': "$1"$2');
    }

    // 6. Fix boolean and null values (convert strings to proper values)
    const boolNullRegex = /"(true|false|null)"/g;
    if (boolNullRegex.test(fixed)) {
      issues.push("Converted string literals to proper boolean/null values");
      fixed = fixed.replace(/"(true|false|null)"/g, '$1');
    }

    // 7. Remove comments (// and /* */)
    if (fixed.includes('//') || fixed.includes('/*')) {
      issues.push("Removed comments");
      // Remove single-line comments
      fixed = fixed.replace(/\/\/.*$/gm, '');
      // Remove multi-line comments
      fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    // 8. Fix missing brackets/braces
    const openBraces = (fixed.match(/{/g) || []).length;
    const closeBraces = (fixed.match(/}/g) || []).length;
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/]/g) || []).length;

    if (openBraces > closeBraces) {
      issues.push("Added missing closing braces");
      fixed += '}';
    } else if (closeBraces > openBraces) {
      issues.push("Removed extra closing braces");
      fixed = fixed.replace(/}+$/, '}');
    }

    if (openBrackets > closeBrackets) {
      issues.push("Added missing closing brackets");
      fixed += ']';
    } else if (closeBrackets > openBrackets) {
      issues.push("Removed extra closing brackets");
      fixed = fixed.replace(/]+$/, ']');
    }

    // 9. Fix malformed numbers
    const malformedNumberRegex = /:\s*([0-9]+\.[0-9]*\.+[0-9]*)/g;
    if (malformedNumberRegex.test(fixed)) {
      issues.push("Fixed malformed numbers");
      fixed = fixed.replace(malformedNumberRegex, (match, number) => {
        const cleaned = number.replace(/\.+/g, '.');
        return `: ${cleaned}`;
      });
    }

    // 10. Wrap in braces if not an object or array
    if (!fixed.trim().startsWith('{') && !fixed.trim().startsWith('[')) {
      issues.push("Wrapped content in object braces");
      fixed = `{${fixed}}`;
    }

    // 11. Advanced comma fixing with better logic
    fixed = advancedCommaFix(fixed, issues);

    // 12. Clean up extra whitespace
    fixed = fixed.replace(/\s+/g, ' ').replace(/\s*([{}[\],:])\s*/g, '$1');

    // Try to parse the fixed JSON
    try {
      const parsed = JSON.parse(fixed);
      return {
        type: 'fixed',
        original: input,
        fixed: JSON.stringify(parsed, null, 2),
        issues: issues,
        success: true
      };
    } catch (finalError) {
      // If still can't parse, return detailed error
      return {
        type: 'failed',
        original: input,
        attempted: fixed,
        issues: issues,
        error: (finalError as Error).message,
        success: false
      };
    }
  }
}

// Advanced comma fixing function
function advancedCommaFix(input: string, issues: string[]): string {
  let fixed = input;
  let addedCommas = false;

  // Split into lines for more precise comma addition
  const lines = fixed.split('\n');
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';

    // Check if current line needs a comma
    if (line && nextLine) {
      // Current line ends with a value and next line starts with a property/value
      const needsComma = (
        // Object property followed by another property
        (line.match(/:\s*["}0-9\]true false null]$/) && nextLine.match(/^"/)) ||
        // Array element followed by another element
        (line.match(/["}0-9\]true false null]$/) && nextLine.match(/^["{0-9\[true false null]/)) ||
        // Closing brace/bracket followed by another element
        (line.match(/[}\]]$/) && nextLine.match(/^["{0-9\[true false null]/))
      );

      if (needsComma && !line.endsWith(',')) {
        line += ',';
        addedCommas = true;
      }
    }

    result.push(line);
  }

  if (addedCommas) {
    issues.push("Added missing commas between elements");
  }

  return result.join('\n');
}
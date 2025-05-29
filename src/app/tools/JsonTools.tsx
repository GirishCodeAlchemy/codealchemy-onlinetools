import jsonata from "jsonata";
// import React, { useState } from "react";
import React, { useRef, useImperativeHandle, useState, forwardRef } from "react";

import styles from '../../styles/jsonTools.module.css';

export function prettifyJSON(input: string) {
  try {
    return JSON.stringify(JSON.parse(input), null, 2);
  } catch {
    return 'Invalid JSON';
  }
}

export function flattenArray(input: string) {
  try {
    const arr = JSON.parse(input);
    if (!Array.isArray(arr)) return 'Input is not an array';
    return arr.flat(Infinity);
  } catch {
    return 'Invalid JSON array';
  }
}

export function diffOfTwoJSONs(input1: string, input2: string) {
  try {
    const json1 = JSON.parse(input1);
    const json2 = JSON.parse(input2);

    const differences = {
      summary: {
        totalDifferences: 0,
        onlyInFirst: 0,
        onlyInSecond: 0,
        valueChanged: 0,
        typeChanged: 0
      },
      details: {
        onlyInFirst: [] as any[],
        onlyInSecond: [] as any[],
        valueChanged: [] as any[],
        typeChanged: [] as any[]
      }
    };

    // Deep comparison function
    function compareObjects(obj1: any, obj2: any, path: string = '') {
      const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

      for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        const val1 = obj1?.[key];
        const val2 = obj2?.[key];

        if (!(key in obj1)) {
          // Key only exists in second object
          differences.details.onlyInSecond.push({
            path: currentPath,
            value: val2,
            type: typeof val2
          });
          differences.summary.onlyInSecond++;
          differences.summary.totalDifferences++;
        } else if (!(key in obj2)) {
          // Key only exists in first object
          differences.details.onlyInFirst.push({
            path: currentPath,
            value: val1,
            type: typeof val1
          });
          differences.summary.onlyInFirst++;
          differences.summary.totalDifferences++;
        } else if (typeof val1 !== typeof val2) {
          // Type mismatch
          differences.details.typeChanged.push({
            path: currentPath,
            firstValue: val1,
            firstType: typeof val1,
            secondValue: val2,
            secondType: typeof val2
          });
          differences.summary.typeChanged++;
          differences.summary.totalDifferences++;
        } else if (typeof val1 === 'object' && val1 !== null && val2 !== null) {
          // Recursively compare nested objects
          if (Array.isArray(val1) && Array.isArray(val2)) {
            compareArrays(val1, val2, currentPath);
          } else if (!Array.isArray(val1) && !Array.isArray(val2)) {
            compareObjects(val1, val2, currentPath);
          } else {
            // One is array, one is object
            differences.details.typeChanged.push({
              path: currentPath,
              firstValue: val1,
              firstType: Array.isArray(val1) ? 'array' : 'object',
              secondValue: val2,
              secondType: Array.isArray(val2) ? 'array' : 'object'
            });
            differences.summary.typeChanged++;
            differences.summary.totalDifferences++;
          }
        } else if (val1 !== val2) {
          // Value mismatch
          differences.details.valueChanged.push({
            path: currentPath,
            firstValue: val1,
            secondValue: val2,
            type: typeof val1
          });
          differences.summary.valueChanged++;
          differences.summary.totalDifferences++;
        }
      }
    }

    function compareArrays(arr1: any[], arr2: any[], path: string) {
      const maxLength = Math.max(arr1.length, arr2.length);

      for (let i = 0; i < maxLength; i++) {
        const currentPath = `${path}[${i}]`;
        const val1 = arr1[i];
        const val2 = arr2[i];

        if (i >= arr1.length) {
          // Element only exists in second array
          differences.details.onlyInSecond.push({
            path: currentPath,
            value: val2,
            type: typeof val2
          });
          differences.summary.onlyInSecond++;
          differences.summary.totalDifferences++;
        } else if (i >= arr2.length) {
          // Element only exists in first array
          differences.details.onlyInFirst.push({
            path: currentPath,
            value: val1,
            type: typeof val1
          });
          differences.summary.onlyInFirst++;
          differences.summary.totalDifferences++;
        } else if (typeof val1 !== typeof val2) {
          // Type mismatch
          differences.details.typeChanged.push({
            path: currentPath,
            firstValue: val1,
            firstType: typeof val1,
            secondValue: val2,
            secondType: typeof val2
          });
          differences.summary.typeChanged++;
          differences.summary.totalDifferences++;
        } else if (typeof val1 === 'object' && val1 !== null && val2 !== null) {
          // Recursively compare nested objects/arrays
          if (Array.isArray(val1) && Array.isArray(val2)) {
            compareArrays(val1, val2, currentPath);
          } else if (!Array.isArray(val1) && !Array.isArray(val2)) {
            compareObjects(val1, val2, currentPath);
          } else {
            differences.details.typeChanged.push({
              path: currentPath,
              firstValue: val1,
              firstType: Array.isArray(val1) ? 'array' : 'object',
              secondValue: val2,
              secondType: Array.isArray(val2) ? 'array' : 'object'
            });
            differences.summary.typeChanged++;
            differences.summary.totalDifferences++;
          }
        } else if (val1 !== val2) {
          // Value mismatch
          differences.details.valueChanged.push({
            path: currentPath,
            firstValue: val1,
            secondValue: val2,
            type: typeof val1
          });
          differences.summary.valueChanged++;
          differences.summary.totalDifferences++;
        }
      }
    }

    compareObjects(json1, json2);
    return differences;

  } catch (error) {
    return { error: 'Invalid JSON input' };
  }
}

// Enhanced JsonToolOutput component for better diff visualization
export function JsonToolOutput({ outputData }: { outputData: any }) {
  // Handle JSON diff output with special formatting
  if (outputData && typeof outputData === 'object' && outputData.summary && outputData.details) {
    return (
      <div className="space-y-4">
        {/* Summary Section */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Comparison Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-gray-600 text-sm">Total Differences</div>
              <div className="font-bold text-2xl text-blue-600">{outputData.summary.totalDifferences}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-gray-600 text-sm">Only in First</div>
              <div className="font-bold text-2xl text-red-600">{outputData.summary.onlyInFirst}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-gray-600 text-sm">Only in Second</div>
              <div className="font-bold text-2xl text-green-600">{outputData.summary.onlyInSecond}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="text-gray-600 text-sm">Value Changes</div>
              <div className="font-bold text-2xl text-orange-600">{outputData.summary.valueChanged}</div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        {outputData.summary.totalDifferences === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-green-700 font-semibold">✅ No differences found!</div>
            <div className="text-green-600 text-sm">Both JSON objects are identical</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Only in First JSON */}
            {outputData.details.onlyInFirst.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-700 mb-2">🔴 Only in First JSON ({outputData.details.onlyInFirst.length})</h4>
                <div className="space-y-2">
                  {outputData.details.onlyInFirst.map((item: any, index: number) => (
                    <div key={index} className="bg-white p-2 rounded border text-sm">
                      <div className="font-mono text-red-600">{item.path}</div>
                      <div className="text-gray-600">Value: <span className="font-mono">{JSON.stringify(item.value)}</span></div>
                      <div className="text-gray-500 text-xs">Type: {item.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Only in Second JSON */}
            {outputData.details.onlyInSecond.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-700 mb-2">🟢 Only in Second JSON ({outputData.details.onlyInSecond.length})</h4>
                <div className="space-y-2">
                  {outputData.details.onlyInSecond.map((item: any, index: number) => (
                    <div key={index} className="bg-white p-2 rounded border text-sm">
                      <div className="font-mono text-green-600">{item.path}</div>
                      <div className="text-gray-600">Value: <span className="font-mono">{JSON.stringify(item.value)}</span></div>
                      <div className="text-gray-500 text-xs">Type: {item.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Value Changed */}
            {outputData.details.valueChanged.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-700 mb-2">🟡 Value Changes ({outputData.details.valueChanged.length})</h4>
                <div className="space-y-2">
                  {outputData.details.valueChanged.map((item: any, index: number) => (
                    <div key={index} className="bg-white p-2 rounded border text-sm">
                      <div className="font-mono text-orange-600">{item.path}</div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <div className="text-red-600 text-xs">First:</div>
                          <div className="font-mono text-sm">{JSON.stringify(item.firstValue)}</div>
                        </div>
                        <div>
                          <div className="text-green-600 text-xs">Second:</div>
                          <div className="font-mono text-sm">{JSON.stringify(item.secondValue)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Type Changed */}
            {outputData.details.typeChanged.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-700 mb-2">🟣 Type Changes ({outputData.details.typeChanged.length})</h4>
                <div className="space-y-2">
                  {outputData.details.typeChanged.map((item: any, index: number) => (
                    <div key={index} className="bg-white p-2 rounded border text-sm">
                      <div className="font-mono text-purple-600">{item.path}</div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <div className="text-red-600 text-xs">First ({item.firstType}):</div>
                          <div className="font-mono text-sm">{JSON.stringify(item.firstValue)}</div>
                        </div>
                        <div>
                          <div className="text-green-600 text-xs">Second ({item.secondType}):</div>
                          <div className="font-mono text-sm">{JSON.stringify(item.secondValue)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Handle error output
  if (outputData && typeof outputData === 'object' && outputData.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-red-700 font-semibold">❌ Error</div>
        <div className="text-red-600 text-sm">{outputData.error}</div>
      </div>
    );
  }

  // Default output for other JSON tools
  if (typeof outputData === 'object') {
    return <pre className={styles.output}>{JSON.stringify(outputData, null, 2)}</pre>;
  }
  return <pre className={styles.output}>{outputData}</pre>;
}

export function stringifyJSON(input: string) {
  try {
    const obj = JSON.parse(input);
    return JSON.stringify(obj);
  } catch {
    return 'Invalid JSON input';
  }
}

export function fixJSON(input: string) {
  try {
    return JSON.stringify(JSON.parse(input), null, 2);
  } catch {
    return 'Invalid JSON input. Please check your input.';
  }
}


async function runjsonata(expr: any, jsonInput: any) {
  const result = await expr.evaluate(jsonInput);
  console.log('Raw JSONata result:', result);
  return result
}

export const JsonataTool = forwardRef((props, ref) => {
  const [jsonInput, setJsonInput] = useState('');
  const [jsonataExpr, setJsonataExpr] = useState('');
  const [jsonataResult, setJsonataResult] = useState('');
  const [error, setError] = useState('');

  // Expose run method to parent via ref
  useImperativeHandle(ref, () => ({
    run: async() => {
      setError('');
      try {
        const json = JSON.parse(jsonInput);
        const expr = jsonata(jsonataExpr);
        console.log(expr)
        // const result = expr.evaluate(json);
        // console.log('Raw JSONata result:', result);
        const result = await runjsonata(expr, json);

        // Handle null/undefined/empty string
        if (result === undefined) {
          setJsonataResult('');
          console.log('Result is undefined');
        } else if (result === null) {
          setJsonataResult('null');
          console.log('Result is null');
        } else if (typeof result === 'object') {
          const pretty = JSON.stringify(result, null, 2);
          setJsonataResult(pretty);
          console.log('Result is object:', pretty);
        } else {
          setJsonataResult(String(result));
          console.log('Result is primitive:', String(result));
        }
      } catch (e: any) {
        setJsonataResult('');
        setError(e.message || 'Invalid JSON or JSONata expression');
      }
    }
  }));

  return (
    <div className="flex h-[70vh] gap-4">
      {/* JSON Input */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700">JSON</span>
        </div>
        <textarea
          className="flex-1 w-full p-2 border rounded font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Paste your JSON here..."
          value={jsonInput}
          onChange={e => setJsonInput(e.target.value)}
          style={{ minHeight: 400, resize: "vertical" }}
        />
      </div>
      {/* JSONata Expression & Result */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700">JSONata</span>
          <select className="border rounded px-2 py-1 text-xs bg-white ml-2" disabled>
            <option>2.0.6</option>
          </select>
        </div>
        <textarea
          className="w-full p-2 border rounded font-mono text-sm mb-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter JSONata expression (e.g. $sum(Account.Order.Product.(Price * Quantity)))"
          value={jsonataExpr}
          onChange={e => setJsonataExpr(e.target.value)}
          style={{ minHeight: 80, resize: "vertical" }}
          rows={4}
        />
        <div className="flex-1 bg-gray-100 rounded p-2 overflow-auto font-mono text-sm mt-2">
          {error ? (
            <span className="text-red-600">{error}</span>
          ) : (
            <pre className="whitespace-pre-wrap">
              {(() => {
                if (jsonataResult === '' || jsonataResult === undefined || jsonataResult === null) {
                  return <span className="text-gray-400">Result will appear here</span>;
                }
                // Try to pretty print JSON, otherwise show as string
                try {

                  const parsed = JSON.parse(jsonataResult);
                  if (typeof parsed === 'object' && parsed !== null) {
                    return JSON.stringify(parsed, null, 2);
                  }
                  return String(parsed);
                } catch {
                  return String(jsonataResult);
                }
              })()}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
});

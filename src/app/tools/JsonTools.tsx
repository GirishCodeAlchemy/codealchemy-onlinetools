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
      },
      originalData: {
        json1,
        json2
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
  const [currentMismatchIndex, setCurrentMismatchIndex] = React.useState(0);
  const [highlightedPath, setHighlightedPath] = React.useState<string>('');
  const [showDetails, setShowDetails] = React.useState(false); // New state for toggling

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Get all mismatches in order
  const getAllMismatches = (differences: any) => {
    const allMismatches: Array<{path: string, type: string, details: any}> = [];

    differences.details.onlyInFirst.forEach((item: any) => {
      allMismatches.push({ path: item.path, type: 'onlyInFirst', details: item });
    });

    differences.details.onlyInSecond.forEach((item: any) => {
      allMismatches.push({ path: item.path, type: 'onlyInSecond', details: item });
    });

    differences.details.valueChanged.forEach((item: any) => {
      allMismatches.push({ path: item.path, type: 'valueChanged', details: item });
    });

    differences.details.typeChanged.forEach((item: any) => {
      allMismatches.push({ path: item.path, type: 'typeChanged', details: item });
    });

    // Sort by path for consistent navigation
    return allMismatches.sort((a, b) => a.path.localeCompare(b.path));
  };

  // Helper function to create inline diff view
  const createInlineDiff = (obj1: any, obj2: any, differences: any) => {
    const createDiffObject = (original: any, isFirst: boolean = true, currentPath: string = '') => {
      if (typeof original !== 'object' || original === null) {
        return original;
      }

      const result: any = Array.isArray(original) ? [] : {};
      const relevantDiffs = differences.details;

      if (Array.isArray(original)) {
        original.forEach((item: any, index: number) => {
          const path = currentPath ? `${currentPath}[${index}]` : `[${index}]`;

          // Check for exact path matches
          const hasOnlyInFirst = relevantDiffs.onlyInFirst.some((diff: any) => diff.path === path);
          const hasOnlyInSecond = relevantDiffs.onlyInSecond.some((diff: any) => diff.path === path);
          const hasValueChanged = relevantDiffs.valueChanged.some((diff: any) => diff.path === path);
          const hasTypeChanged = relevantDiffs.typeChanged.some((diff: any) => diff.path === path);

          if (isFirst && hasOnlyInFirst) {
            result[index] = { __diff: 'removed', __value: item, __path: path };
          } else if (!isFirst && hasOnlyInSecond) {
            result[index] = { __diff: 'added', __value: item, __path: path };
          } else if (hasValueChanged || hasTypeChanged) {
            result[index] = { __diff: 'modified', __value: item, __path: path };
          } else if (typeof item === 'object' && item !== null) {
            result[index] = createDiffObject(item, isFirst, path);
          } else {
            result[index] = item;
          }
        });
      } else {
        Object.keys(original).forEach(key => {
          const path = currentPath ? `${currentPath}.${key}` : key;

          // Check for exact path matches
          const hasOnlyInFirst = relevantDiffs.onlyInFirst.some((diff: any) => diff.path === path);
          const hasOnlyInSecond = relevantDiffs.onlyInSecond.some((diff: any) => diff.path === path);
          const hasValueChanged = relevantDiffs.valueChanged.some((diff: any) => diff.path === path);
          const hasTypeChanged = relevantDiffs.typeChanged.some((diff: any) => diff.path === path);

          if (isFirst && hasOnlyInFirst) {
            result[key] = { __diff: 'removed', __value: original[key], __path: path };
          } else if (!isFirst && hasOnlyInSecond) {
            result[key] = { __diff: 'added', __value: original[key], __path: path };
          } else if (hasValueChanged || hasTypeChanged) {
            result[key] = { __diff: 'modified', __value: original[key], __path: path };
          } else if (typeof original[key] === 'object' && original[key] !== null) {
            result[key] = createDiffObject(original[key], isFirst, path);
          } else {
            result[key] = original[key];
          }
        });
      }

      return result;
    };

    return {
      first: createDiffObject(obj1, true),
      second: createDiffObject(obj2, false)
    };
  };

  // Helper function to render JSON with diff highlighting
  const renderDiffJSON = (obj: any, title: string, colorClass: string, allMismatches: any[]) => {
    const renderValue = (value: any, depth: number = 0): any => {
      const indent = '  '.repeat(depth);

      if (value && typeof value === 'object' && value.__diff && value.__path) {
        // Exact path matching for highlighting
        const isHighlighted = highlightedPath === value.__path;

        const diffClass =
          value.__diff === 'removed' ? 'bg-red-100 text-red-800 line-through' :
          value.__diff === 'added' ? 'bg-green-100 text-green-800' :
          'bg-yellow-100 text-yellow-800';

        const highlightClass = isHighlighted ? 'ring-2 ring-blue-500 shadow-lg animate-pulse' : '';

        return (
          <span
            className={`${diffClass} ${highlightClass} px-1 rounded transition-all duration-300`}
            id={`diff-${value.__path}`}
          >
            {JSON.stringify(value.__value)}
          </span>
        );
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        return (
          <span>
            [<br />
            {value.map((item, index) => (
              <span key={index}>
                {indent}  {renderValue(item, depth + 1)}
                {index < value.length - 1 ? ',' : ''}<br />
              </span>
            ))}
            {indent}]
          </span>
        );
      }

      if (typeof value === 'object' && value !== null) {
        const keys = Object.keys(value);
        if (keys.length === 0) return '{}';
        return (
          <span>
            {`{`}<br />
            {keys.map((key, index) => (
              <span key={key}>
                {indent}  "{key}": {renderValue(value[key], depth + 1)}
                {index < keys.length - 1 ? ',' : ''}<br />
              </span>
            ))}
            {indent}{`}`}
          </span>
        );
      }

      return JSON.stringify(value);
    };

    return (
      <div className={`${colorClass} border rounded-lg p-4`}>
        <h5 className="font-semibold mb-2">{title}</h5>
        <pre className="font-mono text-sm whitespace-pre-wrap overflow-auto bg-white p-3 rounded border min-h-96 max-h-[600px]">
          {renderValue(obj)}
        </pre>
      </div>
    );
  };

  // Navigation functions
  const navigateToMismatch = (direction: 'next' | 'prev', allMismatches: any[]) => {
    if (allMismatches.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = currentMismatchIndex >= allMismatches.length - 1 ? 0 : currentMismatchIndex + 1;
    } else {
      newIndex = currentMismatchIndex <= 0 ? allMismatches.length - 1 : currentMismatchIndex - 1;
    }

    setCurrentMismatchIndex(newIndex);
    setHighlightedPath(allMismatches[newIndex].path);

    // Debug logging
    console.log('Navigating to:', {
      index: newIndex,
      path: allMismatches[newIndex].path,
      type: allMismatches[newIndex].type
    });

    // Scroll to highlighted element with a longer delay
    setTimeout(() => {
      const element = document.getElementById(`diff-${allMismatches[newIndex].path}`);
      console.log('Found element:', element);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary flash effect
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'pulse 1s ease-in-out 2';
      }
    }, 200);
  };

  // Handle JSON diff output with special formatting
  if (outputData && typeof outputData === 'object' && outputData.summary && outputData.details) {
    const allMismatches = getAllMismatches(outputData);

    // Initialize highlighted path
    React.useEffect(() => {
      if (allMismatches.length > 0 && !highlightedPath) {
        setHighlightedPath(allMismatches[0].path);
      }
    }, [allMismatches.length, highlightedPath]);

    let inlineDiff = null;
    try {
      const originalData = outputData.originalData;
      if (originalData) {
        inlineDiff = createInlineDiff(originalData.json1, originalData.json2, outputData);
      }
    } catch (e) {
      console.log('Could not create inline diff');
    }

    return (
      <div className="space-y-4">
        {/* Summary Section */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">📊 Comparison Summary</h3>
            {/* Toggle Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                showDetails
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {showDetails ? '🙈 Hide Details' : '🔍 Show Details'}
            </button>
          </div>
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

        {/* Conditional Rendering based on showDetails */}
        {!showDetails ? (
          <>
            {/* Navigation Controls - Only show when details are hidden */}
            {allMismatches.length > 0 && (
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-800">🧭 Navigate Differences</h3>
                    <div className="text-sm text-gray-600">
                      {currentMismatchIndex + 1} of {allMismatches.length}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateToMismatch('prev', allMismatches)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                      disabled={allMismatches.length === 0}
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => navigateToMismatch('next', allMismatches)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                      disabled={allMismatches.length === 0}
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Current Mismatch Info */}
                {allMismatches[currentMismatchIndex] && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="font-mono text-sm text-blue-800">
                      <strong>Path:</strong> {allMismatches[currentMismatchIndex].path}
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      <strong>Type:</strong> {
                        allMismatches[currentMismatchIndex].type === 'onlyInFirst' ? 'Only in First JSON' :
                        allMismatches[currentMismatchIndex].type === 'onlyInSecond' ? 'Only in Second JSON' :
                        allMismatches[currentMismatchIndex].type === 'valueChanged' ? 'Value Changed' :
                        'Type Changed'
                      }
                    </div>
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 mt-1">
                      <strong>Debug:</strong> Highlighted Path: "{highlightedPath}"
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Inline Diff Section - Only show when details are hidden */}
            {inlineDiff && (
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">👁️ Side-by-Side Diff View</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
                  {renderDiffJSON(inlineDiff.first, "📄 First JSON", "bg-red-50 border-red-200", allMismatches)}
                  {renderDiffJSON(inlineDiff.second, "📄 Second JSON", "bg-green-50 border-green-200", allMismatches)}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex flex-wrap gap-4">
                    <span className="flex items-center">
                      <span className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></span>
                      <span className="line-through">Removed (only in first)</span>
                    </span>
                    <span className="flex items-center">
                      <span className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></span>
                      Added (only in second)
                    </span>
                    <span className="flex items-center">
                      <span className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></span>
                      Modified (value/type changed)
                    </span>
                    <span className="flex items-center">
                      <span className="w-4 h-4 bg-blue-500 border border-blue-600 rounded mr-2"></span>
                      Currently highlighted
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Details Section - Only show when showDetails is true */
          outputData.summary.totalDifferences === 0 ? (
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
                      <div
                        key={index}
                        className="bg-white p-2 rounded border text-sm"
                      >
                        <div className="font-mono text-red-600">{item.path}</div>
                        <div className="text-gray-600">Value: <span className="font-mono bg-red-100 px-1 rounded text-red-800">{JSON.stringify(item.value)}</span></div>
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
                      <div
                        key={index}
                        className="bg-white p-2 rounded border text-sm"
                      >
                        <div className="font-mono text-green-600">{item.path}</div>
                        <div className="text-gray-600">Value: <span className="font-mono bg-green-100 px-1 rounded text-green-800">{JSON.stringify(item.value)}</span></div>
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
                      <div
                        key={index}
                        className="bg-white p-2 rounded border text-sm"
                      >
                        <div className="font-mono text-orange-600">{item.path}</div>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <div className="text-red-600 text-xs">First:</div>
                            <div className="font-mono text-sm bg-red-100 px-1 rounded text-red-800">{JSON.stringify(item.firstValue)}</div>
                          </div>
                          <div>
                            <div className="text-green-600 text-xs">Second:</div>
                            <div className="font-mono text-sm bg-green-100 px-1 rounded text-green-800">{JSON.stringify(item.secondValue)}</div>
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
                      <div
                        key={index}
                        className="bg-white p-2 rounded border text-sm"
                      >
                        <div className="font-mono text-purple-600">{item.path}</div>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <div className="text-red-600 text-xs">First ({item.firstType}):</div>
                            <div className="font-mono text-sm bg-red-100 px-1 rounded text-red-800">{JSON.stringify(item.firstValue)}</div>
                          </div>
                          <div>
                            <div className="text-green-600 text-xs">Second ({item.secondType}):</div>
                            <div className="font-mono text-sm bg-green-100 px-1 rounded text-green-800">{JSON.stringify(item.secondValue)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
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

  if (outputData && typeof outputData === 'object' && outputData.type === 'stringified') {
    return (
      <div className="space-y-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📄 Stringified JSON</h3>

          {/* Summary Info */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="text-blue-800 text-sm">
              <strong>Length:</strong> {outputData.length} characters
            </div>
            <div className="text-blue-700 text-xs mt-1">
              JSON has been converted to a single-line string format
            </div>
          </div>

          {/* Preview */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">📋 Preview (first 100 characters):</h4>
            <div className="bg-gray-50 p-3 rounded border">
              <code className="text-sm text-gray-800 break-all">
                {outputData.preview}
              </code>
            </div>
          </div>

          {/* Full Content - Scrollable */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-700">📜 Full Stringified JSON:</h4>
              <button
                onClick={() => copyToClipboard(outputData.content)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                📋 Copy to Clipboard
              </button>
            </div>

            {/* Scrollable container with word-break */}
            <div className="bg-white border rounded p-3 max-h-96 overflow-auto">
              <pre className="font-mono text-sm whitespace-pre-wrap break-all text-gray-800">
                {outputData.content}
              </pre>
            </div>
          </div>

          {/* Usage Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <h5 className="font-semibold text-yellow-800 mb-1">💡 Usage Tips:</h5>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• This format is ideal for API requests or data transmission</li>
              <li>• Use the copy button to get the full stringified version</li>
              <li>• The string is properly escaped and ready to use in code</li>
            </ul>
          </div>
        </div>
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
    // Return the stringified JSON with proper formatting info
    const stringified = JSON.stringify(obj);
    return {
      type: 'stringified',
      content: stringified,
      length: stringified.length,
      preview: stringified.length > 100 ? stringified.substring(0, 100) + '...' : stringified
    };
  } catch {
    return { error: 'Invalid JSON input' };
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

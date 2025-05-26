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
    const diff = Object.keys(json1).filter(key => json1[key] !== json2[key]);
    return diff;
  } catch {
    return 'Invalid JSON input';
  }
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

export function JsonToolOutput({ outputData }: { outputData: any }) {
  if (typeof outputData === 'object') {
    return <pre className={styles.output}>{JSON.stringify(outputData, null, 2)}</pre>;
  }
  return <pre className={styles.output}>{outputData}</pre>;
}

// export function JsonataTool() {
//   const [jsonInput, setJsonInput] = useState<string>('');
//   const [jsonataExpr, setJsonataExpr] = useState<string>('');
//   const [jsonataResult, setJsonataResult] = useState<string>('');
//   const [error, setError] = useState<string>('');

//   const handleJsonataEvaluate = () => {
//     setError('');
//     try {
//       const json = JSON.parse(jsonInput);
//       const expr = jsonata(jsonataExpr);
//       const result = expr.evaluate(json);
//       setJsonataResult(JSON.stringify(result, null, 2));
//     } catch (e: any) {
//       setJsonataResult('');
//       setError(e.message || 'Invalid JSON or JSONata expression');
//     }
//   };

//   return (
//     <div className="flex h-[70vh] gap-4">
//       {/* JSON Input */}
//       <div className="flex-1 flex flex-col">
//         <div className="flex items-center justify-between mb-2">
//           <span className="font-semibold text-gray-700">JSON</span>
//         </div>
//         <textarea
//           className="flex-1 w-full p-2 border rounded font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           placeholder="Paste your JSON here..."
//           value={jsonInput}
//           onChange={e => setJsonInput(e.target.value)}
//           style={{ minHeight: 200, resize: "vertical" }}
//         />
//       </div>
//       {/* JSONata Expression & Result */}
//       <div className="flex-1 flex flex-col">
//         <div className="flex items-center justify-between mb-2">
//           <span className="font-semibold text-gray-700">JSONata</span>
//           <select className="border rounded px-2 py-1 text-xs bg-white ml-2" disabled>
//             <option>2.0.6</option>
//           </select>
//         </div>
//         <input
//           className="w-full p-2 border rounded font-mono text-sm mb-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           placeholder="Enter JSONata expression (e.g. $sum(Account.Order.Product.(Price * Quantity)))"
//           value={jsonataExpr}
//           onChange={e => setJsonataExpr(e.target.value)}
//           onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleJsonataEvaluate(); }}
//         />
//         <button
//           className="mb-2 self-end bg-blue-600 text-white px-4 py-1 rounded shadow hover:bg-blue-700 transition"
//           onClick={handleJsonataEvaluate}
//         >
//           Evaluate
//         </button>
//         <div className="flex-1 bg-gray-100 rounded p-2 overflow-auto font-mono text-sm">
//           {error ? (
//             <span className="text-red-600">{error}</span>
//           ) : (
//             <pre className="whitespace-pre-wrap">{jsonataResult}</pre>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

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
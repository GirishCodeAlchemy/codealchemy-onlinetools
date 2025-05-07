"use client";

import React, { useState } from 'react';
import './JsonTools.css';

const JsonTools = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputData, setInputData] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);

  const handleAction = () => {
    if (!selectedOption) return;

    try {
      const parsedInput = JSON.parse(inputData);

      switch (selectedOption) {
        case 'Prettify JSON': {
          setResult(`Prettified JSON: ${JSON.stringify(parsedInput, null, 2)}`);
          break;
        }
        case 'Flatten array': {
          const flattened = parsedInput.flat(Infinity);
          setResult(`Flattened Array: ${flattened.join(', ')}`);
          break;
        }
        case 'Diff of two JSONs': {
          const [json1, json2] = parsedInput;
          const diff = Object.keys(json1).filter((key) => json1[key] !== json2[key]);
          setResult(`JSON Diff: ${diff.join(', ')}`);
          break;
        }
        case 'Stringify': {
          setResult(`Stringified: ${JSON.stringify(parsedInput)}`);
          break;
        }
        case 'Fix the JSON': {
          const fixedJson = JSON.parse(JSON.stringify(parsedInput));
          setResult(`Fixed JSON: ${JSON.stringify(fixedJson)}`);
          break;
        }
        default:
          setResult('No action defined for this option.');
      }
    } catch (error) {
      setResult('Invalid input format. Please provide valid JSON.');
    }
  };

  return (
    <div className="json-tools">
      <h2 className="text-xl font-bold mb-2">JSON Tools</h2>
      <ul className="list-disc pl-6">
        {['Prettify JSON', 'Flatten array', 'Diff of two JSONs', 'Stringify', 'Fix the JSON'].map((option) => (
          <li
            key={option}
            className="mb-1 cursor-pointer hover:underline"
            onClick={() => {
              setSelectedOption(option);
              setResult(null);
              setInputData('');
            }}
          >
            {option}
          </li>
        ))}
      </ul>

      {selectedOption && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Selected Option: {selectedOption}</h3>
          <textarea
            className="w-full p-2 border rounded mb-4"
            rows={4}
            placeholder="Enter input as JSON"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleAction}
          >
            Perform Action
          </button>
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded border border-gray-300">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};

export default JsonTools;
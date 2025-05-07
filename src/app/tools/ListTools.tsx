"use client";

import React, { useState } from 'react';
import './ListTools.css';

const ListTools = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputData, setInputData] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);

  const handleAction = () => {
    if (!selectedOption) return;

    try {
      const parsedInput = JSON.parse(inputData);

      switch (selectedOption) {
        case 'Unique list': {
          const uniqueList = Array.from(new Set(parsedInput));
          setResult(`Unique List: ${uniqueList.join(', ')}`);
          break;
        }
        case 'Diff of two lists': {
          const [list1, list2] = parsedInput;
          const diff = list1.filter((item: any) => !list2.includes(item));
          setResult(`Difference: ${diff.join(', ')}`);
          break;
        }
        case 'Intersection of two lists': {
          const [list1, list2] = parsedInput;
          const intersection = list1.filter((item: any) => list2.includes(item));
          setResult(`Intersection: ${intersection.join(', ')}`);
          break;
        }
        case 'Find duplicate items': {
          const duplicates = parsedInput.filter((item: any, index: number) => parsedInput.indexOf(item) !== index);
          setResult(`Duplicates: ${Array.from(new Set(duplicates)).join(', ')}`);
          break;
        }
        case 'Sort a list': {
          const sortedList = parsedInput.sort((a: any, b: any) => a - b);
          setResult(`Sorted List: ${sortedList.join(', ')}`);
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
    <div className="list-tools">
      <h2 className="text-xl font-bold mb-2">List Tools</h2>
      <ul className="list-disc pl-6">
        {['Unique list', 'Diff of two lists', 'Intersection of two lists', 'Find duplicate items', 'Sort a list'].map((option) => (
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

export default ListTools;
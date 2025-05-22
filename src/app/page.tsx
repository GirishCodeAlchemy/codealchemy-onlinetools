"use client";

import React, { useState } from 'react';
import './globals.css';
import { convertMillisecondsToHumanReadable, TimeToolOutput, LiveCurrentTimePanel } from './tools/timeTools';

const tools = [
  { category: 'List Tools', options: ['Unique list', 'Diff of two lists', 'Intersection of two lists', 'Find duplicate items', 'Sort a list'] },
  { category: 'JSON Tools', options: ['Prettify JSON', 'Flatten array', 'Diff of two JSONs', 'Stringify', 'Fix the JSON'] },
  { category: 'Time Tools', options: ['Milliseconds to Date/Time'] },
];

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputData1, setInputData1] = useState<string>('');
  const [inputData2, setInputData2] = useState<string>('');
  const [outputData, setOutputData] = useState<any>('');
  const [extraOption, setExtraOption] = useState<string>('');

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    maxWidth: '100%', // Prevent horizontal expansion
    overflow: 'hidden', // Hide overflow to maintain layout
  };

  const textareaStyle = {
    whiteSpace: 'pre-wrap', // Enable word wrapping
    wordWrap: 'break-word', // Break long words
    overflowWrap: 'break-word', // Ensure long words wrap properly
    height: '400px', // Maintain consistent height
    width: '100%', // Ensure it doesn't expand horizontally
    maxWidth: '100%', // Restrict maximum width to prevent horizontal growth
    resize: 'none', // Disable resizing to prevent horizontal expansion
    overflow: 'auto', // Add scrollbars if content overflows
    display: 'block', // Ensure block-level rendering
    boxSizing: 'border-box', // Include padding and border in width/height calculations
    wordBreak: 'break-word', // Break long words to prevent overflow
  };

  // Fixed the calculateCount function to handle non-string data gracefully.
  const calculateCount = (data: any): number => {
    try {
      if (typeof data === 'string') {
        const parsedData = JSON.parse(data);
        if (Array.isArray(parsedData)) {
          return parsedData.length; // Count items in the list if input is a JSON array
        }
      } else if (Array.isArray(data)) {
        return data.length; // Directly return the length if data is already an array
      }
    } catch {
      // If not JSON or array, count non-empty lines if it's a string
      if (typeof data === 'string') {
        return data.split('\n').filter((line) => line.trim() !== '').length;
      }
    }
    return 0;
  };

  const handleAction = React.useCallback(() => {
    try {
      if (selectedOption === 'Milliseconds to Date/Time') {
        setOutputData(convertMillisecondsToHumanReadable(inputData1));
      } else if (selectedOption === 'Unique list') {
        const items = inputData1.split('\n').map((item) => item.trim()).filter(Boolean);
        const uniqueItems = Array.from(new Set(items));
        if (extraOption === 'Convert to list') {
          setOutputData(JSON.stringify(uniqueItems, null, 2));
        } else if (extraOption === 'Convert as line by line') {
          setOutputData(uniqueItems.join('\n'));
        } else {
          setOutputData(JSON.stringify(uniqueItems, null, 2));
        }
      } else if (selectedOption === 'Diff of two lists') {
        const list1 = inputData1.split('\n').map((item) => item.trim()).filter(Boolean);
        const list2 = inputData2.split('\n').map((item) => item.trim()).filter(Boolean);
        const diff1 = list1.filter((item) => !list2.includes(item));
        const diff2 = list2.filter((item) => !list1.includes(item));
        const result = { diff1, diff2 };
        if (extraOption === 'Convert to list') {
          setOutputData(JSON.stringify(result, null, 2));
        } else if (extraOption === 'Convert as line by line') {
          try {
            const parsedInput1 = JSON.parse(inputData1);
            const parsedInput2 = JSON.parse(inputData2);

            if (Array.isArray(parsedInput1) && Array.isArray(parsedInput2)) {
              const diff1 = parsedInput1.filter(item => !parsedInput2.includes(item));
              const diff2 = parsedInput2.filter(item => !parsedInput1.includes(item));
              setOutputData(`Only in List 1 (Count: ${diff1.length}):\n${diff1.join('\n')}\n\nOnly in List 2 (Count: ${diff2.length}):\n${diff2.join('\n')}`);
            } else {
              setOutputData('Invalid input: Expected JSON arrays for line-by-line comparison.');
            }
          } catch (error) {
            setOutputData('Invalid JSON input. Please provide valid JSON arrays.');
          }
        } else {
          setOutputData(JSON.stringify(result, null, 2));
        }
      } else if (selectedOption === 'Intersection of two lists') {
        const list1 = inputData1.split('\n').map((item) => item.trim()).filter(Boolean);
        const list2 = inputData2.split('\n').map((item) => item.trim()).filter(Boolean);
        const intersection = Array.from(new Set(list1.filter((item) => list2.includes(item))));
        if (extraOption === 'Convert to list') {
          setOutputData(JSON.stringify(intersection, null, 2));
        } else if (extraOption === 'Convert as line by line') {
          setOutputData(intersection.join('\n'));
        } else {
          setOutputData(JSON.stringify(intersection, null, 2));
        }
      } else if (selectedOption === 'Find duplicate items') {
        const items = inputData1.split('\n').map((item) => item.trim()).filter(Boolean);
        const duplicates = items.filter((item, index) => items.indexOf(item) !== index);
        const uniqueDuplicates = Array.from(new Set(duplicates));
        if (extraOption === 'Convert to list') {
          setOutputData(JSON.stringify(uniqueDuplicates, null, 2));
        } else if (extraOption === 'Convert as line by line') {
          setOutputData(uniqueDuplicates.join('\n'));
        } else {
          setOutputData(JSON.stringify(uniqueDuplicates, null, 2));
        }
      } else if (selectedOption === 'Sort a list') {
        const items = inputData1.split('\n').map((item) => item.trim()).filter(Boolean);
        const sortedItems = items.sort();
        if (extraOption === 'Convert to list') {
          setOutputData(JSON.stringify(sortedItems, null, 2));
        } else if (extraOption === 'Convert as line by line') {
          setOutputData(sortedItems.join('\n'));
        } else {
          setOutputData(JSON.stringify(sortedItems, null, 2));
        }
      } else if (selectedOption === 'Prettify JSON') {
        const json = JSON.parse(inputData1);
        setOutputData(JSON.stringify(json, null, 2));
      } else if (selectedOption === 'Flatten array') {
        const array = JSON.parse(inputData1);
        const flattened = array.flat(Infinity);
        setOutputData(JSON.stringify(flattened, null, 2));
      } else if (selectedOption === 'Diff of two JSONs') {
        const json1 = JSON.parse(inputData1);
        const json2 = JSON.parse(inputData2);
        const diff = Object.keys(json1).filter((key) => json1[key] !== json2[key]);
        setOutputData(JSON.stringify(diff, null, 2));
      } else if (selectedOption === 'Stringify') {
        const obj = JSON.parse(inputData1);
        setOutputData(JSON.stringify(obj));
      } else if (selectedOption === 'Fix the JSON') {
        try {
          const fixedJson = JSON.parse(inputData1);
          setOutputData(JSON.stringify(fixedJson, null, 2));
        } catch (error) {
          setOutputData('Invalid JSON input. Please check your input.');
        }
      } else {
        setOutputData('Action not implemented yet.');
      }
    } catch (error) {
      setOutputData('Error processing input. Please check your input format.');
    }
  }, [selectedOption, inputData1, inputData2, extraOption]);

  const renderExtraOptions = () => {
    if (['Unique list', 'Diff of two lists', 'Intersection of two lists', 'Find duplicate items', 'Sort a list'].includes(selectedOption || '')) {
      return (
        <select
          className="p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={extraOption}
          onChange={(e) => setExtraOption(e.target.value)}
        >
          <option value="">Select an extra option</option>
          <option value="Convert to list">Convert to list</option>
          <option value="Convert as line by line">Convert as line by line</option>
        </select>
      );
    } else {
      return <p className="text-gray-500">No extra options available for this action.</p>;
    }
  };

  // Updated the input text area height for multiple inputs to divide the panel into two halves.
  const renderInputFields = () => {
    if (['Diff of two lists', 'Diff of two JSONs', 'Intersection of two lists'].includes(selectedOption || '')) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <textarea
            className="w-full flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter first input..."
            value={inputData1}
            onChange={(e) => setInputData1(e.target.value)}
            style={{ height: '50%' }} // Divide the panel into two halves
          />
          <textarea
            className="w-full flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter second input..."
            value={inputData2}
            onChange={(e) => setInputData2(e.target.value)}
            style={{ height: '50%' }} // Divide the panel into two halves
          />
        </div>
      );
    } else if (selectedOption === 'Milliseconds to Date/Time') {
      return (
        <>
          <textarea
            className="w-full h-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter milliseconds value here..."
            value={inputData1}
            onChange={(e) => setInputData1(e.target.value)}
            style={{ height: '10%' }}
          />
          <LiveCurrentTimePanel /> {/* <-- This renders the live time panel below the input */}
        </>
      );
    } else {
      return (
        <textarea
          className="w-full h-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter input here..."
          value={inputData1}
          onChange={(e) => setInputData1(e.target.value)}
          style={{ height: '100%' }}
        />
      );
    }
  };

  // Added a copy button in the output panel to copy the result.
  const renderOutput = () => {
    if (selectedOption === 'Milliseconds to Date/Time' && outputData) {
      return <TimeToolOutput outputData={outputData} />;
    }
    if (selectedOption === 'Diff of two lists' && outputData) {
      const parsedOutput = JSON.parse(outputData);
      const diff1 = parsedOutput.diff1 || [];
      const diff2 = parsedOutput.diff2 || [];

      return (
        <div className="flex flex-col space-y-4">
          <div className="flex justify-end">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => navigator.clipboard.writeText(outputData)}
            >
              Copy Output
            </button>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-red-600">Only in List 1</h4>
              <ul className="list-disc pl-4">
                {diff1.map((item: string, index: number) => (
                  <li key={index} className="text-red-500">{item}</li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-green-600">Only in List 2</h4>
              <ul className="list-disc pl-4">
                {diff2.map((item: string, index: number) => (
                  <li key={index} className="text-green-500">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col space-y-4">
          <div className="flex justify-end">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => navigator.clipboard.writeText(outputData)}
            >
              Copy Output
            </button>
          </div>
          <pre className="w-full h-full p-2 border rounded bg-gray-100 overflow-auto">
            {outputData}
          </pre>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="p-4 border-b bg-white shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">CodeAlchemy Tool Dashboard</h1>
        {selectedOption && (
          <button
            className="bg-green-500 text-white px-6 py-3 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={handleAction}
          >
            Perform Action
          </button>
        )}
      </header>

      {/* Main Content */}
      <div className="flex flex-1">   {/* Left Panel */}
      <div className="w-1/7 bg-white p-4 border-r shadow-md">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Tools</h2>
        <ul className="space-y-2">
          {tools.map((tool) => (
            <li key={tool.category}>
              <div
                className={`p-2 rounded cursor-pointer ${
                  selectedTool === tool.category ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
                }`}
                onClick={() => {
                  setSelectedTool(tool.category);
                  setSelectedOption(null);
                  setInputData1('');
                  setInputData2('');
                  setOutputData('');
                  setExtraOption('');
                }}
              >
                {tool.category}
              </div>
              {selectedTool === tool.category && (
                <ul className="pl-4 mt-2 space-y-1">
                  {tool.options.map((option) => (
                    <li
                      key={option}
                      className={`p-1 rounded cursor-pointer ${
                        selectedOption === option ? 'bg-blue-300' : 'hover:bg-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedOption(option);
                        setInputData1('');
                        setInputData2('');
                        setOutputData('');
                        setExtraOption('');
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Input Section */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-blue-600">Input</h3>
              {selectedOption && renderExtraOptions()}
              {['Diff of two lists', 'Diff of two JSONs', 'Intersection of two lists'].includes(selectedOption || '') ? (
                <div className="flex space-x-4">
                  <span className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded">
                    Count 1: {calculateCount(inputData1)}
                  </span>
                  <span className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded">
                    Count 2: {calculateCount(inputData2)}
                  </span>
                </div>
              ) : selectedOption === 'Milliseconds to Date/Time' ? null : (
                <span className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded">
                  Count: {calculateCount(inputData1)}
                </span>
              )}
            </div>

            <div className="scrollable-panel">
              {selectedOption ? (
                <>
                  {renderInputFields()}
                </>
              ) : (
                <p className="text-gray-500">Select an option to provide input.</p>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="flex-1 p-4 border-l overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-blue-600">Output</h3>
              {['Diff of two lists', 'Diff of two JSONs'].includes(selectedOption || '') && outputData ? (
                <div className="flex space-x-4">
                  <span className="bg-green-100 text-green-800 font-semibold px-3 py-1 rounded">
                    Count 1: {calculateCount(JSON.parse(outputData).diff1 || [])}
                  </span>
                  <span className="bg-green-100 text-green-800 font-semibold px-3 py-1 rounded">
                    Count 2: {calculateCount(JSON.parse(outputData).diff2 || [])}
                  </span>
                </div>
              ) : selectedOption === 'Milliseconds to Date/Time' ? null : (
                <span className="bg-green-100 text-green-800 font-semibold px-3 py-1 rounded">
                  Count: {calculateCount(outputData)}
                </span>
              )}
            </div>
            <div className="scrollable-panel">
              {outputData ? (
                renderOutput()
              ) : (
                <p className="text-gray-500">Output will be displayed here.</p>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

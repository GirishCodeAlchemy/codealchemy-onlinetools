"use client";

import React, { useState , useRef} from 'react';
import type { JSX } from 'react';
import './globals.css';
import { convertMillisecondsToHumanReadable, TimeToolOutput, LiveCurrentTimePanel } from './tools/TimeTools';
import {
  uniqueList,
  diffOfTwoLists,
  intersectionOfTwoLists,
  findDuplicates,
  sortList,
  ListToolOutput,
} from './tools/ListTools';

import {
  prettifyJSON,
  flattenArray,
  diffOfTwoJSONs,
  stringifyJSON,
  fixJSON,
  JsonToolOutput,
  JsonataTool,
} from './tools/JsonTools';

import {
  ClipboardIcon,
  QrCodeIcon,
  ClockIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  ArrowsRightLeftIcon,
  DocumentDuplicateIcon,
  ArrowUpOnSquareIcon,
  MagnifyingGlassCircleIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline'; // If using Heroicons React package

const categoryIcons: Record<string, JSX.Element> = {
  'List Tools': <ClipboardIcon className="w-5 h-5 mr-2 text-white" />,
  'JSON Tools': <QrCodeIcon className="w-5 h-5 mr-2 text-white" />,
  'Time Tools': <ClockIcon className="w-5 h-5 mr-2 text-white" />,
};

const optionIcons: Record<string, JSX.Element> = {
  'Unique list': <SparklesIcon className="w-4 h-4 mr-2 text-white" />,
  'Diff of two lists': <ArrowsRightLeftIcon className="w-4 h-4 mr-2 text-white" />,
  'Intersection of two lists': <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2 text-white" />,
  'Find duplicate items': <MagnifyingGlassCircleIcon className="w-4 h-4 mr-2 text-white" />,
  'Sort a list': <ArrowUpOnSquareIcon className="w-4 h-4 mr-2 text-white" />,
  'JSONata': <TableCellsIcon className="w-4 h-4 mr-2 text-white" />,
  'Prettify JSON': <SparklesIcon className="w-4 h-4 mr-2 text-white" />,
  'Flatten array': <ArrowsRightLeftIcon className="w-4 h-4 mr-2 text-white" />,
  'Diff of two JSONs': <ArrowsRightLeftIcon className="w-4 h-4 mr-2 text-white" />,
  'Stringify': <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-white" />,
  'Fix the JSON': <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2 text-white" />,
  'Milliseconds to Date/Time': <ClockIcon className="w-4 h-4 mr-2 text-white" />,
};

const tools = [
  { category: 'List Tools', options: ['Unique list', 'Diff of two lists', 'Intersection of two lists', 'Find duplicate items', 'Sort a list'] },
  { category: 'JSON Tools', options: ['JSONata','Prettify JSON', 'Flatten array', 'Diff of two JSONs', 'Stringify', 'Fix the JSON'] },
  { category: 'Time Tools', options: ['Milliseconds to Date/Time'] },
];

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputData1, setInputData1] = useState<string>('');
  const [inputData2, setInputData2] = useState<string>('');
  const [outputData, setOutputData] = useState<any>('');
  const [extraOption, setExtraOption] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([tools[0].category]);
  const jsonataRef = useRef<any>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const calculateCount = (data: any): number => {
    try {
      if (typeof data === 'string') {
        const parsedData = JSON.parse(data);
        if (Array.isArray(parsedData)) {
          return parsedData.length;
        }
      } else if (Array.isArray(data)) {
        return data.length;
      }
    } catch {
      if (typeof data === 'string') {
        return data.split('\n').filter((line) => line.trim() !== '').length;
      }
    }
    return 0;
  };

  const handleAction = React.useCallback(() => {
    try {
      // Time Tools
      if (selectedOption === 'Milliseconds to Date/Time') {
        setOutputData(convertMillisecondsToHumanReadable(inputData1));
      }
      // List Tools
      else if (selectedOption === 'Unique list') {
        const result = uniqueList(inputData1, extraOption);
        setOutputData(result)
      } else if (selectedOption === 'Diff of two lists') {
        const result = diffOfTwoLists(inputData1, inputData2, extraOption);
        setOutputData(result);
      } else if (selectedOption === 'Intersection of two lists') {
        const result = intersectionOfTwoLists(inputData1, inputData2, extraOption);
        setOutputData(result);
      } else if (selectedOption === 'Find duplicate items') {
        const result = findDuplicates(inputData1, extraOption);
        setOutputData(result);
      } else if (selectedOption === 'Sort a list') {
        const result = sortList(inputData1, extraOption);
        setOutputData(result);
      }
      // JSON Tools
      else if (selectedOption === 'Prettify JSON') {
        setOutputData(prettifyJSON(inputData1));
      } else if (selectedOption === 'Flatten array') {
        setOutputData(flattenArray(inputData1));
      } else if (selectedOption === 'Diff of two JSONs') {
        setOutputData(diffOfTwoJSONs(inputData1, inputData2));
      } else if (selectedOption === 'Stringify') {
        setOutputData(stringifyJSON(inputData1));
      } else if (selectedOption === 'Fix the JSON') {
        setOutputData(fixJSON(inputData1));
      }else if (selectedOption === 'JSONata') {
        jsonataRef.current?.run();
        return;
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
    }
    // else {
    //   return <p className="text-gray-500">No extra options available for this action.</p>;
    // }
  };

  const renderInputFields = () => {
    if (['Diff of two lists', 'Diff of two JSONs', 'Intersection of two lists'].includes(selectedOption || '')) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <textarea
            className="w-full flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter first input..."
            value={inputData1}
            onChange={(e) => setInputData1(e.target.value)}
            style={{ height: '50%' }}
          />
          <textarea
            className="w-full flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter second input..."
            value={inputData2}
            onChange={(e) => setInputData2(e.target.value)}
            style={{ height: '50%' }}
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
          <LiveCurrentTimePanel />
        </>
      );
    } else if (selectedOption === 'JSONata') {
      // return <JsonataTool />;
      return <JsonataTool ref={jsonataRef} />;
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

  const renderOutput = () => {
    if (selectedOption === 'Milliseconds to Date/Time' && outputData) {
      return <TimeToolOutput outputData={outputData} />;
    }
    if (
      ['Unique list', 'Diff of two lists', 'Intersection of two lists', 'Find duplicate items', 'Sort a list'].includes(selectedOption || '')
      && outputData
    ) {
      return ListToolOutput(outputData, selectedOption);
      // return <ListToolOutput outputData={outputData} , selectedOption={selectedOption} />;
    }
    if (
      ['Prettify JSON', 'Flatten array', 'Diff of two JSONs', 'Stringify', 'Fix the JSON'].includes(selectedOption || '')
      && outputData
    ) {
      return <JsonToolOutput outputData={outputData} />;
    }
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
  };

   return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-blue-700">CodeAlchemy Online Tools</h1>

        </div>
        <button
          className="bg-gradient-to-r from-black-500 via-blue-500 to-black-400 text-black px-12 py-3 rounded-full shadow-2xl border-0 font-extrabold text-lg flex items-center justify-center gap-3 transition-all duration-200 hover:from-fuchsia-600 hover:via-blue-600 hover:to-cyan-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md bg-opacity-90"
          onClick={handleAction}
          disabled={!selectedOption}
          style={{
            letterSpacing: '0.09em',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'
          }}
        >
          <span className="inline-flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Run Tool
          </span>
        </button>
        <span className="text-gray-500"> </span>
      </header>
      <hr></hr>
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-blue-100 via-blue-50 to-blue-200 border-r p-4 flex flex-col shadow-md rounded-tr-xl rounded-br-xl">
  <h2 className="text-xl font-bold mb-6 text-blue-700 tracking-wide text-center">🛠️ Tools</h2>
  {tools.map((tool, idx) => (
    <div key={tool.category} className="">
      {/* Tool Category Header */}
      <button
        className="w-full flex justify-between items-center px-4 py-2 rounded-t-xl font-semibold text-blue-800 bg-blue-100 hover:bg-blue-200 transition focus:outline-none border-b border-blue-200"
        onClick={() => toggleCategory(tool.category)}
        style={{
          fontSize: '1.08rem',
          letterSpacing: '0.03em',
        }}
      >
         <span className="flex items-center">
          {categoryIcons[tool.category] || null}
          {tool.category}
        </span>
        <span className="text-lg">{expandedCategories.includes(tool.category) ? '▲' : '▼'}</span>
      </button>
      {/* Tool Options */}
      {expandedCategories.includes(tool.category) && (
        <ul className="py-1 pl-2">
          {tool.options.map((option) => (
            <li key={option}>
              <button
                className={`w-full text-left px-4 py-2 my-1 rounded-lg font-medium transition-all
                  ${
                     selectedOption === option
                      ? '!bg-green-600 text-white font-bold border-l-4 border-green-700 shadow'
                      : 'bg-white hover:bg-green-100 text-green-700'
                  }`}
                style={{
                  marginLeft: '0.7rem',
                  boxShadow: selectedOption === option ? '0 2px 8px 0 rgba(135, 238, 39, 0.53)' : undefined,
                  transition: 'all 0.15s'
                }}
                onClick={() => {
                  setSelectedOption(option);
                  setInputData1('');
                  setInputData2('');
                  setOutputData('');
                  setExtraOption('');
                }}
              >
              <span className="flex items-center">
      {optionIcons[option] && (
        <span className="mr-2 flex items-center">{optionIcons[option]}</span>
      )}
      {option}
    </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* Divider between categories */}
      {idx !== tools.length - 1 && (
        <hr className="my-0.5 border-blue-200" />
      )}
    </div>
  ))}
</aside>
        {/* Main Content */}
         <main className="flex-1 flex flex-col">
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
            {selectedOption !== 'JSONata' && (
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
            </div>)}
          </div>
        </main>
      </div>
    </div>
  );
}
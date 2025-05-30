"use client";
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import React, { useState , useRef} from 'react';
import type { JSX } from 'react';
import './globals.css';
import { convertMillisecondsToHumanReadable, LiveCurrentTimePanel, convertDateTimeToMilliseconds, calculateTimeDifference,  addSubtractTime, formatDate, convertTimeZone, calculateAge, ExtendedTimeToolOutput,
  SampleInputHelper,
  getTimeToolPlaceholder} from './tools/TimeTools';
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
  { category: 'Time Tools', options: ['Milliseconds to Date/Time',
    'Date/Time to Milliseconds',
    'Calculate Time Difference',
    'Add/Subtract Time',
    'Format Date',
    'Time Zone Converter',
    'Age Calculator'
  ] },
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
      } else if (selectedOption === 'Date/Time to Milliseconds') {
        setOutputData(convertDateTimeToMilliseconds(inputData1));
      } else if (selectedOption === 'Calculate Time Difference') {
        setOutputData(calculateTimeDifference(inputData1, inputData2));
      } else if (selectedOption === 'Add/Subtract Time') {
        if (extraOption) {
          const [operation, unit] = extraOption.split('-');
          setOutputData(addSubtractTime(inputData1, inputData2, unit, operation));
        } else {
          setOutputData({ error: 'Please select time unit and operation' });
        }
      } else if (selectedOption === 'Format Date') {
        setOutputData(formatDate(inputData1));
      } else if (selectedOption === 'Time Zone Converter') {
        setOutputData(convertTimeZone(inputData1, inputData2, extraOption));
      } else if (selectedOption === 'Age Calculator') {
        setOutputData(calculateAge(inputData1, inputData2 || undefined));
      }

      // List Tools
      else if (selectedOption === 'Unique list') {
        setOutputData(uniqueList(inputData1, extraOption));
      } else if (selectedOption === 'Diff of two lists') {
        setOutputData(diffOfTwoLists(inputData1, inputData2, extraOption));
      } else if (selectedOption === 'Intersection of two lists') {
        setOutputData(intersectionOfTwoLists(inputData1, inputData2, extraOption));
      } else if (selectedOption === 'Find duplicate items') {
        setOutputData(findDuplicates(inputData1, extraOption));
      } else if (selectedOption === 'Sort a list') {
        setOutputData(sortList(inputData1, extraOption));
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
        if (jsonataRef.current) {
          jsonataRef.current.run();
        }
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
    if (['Diff of two lists', 'Intersection of two lists'].includes(selectedOption || '')) {
      return (
        <div className="space-y-4 h-full">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-blue-700 mb-2">
              📝 First List
            </label>
            <textarea
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="apple&#10;banana&#10;cherry&#10;(one item per line)"
              value={inputData1}
              onChange={(e) => setInputData1(e.target.value)}
              style={{ height: '45%', minHeight: '200px' }}
            />
            <div className="text-xs text-blue-600 mt-1">Enter items separated by new lines</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <label className="block text-sm font-medium text-green-700 mb-2">
              📝 Second List
            </label>
            <textarea
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="banana&#10;cherry&#10;date&#10;(one item per line)"
              value={inputData2}
              onChange={(e) => setInputData2(e.target.value)}
              style={{ height: '45%', minHeight: '200px' }}
            />
            <div className="text-xs text-green-600 mt-1">Enter items separated by new lines</div>
          </div>
        </div>
      );
    } else if (['Diff of two JSONs'].includes(selectedOption || '')) {
        return (
          <div className="space-y-4 h-full">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                📄 First JSON
              </label>
              <textarea
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-sm"
                placeholder='{"name": "John", "age": 30, "city": "New York"}'
                value={inputData1}
                onChange={(e) => setInputData1(e.target.value)}
                style={{ height: '45%', minHeight: '200px' }}
              />
              <div className="text-xs text-blue-600 mt-1">Enter your first JSON object</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <label className="block text-sm font-medium text-green-700 mb-2">
                📄 Second JSON
              </label>
              <textarea
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white font-mono text-sm"
                placeholder='{"name": "Jane", "age": 25, "country": "USA"}'
                value={inputData2}
                onChange={(e) => setInputData2(e.target.value)}
                style={{ height: '45%', minHeight: '200px' }}
              />
              <div className="text-xs text-green-600 mt-1">Enter your second JSON object</div>
            </div>
          </div>
        );
      } else if (selectedOption === 'Milliseconds to Date/Time') {
        return (
        <>
          <SampleInputHelper toolType="milliseconds" />
          <textarea
            className="w-full h-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={getTimeToolPlaceholder('Milliseconds to Date/Time')}
            value={inputData1}
            onChange={(e) => setInputData1(e.target.value)}
            style={{ height: '10%' }}
          />
          <LiveCurrentTimePanel />
        </>
      );
    } else if (selectedOption === 'Date/Time to Milliseconds') {
      return (
        <>
          <SampleInputHelper toolType="dateToMs" />
          <textarea
            className="w-full h-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={getTimeToolPlaceholder('Date/Time to Milliseconds')}
            value={inputData1}
            onChange={(e) => setInputData1(e.target.value)}
            style={{ height: '10%' }}
          />
          <LiveCurrentTimePanel />
        </>
      );
    } else if (selectedOption === 'Calculate Time Difference') {
      return (
        <>
          <SampleInputHelper toolType="timeDifference" />
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                📅 Start Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={inputData1}
                onChange={(e) => setInputData1(e.target.value)}
              />
              <div className="text-xs text-blue-600 mt-1">Or enter any date format manually</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <label className="block text-sm font-medium text-green-700 mb-2">
                📅 End Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                value={inputData2}
                onChange={(e) => setInputData2(e.target.value)}
              />
              <div className="text-xs text-green-600 mt-1">Or enter any date format manually</div>
            </div>
          </div>
          <LiveCurrentTimePanel />
        </>
      );
    } else if (selectedOption === 'Add/Subtract Time') {
      return (
        <>
          <SampleInputHelper toolType="addSubtractTime" />
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                📅 Base Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={inputData1}
                onChange={(e) => setInputData1(e.target.value)}
              />
              <div className="text-xs text-blue-600 mt-1">Or enter any date format manually</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  🔢 Amount
                </label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  placeholder="e.g., 5"
                  value={inputData2}
                  onChange={(e) => setInputData2(e.target.value)}
                />
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <label className="block text-sm font-medium text-orange-700 mb-2">
                  ⚡ Operation & Unit
                </label>
                <select
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  value={extraOption}
                  onChange={(e) => setExtraOption(e.target.value)}
                >
                  <option value="">Select operation...</option>
                  <optgroup label="➕ Add Time">
                    <option value="add-seconds">Add Seconds</option>
                    <option value="add-minutes">Add Minutes</option>
                    <option value="add-hours">Add Hours</option>
                    <option value="add-days">Add Days</option>
                    <option value="add-months">Add Months</option>
                    <option value="add-years">Add Years</option>
                  </optgroup>
                  <optgroup label="➖ Subtract Time">
                    <option value="subtract-seconds">Subtract Seconds</option>
                    <option value="subtract-minutes">Subtract Minutes</option>
                    <option value="subtract-hours">Subtract Hours</option>
                    <option value="subtract-days">Subtract Days</option>
                    <option value="subtract-months">Subtract Months</option>
                    <option value="subtract-years">Subtract Years</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
          <LiveCurrentTimePanel />
        </>
      );
    } else if (selectedOption === 'Format Date') {
      return (
        <>
          <SampleInputHelper toolType="formatDate" />
          <textarea
            className="w-full h-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={getTimeToolPlaceholder('Format Date')}
            value={inputData1}
            onChange={(e) => setInputData1(e.target.value)}
            style={{ height: '10%' }}
          />
          <LiveCurrentTimePanel />
        </>
      );
    } else if (selectedOption === 'Time Zone Converter') {
      return (
        <>
          <SampleInputHelper toolType="timeZone" />
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                📅 Date & Time to Convert
              </label>
              <input
                type="datetime-local"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={inputData1}
                onChange={(e) => setInputData1(e.target.value)}
              />
              <div className="text-xs text-blue-600 mt-1">Or enter any date format manually</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <label className="block text-sm font-medium text-green-700 mb-2">
                  🌍 From Time Zone
                </label>
                <select
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  value={inputData2}
                  onChange={(e) => setInputData2(e.target.value)}
                >
                  <option value="">Select source timezone...</option>
                  <optgroup label="🇺🇸 North America">
                    <option value="America/New_York">Eastern Time (New York)</option>
                    <option value="America/Chicago">Central Time (Chicago)</option>
                    <option value="America/Denver">Mountain Time (Denver)</option>
                    <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                  </optgroup>
                  <optgroup label="🇪🇺 Europe">
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="Europe/Paris">Paris (CET/CEST)</option>
                    <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                    <option value="Europe/Moscow">Moscow (MSK)</option>
                  </optgroup>
                  <optgroup label="🌏 Asia Pacific">
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                    <option value="Asia/Kolkata">Mumbai (IST)</option>
                    <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                  </optgroup>
                  <optgroup label="🌍 Other">
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="Africa/Cairo">Cairo (EET/EEST)</option>
                    <option value="America/Sao_Paulo">São Paulo (BRT/BRST)</option>
                  </optgroup>
                </select>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  🎯 To Time Zone
                </label>
                <select
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  value={extraOption}
                  onChange={(e) => setExtraOption(e.target.value)}
                >
                  <option value="">Select target timezone...</option>
                  <optgroup label="🇺🇸 North America">
                    <option value="America/New_York">Eastern Time (New York)</option>
                    <option value="America/Chicago">Central Time (Chicago)</option>
                    <option value="America/Denver">Mountain Time (Denver)</option>
                    <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                  </optgroup>
                  <optgroup label="🇪🇺 Europe">
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="Europe/Paris">Paris (CET/CEST)</option>
                    <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                    <option value="Europe/Moscow">Moscow (MSK)</option>
                  </optgroup>
                  <optgroup label="🌏 Asia Pacific">
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                    <option value="Asia/Kolkata">Mumbai (IST)</option>
                    <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                  </optgroup>
                  <optgroup label="🌍 Other">
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="Africa/Cairo">Cairo (EET/EEST)</option>
                    <option value="America/Sao_Paulo">São Paulo (BRT/BRST)</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
          <LiveCurrentTimePanel />
        </>
      );
    } else if (selectedOption === 'Age Calculator') {
      return (
        <>
          <SampleInputHelper toolType="ageCalculator" />
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                🎂 Birth Date
              </label>
              <input
                type="date"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={inputData1}
                onChange={(e) => setInputData1(e.target.value)}
              />
              <div className="text-xs text-blue-600 mt-1">Enter your birth date</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <label className="block text-sm font-medium text-green-700 mb-2">
                📅 Target Date (Optional)
              </label>
              <input
                type="date"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                value={inputData2}
                onChange={(e) => setInputData2(e.target.value)}
              />
              <div className="text-xs text-green-600 mt-1">Leave empty to calculate age as of today</div>
            </div>
          </div>
        </>
      );
    } else if (['Prettify JSON', 'Stringify', 'Fix the JSON', 'Flatten array'].includes(selectedOption || '')) {
      const getPlaceholder = () => {
        switch (selectedOption) {
          case 'Prettify JSON':
            return '{"name":"John","age":30,"city":"New York"}';
          case 'Stringify':
            return '{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}';
          case 'Fix the JSON':
            return '{name: "John", age: 30, city: "New York"}';
          case 'Flatten array':
            return '[[1, 2], [3, [4, 5]], 6]';
          default:
            return 'Enter your JSON here...';
        }
      };

      const getHelpText = () => {
        switch (selectedOption) {
          case 'Prettify JSON':
            return 'Enter minified JSON to format it with proper indentation';
          case 'Stringify':
            return 'Enter formatted JSON to convert it to a single line string';
          case 'Fix the JSON':
            return 'Enter malformed JSON (missing quotes, trailing commas, etc.)';
          case 'Flatten array':
            return 'Enter a nested array to flatten it completely';
          default:
            return '';
        }
      };

      return (
        <div className="space-y-4 h-full">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-blue-700 mb-2">
              📄 {selectedOption}
            </label>
            <textarea
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-sm"
              placeholder={getPlaceholder()}
              value={inputData1}
              onChange={(e) => setInputData1(e.target.value)}
              style={{
                height: selectedOption === 'Stringify' ? '400px' : '80%',
                minHeight: '850px',
                resize: 'vertical',
                wordBreak: 'break-all',
                whiteSpace: 'pre-wrap'
              }}
            />
            <div className="text-xs text-blue-600 mt-1">{getHelpText()}</div>
          </div>
        </div>
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
      return <ExtendedTimeToolOutput outputData={outputData} toolType="default" />;
    }
    if (selectedOption === 'Date/Time to Milliseconds' && outputData) {
      return <ExtendedTimeToolOutput outputData={outputData} toolType="default" />;
    }
    if (selectedOption === 'Calculate Time Difference' && outputData) {
      return <ExtendedTimeToolOutput outputData={outputData} toolType="timeDifference" />;
    }
    if (selectedOption === 'Add/Subtract Time' && outputData) {
      return <ExtendedTimeToolOutput outputData={outputData} toolType="addSubtractTime" />;
    }
    if (selectedOption === 'Format Date' && outputData) {
      return <ExtendedTimeToolOutput outputData={outputData} toolType="formatDate" />;
    }
    if (selectedOption === 'Time Zone Converter' && outputData) {
      return <ExtendedTimeToolOutput outputData={outputData} toolType="timeZone" />;
    }
    if (selectedOption === 'Age Calculator' && outputData) {
      return <ExtendedTimeToolOutput outputData={outputData} toolType="ageCalculator" />;
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
        <span className="text-gray-500"> <a
            href="https://www.linkedin.com/in/vgirish10"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-900 transition"
            title="Follow me on LinkedIn"
          >
            <FaLinkedin className="w-7 h-7" />
          </a>
          <a
            href="https://github.com/GirishCodeAlchemy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-800 hover:text-black transition"
            title="Follow me on GitHub"
          >
            <FaGithub className="w-7 h-7" />
          </a> </span>
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
                {['Diff of two lists', 'Intersection of two lists'].includes(selectedOption || '') ? (
                  <div className="flex space-x-4">
                    <span className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded">
                      List1: ( {calculateCount(inputData1)} )
                    </span>
                    <span className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded">
                      List2: ( {calculateCount(inputData2)} )
                    </span>
                  </div>
                ) : ['Milliseconds to Date/Time', 'Date/Time to Milliseconds', 'Calculate Time Difference', 'Add/Subtract Time', 'Format Date', 'Time Zone Converter'].includes(selectedOption || '') ? null : (
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
                {['Diff of two lists'].includes(selectedOption || '') && outputData ? (
                <div className="flex space-x-4">
                  <span className="bg-green-100 text-green-800 font-semibold px-3 py-1 rounded">
                    List1: ( {calculateCount(JSON.parse(outputData).diff1 || [])} )
                  </span>
                  <span className="bg-green-100 text-green-800 font-semibold px-3 py-1 rounded">
                    List2: ( {calculateCount(JSON.parse(outputData).diff2 || [])} )
                  </span>
                  <span className="bg-green-100 text-green-800 font-semibold px-3 py-1 rounded">
                    Common: ( {calculateCount(JSON.parse(outputData).common || [])} )
                  </span>
                </div>
                ) : ['Milliseconds to Date/Time', 'Date/Time to Milliseconds', 'Calculate Time Difference', 'Add/Subtract Time', 'Format Date', 'Time Zone Converter'].includes(selectedOption || '') ? null : (
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
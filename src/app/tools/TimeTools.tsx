import React from 'react';

export function convertMillisecondsToHumanReadable(msInput: string) {
  const ms = parseInt(msInput.trim(), 10);
  if (isNaN(ms)) {
    return { error: 'Invalid input. Please enter a valid number of milliseconds.' };
  }
  const date = new Date(ms);
  return {
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    unix: Math.floor(ms / 1000),
    ms,
  };
}

export function TimeToolOutput({ outputData }: { outputData: any }) {
  if (outputData?.error) {
    return (
      <div className="text-red-600 font-semibold">{outputData.error}</div>
    );
  }
  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="bg-white shadow rounded p-6 w-full max-w-lg text-center space-y-4">
        <div>
          <div className="text-gray-500">UTC date & time</div>
          <div className="font-bold text-lg">{outputData.utc}</div>
        </div>
        <div>
          <div className="text-gray-500">Local date & time</div>
          <div className="font-bold text-lg">{outputData.local}</div>
        </div>
        <div>
          <div className="text-gray-500">UNIX time (seconds)</div>
          <div className="font-mono text-xl">{outputData.unix}</div>
        </div>
        <div>
          <div className="text-gray-500">Milliseconds</div>
          <div className="font-mono text-md">{outputData.ms}</div>
        </div>
      </div>
    </div>
  );
}

// Convert Date/Time to Milliseconds
export function convertDateTimeToMilliseconds(dateInput: string) {
  try {
    const date = new Date(dateInput.trim());
    if (isNaN(date.getTime())) {
      return { error: 'Invalid date format. Please enter a valid date/time.' };
    }
    return {
      ms: date.getTime(),
      unix: Math.floor(date.getTime() / 1000),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
    };
  } catch (error) {
    return { error: 'Invalid date format. Please enter a valid date/time.' };
  }
}

// Calculate Time Difference
export function calculateTimeDifference(startTime: string, endTime: string) {
  try {
    const start = new Date(startTime.trim());
    const end = new Date(endTime.trim());

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { error: 'Invalid date format. Please enter valid start and end dates.' };
    }

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    return {
      milliseconds: diffMs,
      seconds: diffSeconds,
      minutes: diffMinutes,
      hours: diffHours,
      days: diffDays,
      humanReadable: `${diffDays} days, ${diffHours % 24} hours, ${diffMinutes % 60} minutes, ${diffSeconds % 60} seconds`,
      startDate: start.toLocaleString(),
      endDate: end.toLocaleString(),
    };
  } catch (error) {
    return { error: 'Error calculating time difference.' };
  }
}

// Add/Subtract Time
export function addSubtractTime(dateInput: string, amount: string, unit: string, operation: string) {
  try {
    const date = new Date(dateInput.trim());
    const amountNum = parseInt(amount.trim(), 10);

    if (isNaN(date.getTime()) || isNaN(amountNum)) {
      return { error: 'Invalid input. Please enter valid date and amount.' };
    }

    const multiplier = operation === 'subtract' ? -1 : 1;
    const finalAmount = amountNum * multiplier;

    switch (unit) {
      case 'seconds':
        date.setSeconds(date.getSeconds() + finalAmount);
        break;
      case 'minutes':
        date.setMinutes(date.getMinutes() + finalAmount);
        break;
      case 'hours':
        date.setHours(date.getHours() + finalAmount);
        break;
      case 'days':
        date.setDate(date.getDate() + finalAmount);
        break;
      case 'months':
        date.setMonth(date.getMonth() + finalAmount);
        break;
      case 'years':
        date.setFullYear(date.getFullYear() + finalAmount);
        break;
      default:
        return { error: 'Invalid time unit.' };
    }

    return {
      result: date.toLocaleString(),
      utc: date.toUTCString(),
      ms: date.getTime(),
      unix: Math.floor(date.getTime() / 1000),
      operation: `${operation === 'add' ? 'Added' : 'Subtracted'} ${amountNum} ${unit}`,
    };
  } catch (error) {
    return { error: 'Error performing time calculation.' };
  }
}

// Format Date in Multiple Formats
export function formatDate(dateInput: string) {
  try {
    const date = new Date(dateInput.trim());
    if (isNaN(date.getTime())) {
      return { error: 'Invalid date format. Please enter a valid date/time.' };
    }

    return {
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
      dateOnly: date.toDateString(),
      timeOnly: date.toTimeString(),
      yyyy_mm_dd: date.toISOString().split('T')[0],
      dd_mm_yyyy: date.toLocaleDateString('en-GB'),
      mm_dd_yyyy: date.toLocaleDateString('en-US'),
      unix: Math.floor(date.getTime() / 1000),
      ms: date.getTime(),
    };
  } catch (error) {
    return { error: 'Error formatting date.' };
  }
}

// Time Zone Converter
export function convertTimeZone(dateInput: string, fromTz: string, toTz: string) {
  try {
    const date = new Date(dateInput.trim());
    if (isNaN(date.getTime())) {
      return { error: 'Invalid date format. Please enter a valid date/time.' };
    }

    const fromTime = new Intl.DateTimeFormat('en-US', {
      timeZone: fromTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);

    const toTime = new Intl.DateTimeFormat('en-US', {
      timeZone: toTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);

    return {
      originalDate: dateInput,
      fromTimeZone: fromTz,
      toTimeZone: toTz,
      fromTime,
      toTime,
      utc: date.toUTCString(),
    };
  } catch (error) {
    return { error: 'Error converting time zone. Please check your time zone names.' };
  }
}

// Enhanced Live Current Time Panel with Copy Functionality
export function LiveCurrentTimePanel() {
  const [now, setNow] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 100);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="my-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-700 mb-3 text-center">🕒 Live Current Time</h3>
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white p-3 rounded shadow-sm">
          <div className="text-gray-600 text-sm">UTC Time</div>
          <div className="font-mono text-lg font-bold text-blue-600 cursor-pointer hover:bg-gray-100 p-1 rounded"
               onClick={() => copyToClipboard(now.toUTCString())}
               title="Click to copy">
            {now.toUTCString()}
          </div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm">
          <div className="text-gray-600 text-sm">Local Time</div>
          <div className="font-mono text-lg font-bold text-green-600 cursor-pointer hover:bg-gray-100 p-1 rounded"
               onClick={() => copyToClipboard(now.toLocaleString())}
               title="Click to copy">
            {now.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm">
          <div className="text-gray-600 text-sm">Unix Timestamp (seconds)</div>
          <div className="font-mono text-lg font-bold text-purple-600 cursor-pointer hover:bg-gray-100 p-1 rounded"
               onClick={() => copyToClipboard(Math.floor(now.getTime() / 1000).toString())}
               title="Click to copy">
            {Math.floor(now.getTime() / 1000)}
          </div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm">
          <div className="text-gray-600 text-sm">Milliseconds</div>
          <div className="font-mono text-lg font-bold text-orange-600 cursor-pointer hover:bg-gray-100 p-1 rounded"
               onClick={() => copyToClipboard(now.getTime().toString())}
               title="Click to copy">
            {now.getTime()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample Input Helper Component
export function SampleInputHelper({ toolType }: { toolType: string }) {
  const getSampleInputs = () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    switch (toolType) {
      case 'dateToMs':
        return {
          examples: [
            '2024-01-01 12:00:00',
            'January 1, 2024',
            '2024-01-01T12:00:00Z',
            'Mon Jan 01 2024 12:00:00 GMT+0000'
          ],
          description: 'Enter any valid date format'
        };
      case 'timeDifference':
        return {
          examples: [
            `Start: ${now.toISOString().split('T')[0]} 09:00:00`,
            `End: ${tomorrow.toISOString().split('T')[0]} 17:00:00`
          ],
          description: 'Enter start and end dates to calculate difference'
        };
      case 'addSubtractTime':
        return {
          examples: [
            'Base Date: 2024-01-01 12:00:00',
            'Amount: 5 (days/hours/minutes)',
            'Operation: add or subtract'
          ],
          description: 'Add or subtract time from a base date'
        };
      case 'formatDate':
        return {
          examples: [
            '2024-01-01 12:00:00',
            'January 1, 2024 12:00 PM',
            '1704110400000 (milliseconds)'
          ],
          description: 'Enter date to see in multiple formats'
        };
      case 'timeZone':
        return {
          examples: [
            'Date: 2024-01-01 12:00:00',
            'From: America/New_York',
            'To: Asia/Tokyo'
          ],
          description: 'Convert between time zones'
        };
      default:
        return {
          examples: ['1704110400000'],
          description: 'Enter milliseconds timestamp'
        };
    }
  };

  const samples = getSampleInputs();

  return (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="text-sm font-medium text-yellow-800 mb-2">💡 Sample Inputs:</div>
      <div className="text-xs text-yellow-700 mb-2">{samples.description}</div>
      <div className="space-y-1">
        {samples.examples.map((example, index) => (
          <div key={index} className="font-mono text-xs bg-white p-2 rounded border text-gray-700">
            {example}
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced Extended Time Tool Output Component
export function ExtendedTimeToolOutput({ outputData, toolType }: { outputData: any, toolType: string }) {
  if (outputData?.error) {
    return (
      <div className="text-red-600 font-semibold bg-red-50 p-4 rounded-lg border border-red-200">
        ❌ {outputData.error}
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  switch (toolType) {
    case 'timeDifference':
      return (
        <div className="flex flex-col space-y-4 w-full">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full space-y-6">
            <div className="text-center">
              <div className="text-gray-600 text-lg">⏱️ Time Difference</div>
              <div className="font-bold text-2xl text-blue-600 mt-2">{outputData.humanReadable}</div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-gray-600 text-sm">Days</div>
                <div className="font-mono text-2xl font-bold text-blue-600">{outputData.days}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-gray-600 text-sm">Hours</div>
                <div className="font-mono text-2xl font-bold text-green-600">{outputData.hours}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-gray-600 text-sm">Minutes</div>
                <div className="font-mono text-2xl font-bold text-purple-600">{outputData.minutes}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-gray-600 text-sm">Seconds</div>
                <div className="font-mono text-2xl font-bold text-orange-600">{outputData.seconds}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-gray-600 text-sm">Start Date</div>
                <div className="font-mono text-sm bg-gray-100 p-2 rounded">{outputData.startDate}</div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">End Date</div>
                <div className="font-mono text-sm bg-gray-100 p-2 rounded">{outputData.endDate}</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'formatDate':
      return (
        <div className="flex flex-col space-y-4 w-full">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full space-y-4">
            <div className="text-center mb-6">
              <div className="text-gray-600 text-lg">📅 Date Formats</div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'ISO 8601', value: outputData.iso, color: 'blue' },
                { label: 'UTC', value: outputData.utc, color: 'green' },
                { label: 'Local', value: outputData.local, color: 'purple' },
                { label: 'Date Only', value: outputData.dateOnly, color: 'orange' },
                { label: 'YYYY-MM-DD', value: outputData.yyyy_mm_dd, color: 'indigo' },
                { label: 'DD/MM/YYYY', value: outputData.dd_mm_yyyy, color: 'pink' },
                { label: 'MM/DD/YYYY', value: outputData.mm_dd_yyyy, color: 'red' },
                { label: 'Unix Timestamp', value: outputData.unix, color: 'gray' },
                { label: 'Milliseconds', value: outputData.ms, color: 'yellow' }
              ].map((item, index) => (
                <div key={index} className={`bg-${item.color}-50 p-4 rounded-lg border border-${item.color}-200`}>
                  <div className={`text-${item.color}-700 text-sm font-medium mb-1`}>{item.label}</div>
                  <div className={`font-mono text-sm text-${item.color}-800 bg-white p-2 rounded cursor-pointer hover:bg-gray-50`}
                       onClick={() => copyToClipboard(item.value.toString())}
                       title="Click to copy">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'addSubtractTime':
      return (
        <div className="flex flex-col space-y-4 w-full">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full space-y-4">
            <div className="text-center mb-6">
              <div className="text-gray-600 text-lg">⚡ Time Calculation Result</div>
              <div className="text-sm text-gray-500 mt-1">{outputData.operation}</div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-blue-700 text-sm font-medium mb-1">Result (Local)</div>
                <div className="font-mono text-lg text-blue-800 bg-white p-2 rounded cursor-pointer hover:bg-gray-50"
                     onClick={() => copyToClipboard(outputData.result)}
                     title="Click to copy">
                  {outputData.result}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-green-700 text-sm font-medium mb-1">UTC</div>
                <div className="font-mono text-sm text-green-800 bg-white p-2 rounded cursor-pointer hover:bg-gray-50"
                     onClick={() => copyToClipboard(outputData.utc)}
                     title="Click to copy">
                  {outputData.utc}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-purple-700 text-sm font-medium mb-1">Unix Timestamp</div>
                  <div className="font-mono text-sm text-purple-800 bg-white p-2 rounded cursor-pointer hover:bg-gray-50"
                       onClick={() => copyToClipboard(outputData.unix.toString())}
                       title="Click to copy">
                    {outputData.unix}
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-orange-700 text-sm font-medium mb-1">Milliseconds</div>
                  <div className="font-mono text-sm text-orange-800 bg-white p-2 rounded cursor-pointer hover:bg-gray-50"
                       onClick={() => copyToClipboard(outputData.ms.toString())}
                       title="Click to copy">
                    {outputData.ms}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'timeZone':
      return (
        <div className="flex flex-col space-y-4 w-full">

          <div className="bg-white shadow-lg rounded-lg p-6 w-full space-y-4">
            <div className="text-center mb-6">
              <div className="text-gray-600 text-lg">🌍 Time Zone Conversion</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-blue-700 text-sm font-medium mb-2">
                  📍 From: {outputData.fromTimeZone}
                </div>
                <div className="font-mono text-lg text-blue-800 bg-white p-3 rounded cursor-pointer hover:bg-gray-50"
                     onClick={() => copyToClipboard(outputData.fromTime)}
                     title="Click to copy">
                  {outputData.fromTime}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-green-700 text-sm font-medium mb-2">
                  📍 To: {outputData.toTimeZone}
                </div>
                <div className="font-mono text-lg text-green-800 bg-white p-3 rounded cursor-pointer hover:bg-gray-50"
                     onClick={() => copyToClipboard(outputData.toTime)}
                     title="Click to copy">
                  {outputData.toTime}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="text-gray-700 text-sm font-medium mb-2">Original Input</div>
              <div className="font-mono text-sm text-gray-800">{outputData.originalDate}</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="text-indigo-700 text-sm font-medium mb-2">UTC Reference</div>
              <div className="font-mono text-sm text-indigo-800 cursor-pointer hover:bg-white p-2 rounded"
                   onClick={() => copyToClipboard(outputData.utc)}
                   title="Click to copy">
                {outputData.utc}
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex flex-col space-y-4 w-full">
          <LiveCurrentTimePanel />
          <TimeToolOutput outputData={outputData} />
        </div>
      );
  }
}

// Enhanced placeholder helper function
export function getTimeToolPlaceholder(toolType: string, inputType?: string) {
  const examples = {
    milliseconds: '1704110400000 (Example: Jan 1, 2024 12:00:00 UTC)',
    dateTime: '2024-01-01 12:00:00 (or January 1, 2024)',
    startDate: '2024-01-01 09:00:00 (Start date and time)',
    endDate: '2024-01-01 17:00:00 (End date and time)',
    amount: '5 (Number to add/subtract)',
    timeZoneFrom: 'America/New_York (From timezone)',
    timeZoneTo: 'Asia/Tokyo (To timezone)',
  };

  switch (toolType) {
    case 'Date/Time to Milliseconds':
      return examples.dateTime;
    case 'Calculate Time Difference':
      return inputType === 'start' ? examples.startDate : examples.endDate;
    case 'Add/Subtract Time':
      return inputType === 'amount' ? examples.amount : examples.dateTime;
    case 'Format Date':
      return examples.dateTime;
    case 'Time Zone Converter':
      return inputType === 'from' ? examples.timeZoneFrom : examples.timeZoneTo;
    default:
      return examples.milliseconds;
  }
}
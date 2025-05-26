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

// Live panel for current time and milliseconds
export function LiveCurrentTimePanel() {
  const [now, setNow] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="my-4 p-4 bg-gray-100 rounded shadow flex flex-col items-center">
      <div className="text-gray-600">Current UTC time:</div>
      <div className="font-mono text-lg font-bold">{now.toUTCString()}</div>
      <div className="text-gray-600 mt-2">Current Local time:</div>
      <div className="font-mono text-lg font-bold">{now.toLocaleString()}</div>
      <div className="text-gray-600 mt-2">Current Milliseconds:</div>
      <div className="font-mono text-lg">{now.getTime()}</div>
    </div>
  );
}
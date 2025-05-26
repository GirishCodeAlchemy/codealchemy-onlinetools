import React from 'react';
import styles from '../../styles/listTools.module.css';

export function uniqueList(input: string, extraOption: string) {
  const items = input.split('\n').map(i => i.trim()).filter(Boolean);
  const result = Array.from(new Set(items));

  if (extraOption === 'Convert to list') {
    return JSON.stringify(result, null, 2);
  } else if (extraOption === 'Convert as line by line') {
    return result.join('\n');
  } else {
    return JSON.stringify(result, null, 2);
  }
}

export function diffOfTwoLists(input1: string, input2: string, extraOption: string) {
  const list1 = input1.split('\n').map(i => i.trim()).filter(Boolean);
  const list2 = input2.split('\n').map(i => i.trim()).filter(Boolean);
  const diff1 = list1.filter(i => !list2.includes(i));
  const diff2 =list2.filter(i => !list1.includes(i));


    const result = { diff1, diff2 };
    if (extraOption === 'Convert to list') {
        return JSON.stringify(result, null, 2);
    } else if (extraOption === 'Convert as line by line') {
        try {
            const parsedInput1 = JSON.parse(input1);
            const parsedInput2 = JSON.parse(input2);

            if (Array.isArray(parsedInput1) && Array.isArray(parsedInput2)) {
                const diff1 = parsedInput1.filter(item => !parsedInput2.includes(item));
                const diff2 = parsedInput2.filter(item => !parsedInput1.includes(item));
                return `Only in List 1 (Count: ${diff1.length}):\n${diff1.join('\n')}\n\nOnly in List 2 (Count: ${diff2.length}):\n${diff2.join('\n')}`;
            } else {
                return 'Invalid input: Expected JSON arrays for line-by-line comparison.';
            }
        } catch (error) {
            return 'Invalid JSON input. Please provide valid JSON arrays.';
        }
    } else {
        return JSON.stringify(result, null, 2);
    }

}

export function intersectionOfTwoLists(input1: string, input2: string, extraOption: string) {

  const list1 = input1.split('\n').map(i => i.trim()).filter(Boolean);
  const list2 = input2.split('\n').map(i => i.trim()).filter(Boolean);
  const intersection = Array.from(new Set(list1.filter(i => list2.includes(i))));
    if (extraOption === 'Convert to list') {
        return JSON.stringify(intersection, null, 2);
    } else if (extraOption === 'Convert as line by line') {
        return intersection.join('\n');
    } else {
        return JSON.stringify(intersection, null, 2);
    }
}

export function findDuplicates(input: string, extraOption: string) {
  const items = input.split('\n').map(i => i.trim()).filter(Boolean);
  const duplicates = items.filter((item, idx) => items.indexOf(item) !== idx);
  const uniqueDuplicates = Array.from(new Set(duplicates));

    if (extraOption === 'Convert to list') {
        return JSON.stringify(uniqueDuplicates, null, 2);
    } else if (extraOption === 'Convert as line by line') {
        return uniqueDuplicates.join('\n');
    } else {
        return JSON.stringify(uniqueDuplicates, null, 2);
    }
}

export function sortList(input: string, extraOption: string) {
  const items = input.split('\n').map(i => i.trim()).filter(Boolean);
  const sortedItems = items.sort();

    if (extraOption === 'Convert to list') {
        return JSON.stringify(sortedItems, null, 2);
    } else if (extraOption === 'Convert as line by line') {
        return sortedItems.join('\n');
    } else {
        return JSON.stringify(sortedItems, null, 2);
    }
}

export function ListToolOutput(outputData: any, selectedOption: any) {
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

//   if (Array.isArray(outputData)) {
//     return (
//       <pre className={styles.output}>{outputData.join('\n')}</pre>
//     );
//   }
//   if (typeof outputData === 'object') {
//     return (
//       <pre className={styles.output}>{JSON.stringify(outputData, null, 2)}</pre>
//     );
//   }
//   return <pre className={styles.output}>{outputData}</pre>;
}
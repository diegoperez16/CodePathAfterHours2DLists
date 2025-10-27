import React, { useState, useEffect } from 'react';
import { Ghost, DoorOpen, Skull, CheckCircle } from 'lucide-react';
import { initPython, runPythonCode } from './pythonRunner';
import './storageService'; // Initialize storage

const HauntedMansion = () => {
  const [studentName, setStudentName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [pythonReady, setPythonReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const exercises = [
    {
      title: "Room 1: The Entrance Hall",
      description: "You enter a dark mansion. The rooms are arranged in a 3x3 grid. Find all the doors (represented by 'D').",
      mansion: [
        ['W', 'D', 'W'],
        ['D', 'R', 'D'],
        ['W', 'D', 'W']
      ],
      task: "Write a function count_doors(mansion) that returns the total number of doors ('D') in the mansion.",
      starterCode: `def count_doors(mansion):
    # Your code here
    pass

# Test your function
mansion = [
    ['W', 'D', 'W'],
    ['D', 'R', 'D'],
    ['W', 'D', 'W']
]
print(count_doors(mansion))`,
      expectedOutput: "4",
      hint: "Loop through each row, then each cell in the row, and count the 'D's"
    },
    {
      title: "Room 2: The Ghost Gallery",
      description: "Ghosts hide in certain rooms! You need to find the position of the first ghost.",
      mansion: [
        ['R', 'R', 'W'],
        ['W', 'G', 'R'],
        ['R', 'W', 'R']
      ],
      task: "Write a function find_ghost(mansion) that returns the row and column of the first ghost ('G') as a tuple (row, col). If no ghost exists, return None.",
      starterCode: `def find_ghost(mansion):
    # Your code here
    pass

# Test your function
mansion = [
    ['R', 'R', 'W'],
    ['W', 'G', 'R'],
    ['R', 'W', 'R']
]
print(find_ghost(mansion))`,
      expectedOutput: "(1, 1)",
      hint: "Use nested loops and return as soon as you find 'G'"
    },
    {
      title: "Room 3: The Key Chamber",
      description: "You need 3 keys to escape! Count how many keys are in each row.",
      mansion: [
        ['K', 'W', 'K'],
        ['W', 'K', 'W'],
        ['K', 'K', 'W']
      ],
      task: "Write a function keys_per_row(mansion) that returns a list with the count of keys ('K') in each row.",
      starterCode: `def keys_per_row(mansion):
    # Your code here
    pass

# Test your function
mansion = [
    ['K', 'W', 'K'],
    ['W', 'K', 'W'],
    ['K', 'K', 'W']
]
print(keys_per_row(mansion))`,
      expectedOutput: "[2, 1, 2]",
      hint: "Create an empty list, then for each row count the 'K's and append to the list"
    },
    {
      title: "Room 4: The Safe Path",
      description: "Some rooms are safe ('S'), others are trapped ('T'). Check if a path is all safe.",
      mansion: [
        ['T', 'S', 'T'],
        ['S', 'S', 'S'],
        ['T', 'S', 'T']
      ],
      task: "Write a function is_path_safe(mansion, row) that checks if all rooms in the given row number are safe ('S'). Return True or False.",
      starterCode: `def is_path_safe(mansion, row):
    # Your code here
    pass

# Test your function
mansion = [
    ['T', 'S', 'T'],
    ['S', 'S', 'S'],
    ['T', 'S', 'T']
]
print(is_path_safe(mansion, 1))  # Should be True
print(is_path_safe(mansion, 0))  # Should be False`,
      expectedOutput: "True\nFalse",
      hint: "Loop through all cells in mansion[row] and check if all are 'S'"
    },
    {
      title: "Room 5: The Final Escape",
      description: "Replace all trapped rooms with safe rooms to escape the mansion!",
      mansion: [
        ['S', 'T', 'S'],
        ['T', 'T', 'S'],
        ['S', 'T', 'T']
      ],
      task: "Write a function make_safe(mansion) that replaces all 'T' (traps) with 'S' (safe) and returns the modified mansion.",
      starterCode: `def make_safe(mansion):
    # Your code here
    pass

# Test your function
mansion = [
    ['S', 'T', 'S'],
    ['T', 'T', 'S'],
    ['S', 'T', 'T']
]
result = make_safe(mansion)
for row in result:
    print(row)`,
      expectedOutput: "['S', 'S', 'S']\n['S', 'S', 'S']\n['S', 'S', 'S']",
      hint: "Loop through each row and each cell, replacing 'T' with 'S'"
    }
  ];

  useEffect(() => {
    // Initialize Python when component mounts
    const loadPython = async () => {
      try {
        setOutput('Loading Python environment (this may take 10-30 seconds)...');
        const startTime = Date.now();
        await initPython();
        const loadTime = ((Date.now() - startTime) / 1000).toFixed(1);
        setPythonReady(true);
        setOutput(`✅ Python ready! (loaded in ${loadTime}s)\nClick "Run Code" to test your solution.`);
      } catch (error) {
        console.error('Python loading error:', error);
        setOutput('❌ Error loading Python: ' + error.message + '\n\nPlease refresh the page and try again.');
        setPythonReady(false);
      }
    };
    loadPython();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadProgress();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (exercises[currentExercise]) {
      setCode(exercises[currentExercise].starterCode);
      setOutput(pythonReady ? 'Ready to run your code!' : 'Loading Python...');
      setIsCorrect(false);
    }
  }, [currentExercise, pythonReady]);

  const loadProgress = async () => {
    try {
      const result = await window.storage.get(`student:${studentName}`, false);
      if (result) {
        const data = JSON.parse(result.value);
        setCompletedExercises(data.completed || []);
      }
    } catch (error) {
      console.log('No previous progress found');
    }
  };

  const saveProgress = async (exerciseNum) => {
    try {
      const completed = [...new Set([...completedExercises, exerciseNum])];
      
      // Save individual progress
      await window.storage.set(`student:${studentName}`, JSON.stringify({
        name: studentName,
        completed: completed,
        completedTitles: completed.map(idx => exercises[idx].title),
        lastAccess: new Date().toISOString()
      }), false);
      setCompletedExercises(completed);

      // Save to teacher's record (shared)
      await window.storage.set(`record:${studentName}`, JSON.stringify({
        name: studentName,
        completed: completed,
        completedTitles: completed.map(idx => exercises[idx].title),
        lastCompleted: new Date().toISOString(),
        completedCount: completed.length
      }), true);
      
      console.log(`✅ Saved: ${studentName} completed exercise ${exerciseNum + 1}`);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const downloadMyProgress = () => {
    const completedTitles = completedExercises.map(idx => exercises[idx].title);
    
    const data = {
      student_name: studentName,
      completed_count: completedExercises.length,
      total_exercises: exercises.length,
      completed_exercise_numbers: completedExercises.map(n => n + 1).join(', '),
      completed_exercise_titles: completedTitles.join('; '),
      completion_date: new Date().toISOString(),
      completion_percentage: Math.round((completedExercises.length / exercises.length) * 100)
    };

    // Create a nicely formatted text file
    const text = `HAUNTED MANSION - STUDENT COMPLETION REPORT
${'='.repeat(50)}

Student Name: ${data.student_name}
Date: ${new Date(data.completion_date).toLocaleString()}

PROGRESS SUMMARY
----------------
Completed: ${data.completed_count} out of ${data.total_exercises} exercises
Completion Rate: ${data.completion_percentage}%

COMPLETED EXERCISES
-------------------
${completedTitles.length > 0 ? completedTitles.map((title, idx) => `${completedExercises[idx] + 1}. ${title}`).join('\n') : 'None yet'}

${'='.repeat(50)}
Please submit this file in Moodle.
`;

    // Download as text file
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studentName.replace(/\s+/g, '_')}_completion_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLogin = () => {
    if (studentName.trim()) {
      setIsLoggedIn(true);
    }
  };

  // Function to get emoji/icon for each cell type
  const getCellEmoji = (cell) => {
    const emojiMap = {
      'W': '🧱', // Wall
      'D': '🚪', // Door
      'R': '🏠', // Room
      'G': '👻', // Ghost
      'K': '🔑', // Key
      'S': '✅', // Safe
      'T': '⚠️'  // Trap
    };
    return emojiMap[cell] || '❓';
  };

  // Function to get background color for each cell type
  const getCellStyle = (cell) => {
    const styleMap = {
      'W': 'bg-gray-700 border-gray-600',
      'D': 'bg-amber-800 border-amber-600',
      'R': 'bg-purple-700 border-purple-500',
      'G': 'bg-indigo-800 border-indigo-600',
      'K': 'bg-yellow-700 border-yellow-500',
      'S': 'bg-green-700 border-green-500',
      'T': 'bg-red-800 border-red-600'
    };
    return styleMap[cell] || 'bg-gray-800 border-gray-600';
  };

  const runCode = async () => {
    if (!pythonReady) {
      setOutput('Python is still loading... please wait.');
      return;
    }

    if (isRunning) {
      return;
    }

    try {
      setIsRunning(true);
      setOutput('Running code...');
      
      const exercise = exercises[currentExercise];
      
      // Run the actual Python code
      const result = await runPythonCode(code);
      
      setOutput(result);
      
      // Check if correct
      const normalizedResult = result.trim().replace(/\s+/g, ' ');
      const normalizedExpected = exercise.expectedOutput.trim().replace(/\s+/g, ' ');
      
      if (normalizedResult === normalizedExpected) {
        setIsCorrect(true);
        setOutput(result + '\n\n✅ Correct! You escaped this room!');
        saveProgress(currentExercise);
      } else {
        setIsCorrect(false);
        setOutput(result + '\n\n❌ Not quite right. Try again!');
      }
    } catch (error) {
      setOutput('Error: ' + error.message);
      setIsCorrect(false);
    } finally {
      setIsRunning(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black text-white p-8">
        <div className="max-w-md mx-auto mt-20">
          <div className="text-center mb-8">
            <Ghost className="w-20 h-20 mx-auto mb-4 animate-bounce" />
            <h1 className="text-4xl font-bold mb-2">🏚️ Haunted Mansion</h1>
            <p className="text-purple-200">2D Array Practice Adventure</p>
          </div>
          
          <div className="bg-purple-800 bg-opacity-50 p-6 rounded-lg backdrop-blur">
            <label className="block mb-2 text-sm">Enter your name to begin:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full p-3 rounded bg-purple-900 border border-purple-600 focus:outline-none focus:border-purple-400 mb-4"
              placeholder="Your name..."
            />
            <button
              onClick={handleLogin}
              className="w-full bg-purple-600 hover:bg-purple-500 p-3 rounded font-bold transition"
            >
              Enter the Mansion
            </button>
          </div>
        </div>
      </div>
    );
  }

  const exercise = exercises[currentExercise];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {studentName}!</h1>
            <p className="text-purple-300">Progress: {completedExercises.length} / {exercises.length} rooms escaped</p>
          </div>
          <button
            onClick={downloadMyProgress}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded flex items-center gap-2"
            title="Download your completion report to submit to instructor"
          >
            📥 Download My Report
          </button>
        </div>

        {/* Exercise Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {exercises.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentExercise(idx)}
              className={`px-4 py-2 rounded whitespace-nowrap flex items-center gap-2 ${
                currentExercise === idx
                  ? 'bg-purple-600'
                  : completedExercises.includes(idx)
                  ? 'bg-green-700'
                  : 'bg-purple-800'
              }`}
            >
              {completedExercises.includes(idx) && <CheckCircle className="w-4 h-4" />}
              Room {idx + 1}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Exercise Description */}
          <div className="space-y-4">
            <div className="bg-purple-800 bg-opacity-50 p-6 rounded-lg backdrop-blur">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <DoorOpen className="w-6 h-6" />
                {exercise.title}
              </h2>
              <p className="text-purple-200 mb-4">{exercise.description}</p>
              
              <div className="bg-black bg-opacity-50 p-4 rounded mb-4">
                <h3 className="font-bold mb-3">The Mansion Layout:</h3>
                
                {/* Visual Grid */}
                <div className="mb-4 flex justify-center">
                  <div className="inline-block">
                    {/* Column indices header */}
                    <div className="flex gap-1 mb-1">
                      <div className="w-10"></div> {/* Empty corner */}
                      {exercise.mansion[0].map((_, colIdx) => (
                        <div
                          key={`col-${colIdx}`}
                          className="w-14 h-8 flex items-center justify-center text-sm font-bold text-cyan-400"
                        >
                          {colIdx}
                        </div>
                      ))}
                    </div>
                    
                    {/* Grid with row indices */}
                    {exercise.mansion.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex gap-1 mb-1">
                        {/* Row index */}
                        <div className="w-10 h-14 flex items-center justify-center text-sm font-bold text-cyan-400">
                          {rowIdx}
                        </div>
                        {row.map((cell, colIdx) => (
                          <div
                            key={`${rowIdx}-${colIdx}`}
                            className={`w-14 h-14 flex flex-col items-center justify-center border-2 rounded ${getCellStyle(cell)} transition-all hover:scale-110 hover:shadow-lg hover:z-10 relative`}
                            title={`mansion[${rowIdx}][${colIdx}] = '${cell}'`}
                          >
                            <span className="text-2xl">{getCellEmoji(cell)}</span>
                            <span className="text-xs font-mono mt-1">{cell}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    
                    {/* Index labels */}
                    <div className="text-xs text-cyan-300 mt-2 text-center">
                      <span className="font-semibold">↑ columns (j) →</span>
                      <span className="ml-4">← rows (i) ↓</span>
                    </div>
                  </div>
                </div>

                {/* Text representation */}
                <details className="cursor-pointer">
                  <summary className="text-xs text-purple-300 hover:text-purple-100">
                    Show as text/array
                  </summary>
                  <div className="font-mono text-sm space-y-1 mt-2">
                    {exercise.mansion.map((row, idx) => (
                      <div key={idx}>{row.join(' ')}</div>
                    ))}
                  </div>
                </details>
                
                <div className="text-xs text-purple-300 mt-3 grid grid-cols-2 gap-1">
                  <div>🧱 W=Wall</div>
                  <div>🚪 D=Door</div>
                  <div>🏠 R=Room</div>
                  <div>👻 G=Ghost</div>
                  <div>🔑 K=Key</div>
                  <div>✅ S=Safe</div>
                  <div>⚠️ T=Trap</div>
                </div>
              </div>

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 p-3 rounded">
                <h3 className="font-bold mb-1">Task:</h3>
                <p className="text-sm">{exercise.task}</p>
              </div>

              <div className="mt-4 bg-blue-900 bg-opacity-30 border border-blue-600 p-3 rounded">
                <h3 className="font-bold mb-1">💡 Hint:</h3>
                <p className="text-sm">{exercise.hint}</p>
              </div>
            </div>
          </div>

          {/* Right: Code Editor */}
          <div className="space-y-4">
            <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg backdrop-blur">
              <h3 className="font-bold mb-2">Your Python Code:</h3>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-3 bg-black bg-opacity-50 rounded font-mono text-sm border border-purple-600 focus:outline-none focus:border-purple-400"
                spellCheck="false"
              />
              <button
                onClick={runCode}
                disabled={!pythonReady || isRunning}
                className={`w-full mt-2 p-3 rounded font-bold transition ${
                  pythonReady && !isRunning
                    ? 'bg-green-600 hover:bg-green-500'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {isRunning ? '⏳ Running...' : '▶ Run Code'}
              </button>
            </div>

            <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg backdrop-blur">
              <h3 className="font-bold mb-2">Output:</h3>
              <pre className="bg-black bg-opacity-50 p-3 rounded font-mono text-sm whitespace-pre-wrap min-h-[100px]">
                {output || 'Click "Run Code" to see output...'}
              </pre>
            </div>

            {isCorrect && currentExercise < exercises.length - 1 && (
              <button
                onClick={() => setCurrentExercise(currentExercise + 1)}
                className="w-full bg-purple-600 hover:bg-purple-500 p-3 rounded font-bold transition"
              >
                Next Room →
              </button>
            )}

            {completedExercises.length === exercises.length && (
              <div className="bg-green-800 bg-opacity-50 p-6 rounded-lg text-center">
                <Skull className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">🎉 You Escaped!</h3>
                <p>Congratulations! You've mastered 2D arrays!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HauntedMansion;

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
  const [selectedCell, setSelectedCell] = useState(null);

  const exercises = [
    // ===== EASY EXERCISES =====
    {
      title: "Room 1: The Entrance Hall",
      description: "You enter a dark mansion. The rooms are arranged in a 3x3 grid. Find all the doors (represented by 'D').",
      difficulty: "easy",
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
      difficulty: "easy",
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
      difficulty: "easy",
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
      difficulty: "easy",
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
      difficulty: "easy",
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
    },
    
    // ===== HARD EXERCISES =====
    {
      title: "🔥 Challenge: The Treasure Map",
      description: "A 4x4 mansion has multiple treasures ('X'). Find the coordinates of ALL treasures and calculate the total 'distance' between adjacent treasures. Distance is the sum of differences in row and column positions (Manhattan distance).",
      difficulty: "hard",
      mansion: [
        ['R', 'X', 'R', 'W'],
        ['W', 'R', 'R', 'X'],
        ['X', 'W', 'R', 'R'],
        ['R', 'R', 'X', 'W']
      ],
      task: "Write a function treasure_distance(mansion) that finds all treasures and calculates the total Manhattan distance between consecutive treasure pairs. Return a tuple: (list of coordinates, total distance). Treasures should be found in row-major order (left-to-right, top-to-bottom).",
      starterCode: `def treasure_distance(mansion):
    # Your code here
    # 1. Find all 'X' positions as (row, col) tuples
    # 2. Calculate Manhattan distance between consecutive pairs
    # 3. Manhattan distance = |row1-row2| + |col1-col2|
    pass

# Test your function
mansion = [
    ['R', 'X', 'R', 'W'],
    ['W', 'R', 'R', 'X'],
    ['X', 'W', 'R', 'R'],
    ['R', 'R', 'X', 'W']
]
result = treasure_distance(mansion)
print(result)`,
      expectedOutput: "([(0, 1), (1, 3), (2, 0), (3, 2)], 10)",
      hint: "First, collect all treasure positions. Then, for each consecutive pair, calculate |r1-r2| + |c1-c2| and sum them up. Remember: distance from (0,1) to (1,3) is |0-1| + |1-3| = 1 + 2 = 3"
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
      setSelectedCell(null); // Clear selected cell when changing exercise
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
      'T': '⚠️',  // Trap
      'X': '💎'  // Treasure
    };
    return emojiMap[cell] || '❓';
  };

  // Function to get background color for each cell type
  const getCellStyle = (cell) => {
    const styleMap = {
      'W': 'bg-gray-700 border-gray-600',
      'D': 'bg-amber-800 border-amber-600',
      'R': 'bg-teal-700 border-teal-500',
      'G': 'bg-indigo-800 border-indigo-600',
      'K': 'bg-yellow-700 border-yellow-500',
      'S': 'bg-green-700 border-green-500',
      'T': 'bg-red-800 border-red-600',
      'X': 'bg-cyan-700 border-cyan-500'
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
      <div className="min-h-screen bg-gradient-to-b from-teal-900 via-teal-800 to-gray-900 text-white p-8">
        <div className="max-w-md mx-auto mt-20">
          <div className="text-center mb-8">
            <Ghost className="w-20 h-20 mx-auto mb-4 animate-bounce" />
            <h1 className="text-4xl font-bold mb-2">🏚️ Haunted Mansion</h1>
            <p className="text-teal-200">2D Array Practice Adventure</p>
          </div>
          
          <div className="bg-teal-800 bg-opacity-50 p-6 rounded-lg backdrop-blur">
            <label className="block mb-2 text-sm">Enter your name to begin:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full p-3 rounded bg-teal-900 border border-teal-600 focus:outline-none focus:border-teal-400 mb-4"
              placeholder="Your name..."
            />
            <button
              onClick={handleLogin}
              className="w-full bg-emerald-600 hover:bg-emerald-500 p-3 rounded font-bold transition"
            >
              Enter the Mansion
            </button>
          </div>
        </div>
      </div>
    );
  }

  const exercise = exercises[currentExercise];
  const easyExercises = exercises.filter(ex => ex.difficulty === 'easy');
  const hardExercises = exercises.filter(ex => ex.difficulty === 'hard');

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-900 via-teal-800 to-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {studentName}!</h1>
            <p className="text-teal-300">Progress: {completedExercises.length} / {exercises.length} rooms escaped</p>
          </div>
          <button
            onClick={downloadMyProgress}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded flex items-center gap-2"
            title="Download your completion report to submit to instructor"
          >
            📥 Download My Report
          </button>
        </div>

        {/* Exercise Navigation - Grouped by Difficulty */}
        <div className="mb-6 space-y-3">
          {/* Easy Section */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-300 mb-2">📚 EASY</h3>
            <div className="flex gap-2 flex-wrap">
              {exercises.map((ex, idx) => ex.difficulty === 'easy' && (
                <button
                  key={idx}
                  onClick={() => setCurrentExercise(idx)}
                  className={`px-4 py-2 rounded whitespace-nowrap flex items-center gap-2 ${
                    currentExercise === idx
                      ? 'bg-emerald-600 ring-2 ring-emerald-400'
                      : completedExercises.includes(idx)
                      ? 'bg-green-700'
                      : 'bg-teal-800'
                  }`}
                >
                  {completedExercises.includes(idx) && <CheckCircle className="w-4 h-4" />}
                  Room {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Hard Section */}
          <div>
            <h3 className="text-sm font-semibold text-orange-300 mb-2">🔥 HARD</h3>
            <div className="flex gap-2 flex-wrap">
              {exercises.map((ex, idx) => ex.difficulty === 'hard' && (
                <button
                  key={idx}
                  onClick={() => setCurrentExercise(idx)}
                  className={`px-4 py-2 rounded whitespace-nowrap flex items-center gap-2 ${
                    currentExercise === idx
                      ? 'bg-orange-600 ring-2 ring-orange-400'
                      : completedExercises.includes(idx)
                      ? 'bg-green-700'
                      : 'bg-orange-800'
                  }`}
                >
                  {completedExercises.includes(idx) && <CheckCircle className="w-4 h-4" />}
                  Challenge {idx - easyExercises.length + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Exercise Description */}
          <div className="space-y-4">
            <div className="bg-teal-800 bg-opacity-50 p-6 rounded-lg backdrop-blur">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <DoorOpen className="w-6 h-6" />
                {exercise.title}
              </h2>
              <p className="text-teal-200 mb-4">{exercise.description}</p>
              
              <div className="bg-black bg-opacity-50 p-4 rounded mb-4">
                <h3 className="font-bold mb-3">The Mansion Layout:</h3>
                
                {/* Show selected cell info */}
                {selectedCell ? (
                  <div className="mb-3 p-2 bg-cyan-900 bg-opacity-50 border border-cyan-500 rounded text-center">
                    <span className="font-mono text-cyan-300">
                      mansion[{selectedCell.row}][{selectedCell.col}] = '{selectedCell.value}'
                    </span>
                    <button
                      onClick={() => setSelectedCell(null)}
                      className="ml-3 text-xs bg-cyan-700 hover:bg-cyan-600 px-2 py-1 rounded"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="mb-3 p-2 bg-teal-900 bg-opacity-30 border border-teal-500 rounded text-center text-sm text-teal-300">
                    Click on any cell to see its array position
                  </div>
                )}
                
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
                        {row.map((cell, colIdx) => {
                          const isSelected = selectedCell && selectedCell.row === rowIdx && selectedCell.col === colIdx;
                          return (
                            <div
                              key={`${rowIdx}-${colIdx}`}
                              className={`w-14 h-14 flex flex-col items-center justify-center border-2 rounded ${getCellStyle(cell)} transition-all hover:scale-105 hover:shadow-lg hover:z-10 relative cursor-pointer
                                ${isSelected ? 'ring-4 ring-cyan-400 scale-110' : ''}
                              `}
                              onClick={() => setSelectedCell({ row: rowIdx, col: colIdx, value: cell })}
                            >
                              <span className="text-2xl">{getCellEmoji(cell)}</span>
                              <span className="text-xs font-mono mt-1">{cell}</span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Text representation */}
                <details className="cursor-pointer">
                  <summary className="text-xs text-teal-300 hover:text-teal-100">
                    Show as text/array
                  </summary>
                  <div className="font-mono text-sm space-y-1 mt-2">
                    {exercise.mansion.map((row, idx) => (
                      <div key={idx}>{row.join(' ')}</div>
                    ))}
                  </div>
                </details>
                
                <div className="text-xs text-teal-300 mt-3 grid grid-cols-2 gap-1">
                  <div>🧱 W=Wall</div>
                  <div>🚪 D=Door</div>
                  <div>🏠 R=Room</div>
                  <div>👻 G=Ghost</div>
                  <div>🔑 K=Key</div>
                  <div>✅ S=Safe</div>
                  <div>⚠️ T=Trap</div>
                  <div>💎 X=Treasure</div>
                </div>
              </div>

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 p-3 rounded">
                <h3 className="font-bold mb-1">📝 Task:</h3>
                <p className="text-sm">{exercise.task}</p>
              </div>

              <div className="mt-4 bg-blue-900 bg-opacity-30 border border-blue-600 p-3 rounded">
                <h3 className="font-bold mb-2">💡 Hint:</h3>
                <p className="text-sm mb-2">{exercise.hint}</p>
              </div>

              {/* Quick Reference */}
              <div className="mt-4 bg-teal-900 bg-opacity-40 border border-teal-500 p-3 rounded text-xs">
                <h4 className="font-bold mb-2 text-sm">📚 Quick Reference:</h4>
                <div className="space-y-1 font-mono">
                  <div><span className="text-cyan-400">mansion[0][0]</span> = first row, first column (top-left)</div>
                  <div><span className="text-cyan-400">len(mansion)</span> = number of rows</div>
                  <div><span className="text-cyan-400">len(mansion[0])</span> = number of columns</div>
                  <div><span className="text-cyan-400">for row in mansion:</span> = iterate through each row</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Code Editor */}
          <div className="space-y-4">
            <div className="bg-teal-800 bg-opacity-50 p-4 rounded-lg backdrop-blur">
              <h3 className="font-bold mb-2">Your Python Code:</h3>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-3 bg-black bg-opacity-50 rounded font-mono text-sm border border-teal-600 focus:outline-none focus:border-teal-400"
                spellCheck="false"
              />
              <button
                onClick={runCode}
                disabled={!pythonReady || isRunning}
                className={`w-full mt-2 p-3 rounded font-bold transition ${
                  pythonReady && !isRunning
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {isRunning ? '⏳ Running...' : '▶ Run Code'}
              </button>
            </div>

            <div className="bg-teal-800 bg-opacity-50 p-4 rounded-lg backdrop-blur">
              <h3 className="font-bold mb-2">Output:</h3>
              <pre className="bg-black bg-opacity-50 p-3 rounded font-mono text-sm whitespace-pre-wrap min-h-[100px]">
                {output || 'Click "Run Code" to see output...'}
              </pre>
            </div>

            {isCorrect && currentExercise < exercises.length - 1 && (
              <button
                onClick={() => setCurrentExercise(currentExercise + 1)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 p-3 rounded font-bold transition"
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

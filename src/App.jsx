import React, { useState, useEffect } from 'react';
import { Ghost, DoorOpen, Key, Skull, CheckCircle, Users } from 'lucide-react';
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
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

  const loadLeaderboard = async () => {
    try {
      const keys = await window.storage.list('record:', true);
      if (keys && keys.keys) {
        const students = [];
        for (const key of keys.keys) {
          try {
            const result = await window.storage.get(key, true);
            if (result) {
              students.push(JSON.parse(result.value));
            }
          } catch (error) {
            console.log('Could not load student:', key);
          }
        }
        students.sort((a, b) => b.completedCount - a.completedCount);
        setLeaderboardData(students);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const downloadRecords = () => {
    const data = leaderboardData.map(student => ({
      Name: student.name,
      'Completed Count': student.completedCount,
      'Completed Exercises': student.completedTitles ? student.completedTitles.join('; ') : '',
      'Last Activity': new Date(student.lastCompleted).toLocaleString()
    }));

    // Convert to CSV
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-records-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => {
              setShowLeaderboard(false);
              loadLeaderboard();
            }}
            className="mb-4 text-purple-300 hover:text-white"
          >
            ← Back to Exercises
          </button>
          
          <div className="text-center mb-8">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold">Student Records</h2>
            <p className="text-purple-300 mt-2">Track who completed which exercises</p>
          </div>

          <div className="bg-purple-800 bg-opacity-50 p-6 rounded-lg backdrop-blur">
            <div className="flex gap-2 mb-4">
              <button
                onClick={loadLeaderboard}
                className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded"
              >
                🔄 Refresh Data
              </button>
              {leaderboardData.length > 0 && (
                <button
                  onClick={downloadRecords}
                  className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
                >
                  📥 Download CSV
                </button>
              )}
            </div>

            {leaderboardData.length === 0 ? (
              <p className="text-center text-purple-300">No student records yet.</p>
            ) : (
              <div className="space-y-3">
                {leaderboardData.map((student, idx) => (
                  <div key={idx} className="bg-purple-900 bg-opacity-50 p-4 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-lg">{student.name}</span>
                        <span className="text-purple-300 ml-2">
                          ({student.completedCount} / {exercises.length} completed)
                        </span>
                      </div>
                      <div className="text-sm text-purple-400">
                        {new Date(student.lastCompleted).toLocaleString()}
                      </div>
                    </div>
                    {student.completedTitles && student.completedTitles.length > 0 && (
                      <div className="text-sm text-purple-200 mt-2">
                        <span className="font-semibold">Completed: </span>
                        {student.completedTitles.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
          <div className="flex gap-2">
            <button
              onClick={downloadMyProgress}
              className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded flex items-center gap-2"
              title="Download your completion report to submit to instructor"
            >
              📥 Download My Report
            </button>
            <button
              onClick={() => {
                setShowLeaderboard(true);
                loadLeaderboard();
              }}
              className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              Student Records
            </button>
          </div>
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
                <h3 className="font-bold mb-2">The Mansion Layout:</h3>
                <div className="font-mono text-sm space-y-1">
                  {exercise.mansion.map((row, idx) => (
                    <div key={idx}>{row.join(' ')}</div>
                  ))}
                </div>
                <p className="text-xs text-purple-300 mt-2">
                  W=Wall, D=Door, R=Room, G=Ghost, K=Key, S=Safe, T=Trap
                </p>
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

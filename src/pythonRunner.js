// Python runner using Pyodide (Python in the browser)
let pyodide = null;
let isLoading = false;
let loadPromise = null;

// Load Pyodide script dynamically
const loadPyodideScript = () => {
  return new Promise((resolve, reject) => {
    if (window.loadPyodide) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pyodide script'));
    document.head.appendChild(script);
  });
};

export const initPython = async () => {
  if (pyodide) return pyodide;
  if (isLoading) return loadPromise;
  
  isLoading = true;
  loadPromise = (async () => {
    try {
      console.log('Loading Pyodide script...');
      await loadPyodideScript();
      
      console.log('Initializing Pyodide...');
      const pyodideModule = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      });
      
      console.log('Pyodide loaded successfully!');
      pyodide = pyodideModule;
      isLoading = false;
      return pyodide;
    } catch (error) {
      isLoading = false;
      console.error('Pyodide loading error:', error);
      throw new Error('Failed to load Python environment: ' + error.message);
    }
  })();
  
  return loadPromise;
};

export const runPythonCode = async (code) => {
  try {
    if (!pyodide) {
      await initPython();
    }

    // Capture stdout
    let output = '';
    pyodide.setStdout({
      batched: (text) => {
        output += text + '\n';
      }
    });

    // Run the code
    await pyodide.runPythonAsync(code);

    return output.trim();
  } catch (error) {
    // Return error message
    throw new Error(error.message);
  }
};

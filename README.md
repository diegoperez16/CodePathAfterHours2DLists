# 🏚️ Haunted Mansion - 2D Array Practice

An interactive Python learning platform for practicing 2D arrays, built with React and Pyodide.

## Features

- **Real Python Execution**: Uses Pyodide to run actual Python code in the browser
- **Student Progress Tracking**: Saves student progress using browser localStorage
- **Leaderboard**: View all students' progress
- **5 Progressive Exercises**: Learn 2D array manipulation step by step

## Setup Instructions

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**: Navigate to `http://localhost:5173`

### Deploy to GitHub Pages

1. **Update `vite.config.js`**: Change the `base` property to match your repository name:
   ```javascript
   base: '/your-repo-name/'
   ```

2. **Push to GitHub**: Push your code to the `main` branch

3. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to Pages
   - Under "Build and deployment", select "GitHub Actions" as the source
   - The site will automatically deploy when you push to main

4. **Access your site**: After deployment, your site will be available at:
   `https://yourusername.github.io/your-repo-name/`

## How It Works

### Storage
- Student data is stored in browser localStorage
- Each student's progress is saved individually
- A shared leaderboard shows all students' progress
- Data persists across sessions on the same browser

### Python Execution
- Uses **Pyodide** to run Python directly in the browser
- No server needed - everything runs client-side
- Students write real Python code that gets executed
- Answers are validated against expected outputs

### Student Experience
1. Enter their name to login
2. Complete exercises in order
3. Write Python code to solve 2D array problems
4. Get instant feedback on their solutions
5. Track progress and see leaderboard

## Limitations

- **Browser Storage**: Data is stored locally in each student's browser. If they clear their browser data or use a different browser/computer, their progress will be lost.
- **No Shared Database**: Students can only see others' progress who have used the same browser/computer.
- **No Authentication**: Simple name-based login (no passwords).

## Upgrading to Cloud Storage (Optional)

If you want true multi-user support with shared data, you'll need to:

1. Set up a backend (e.g., Firebase, Supabase, or custom Node.js server)
2. Replace `storageService.js` to use API calls instead of localStorage
3. Add proper authentication

## Technologies Used

- **React**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Pyodide**: Python runtime in browser
- **Lucide React**: Icons
- **GitHub Pages**: Hosting

## License

MIT

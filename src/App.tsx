import { useEffect } from 'react';
import useKanbanStore from './lib/store/kanban-store';
import { KanbanBoard } from './components/KanbanBoard';
import { BoardSelector } from './components/BoardSelector';
import { Button } from './components/ui/button';
import { Github, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

function App() {
  const { boards, activeBoard, createBoard } = useKanbanStore();
  const [darkMode, setDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Create a default board if none exists
  useEffect(() => {
    if (boards.length === 0) {
      createBoard('My First Board');
    }
  }, [boards, createBoard]);

  // Handle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Get the active board data
  const activeBoardData = boards.find((board) => board.id === activeBoard);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-blue-600 bg-clip-text text-transparent dark:from-purple-500 dark:to-blue-400">
                Kanban Board Pro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com/your-username/kanban-board" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Github size={20} />
              </a>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg h-[calc(100vh-9rem)] overflow-hidden">
          <BoardSelector />
          
          {activeBoardData ? (
            <KanbanBoard board={activeBoardData} />
          ) : (
            <div className="flex flex-col items-center justify-center h-96">
              <h2 className="text-xl font-medium text-gray-500 dark:text-gray-400">
                No board selected
              </h2>
              <p className="text-gray-400 dark:text-gray-500 mt-1">
                Please select or create a board to get started
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

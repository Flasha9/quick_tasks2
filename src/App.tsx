import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { HomeScreen } from './components/HomeScreen';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TaskProvider>
        <HomeScreen />
      </TaskProvider>
    </ThemeProvider>
  );
};

export default App;

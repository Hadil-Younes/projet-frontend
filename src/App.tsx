import React from 'react';
import './App.css';
import LoginForm from './components/LoginForm';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Authentification</h1>
        <LoginForm />
      </header>
    </div>
  );
}

export default App;
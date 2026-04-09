import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return <Dashboard />;
}


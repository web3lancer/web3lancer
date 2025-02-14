import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function AppPage() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: 240, padding: '20px', width: '100%' }}>
        <Header />
        <main>
          <h1>Welcome to the Web3Lancer App</h1>
          {/* Add your app content here */}
        </main>
      </div>
    </div>
  );
}

import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ...existing code... */}
      </head>
      <body style={{ display: 'flex', backgroundColor: '#f4f4f4' }}>
        <Sidebar />
        <div style={{ marginLeft: 240, padding: '20px', width: '100%' }}>
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}

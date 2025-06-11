import { NextResponse } from 'next/server';

export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ML Dashboard Unavailable</title>
      <style>
        :root {
          --primary-color: #0ea5e9;
          --bg-color: #0f172a;
          --text-color: #f1f5f9;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background: linear-gradient(135deg, var(--bg-color) 0%, #0c111d 100%);
          color: var(--text-color);
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .container {
          max-width: 600px;
          padding: 2rem;
          text-align: center;
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        
        h1 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          color: #f59e0b;
        }
        
        p {
          margin-bottom: 1.5rem;
          line-height: 1.6;
          font-size: 1.1rem;
        }
        
        .icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          color: #f59e0b;
        }
        
        .reasons {
          text-align: left;
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }
        
        .reasons li {
          margin-bottom: 0.5rem;
          color: #94a3b8;
        }
        
        .refresh-button {
          background: linear-gradient(90deg, #0ea5e9, #0c4a6e);
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          margin-top: 1rem;
        }
        
        .refresh-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
          background: linear-gradient(90deg, #38bdf8, #0e7490);
        }
        
        .refresh-icon {
          margin-right: 8px;
          animation: spin 2s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">⚠️</div>
        <h1>ML Dashboard Unavailable</h1>
        <p>The Machine Learning Dashboard service is currently unavailable. The system has tried multiple ports but could not connect to any dashboard instance.</p>
        
        <ul class="reasons">
          <li>The dashboard service might not be running</li>
          <li>The system might be experiencing high load</li>
          <li>Network connectivity issues between services</li>
          <li>The dashboard process may have crashed</li>
        </ul>
        
        <p>You can try refreshing this page or starting the dashboard service using the run_both.py script.</p>
        
        <button class="refresh-button" onclick="window.location.reload()">
          <span class="refresh-icon">↻</span>
          Refresh Page
        </button>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

export async function POST() {
  return new NextResponse(JSON.stringify({ 
    error: 'ML Dashboard service unavailable', 
    status: 'down',
    timestamp: new Date().toISOString(),
    ports_checked: [8503, 8502, 8501]
  }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

// Return the same error for all HTTP methods
export const HEAD = GET;
export const PUT = POST;
export const DELETE = POST;
export const PATCH = POST; 
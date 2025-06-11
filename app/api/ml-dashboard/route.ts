import { NextRequest, NextResponse } from 'next/server';

// Add dynamic route configuration to fix static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Use the URL from the request object instead of request.url
    const url = new URL(request.nextUrl);
    const section = url.searchParams.get('section') || '';
    
    // Build the target URL for the Streamlit dashboard
    const streamlitUrl = process.env.NEXT_PUBLIC_ML_DASHBOARD_URL || 'http://localhost:8503';
    const targetUrl = section ? `${streamlitUrl}/?section=${section}` : streamlitUrl;
    
    // Forward the request to Streamlit
    const streamlitResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'ML-Dashboard-Proxy',
        'Accept': request.headers.get('accept') || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!streamlitResponse.ok) {
      throw new Error(`Streamlit returned ${streamlitResponse.status}`);
    }

    const content = await streamlitResponse.text();
    
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('ML Dashboard proxy error:', error);
    
    // Return a fallback HTML page with error message
    const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>ML Dashboard - Unavailable</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                background: #1e293b; 
                color: #e2e8f0; 
                padding: 2rem; 
                text-align: center; 
            }
            .error-container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #334155; 
                padding: 2rem; 
                border-radius: 0.5rem; 
            }
            .retry-btn { 
                background: #3b82f6; 
                color: white; 
                border: none; 
                padding: 0.5rem 1rem; 
                border-radius: 0.25rem; 
                cursor: pointer; 
                margin-top: 1rem; 
            }
        </style>
    </head>
    <body>
        <div class="error-container">
            <h1>ML Dashboard Unavailable</h1>
            <p>The ML Dashboard service is currently not available. Please check that the Streamlit service is running on port 8503.</p>
            <button class="retry-btn" onclick="window.location.reload()">Retry</button>
            <br><br>
            <a href="/dashboard/overview" style="color: #60a5fa;">← Back to Main Dashboard</a>
        </div>
    </body>
    </html>
    `;
    
    return new NextResponse(errorHtml, {
      status: 503,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
} 
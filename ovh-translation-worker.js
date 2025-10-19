/**
 * Cloudflare Worker: OVH Translation API Wrapper
 * Mit Basic Auth und eingebettetem HTML-Frontend
 * Version 1.0
 */

// HTML Frontend (wird bei GET / ausgeliefert)
const HTML_PAGE = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌍 Übersetzungs-Tool</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 700px;
            width: 100%;
            padding: 40px;
        }
        h1 {
            color: #333;
            font-size: 32px;
            margin-bottom: 10px;
            text-align: center;
        }
        .subtitle {
            color: #666;
            font-size: 15px;
            text-align: center;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
            font-size: 14px;
        }
        input, select, textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 15px;
            transition: all 0.3s;
            font-family: inherit;
        }
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        textarea {
            resize: vertical;
            min-height: 120px;
        }
        .button {
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        .button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .language-row {
            display: grid,
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .result-box {
            margin-top: 20px;
            padding: 20px;
            border-radius: 8px;
            animation: slideIn 0.3s ease;
        }
        .result-box.success {
            background: #f0f7ff;
            border-left: 4px solid #667eea;
        }
        .result-box.error {
            background: #fff5f5;
            border-left: 4px solid #e53e3e;
        }
        .result-box h3 {
            margin-bottom: 12px;
            font-size: 16px;
            color: #333;
        }
        .result-text {
            color: #555;
            line-height: 1.7;
            font-size: 15px;
        }
        .error-text {
            color: #c53030;
        }
        .hidden {
            display: none;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.8s linear infinite;
            margin-left: 8px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌍 Übersetzungs-Tool</h1>
        <p class="subtitle">KI-gestützte Übersetzung mit OVH AI</p>

        <div class="language-row">
            <div class="form-group">
                <label for="fromLang">Von Sprache</label>
                <select id="fromLang">
                    <option value="English">Englisch</option>
                    <option value="German">Deutsch</option>
                    <option value="French">Französisch</option>
                    <option value="Spanish">Spanisch</option>
                    <option value="Italian">Italienisch</option>
                    <option value="Portuguese">Portugiesisch</option>
                </select>
            </div>
            <div class="form-group">
                <label for="toLang">Zu Sprache</label>
                <select id="toLang">
                    <option value="French">Französisch</option>
                    <option value="German">Deutsch</option>
                    <option value="English">Englisch</option>
                    <option value="Spanish">Spanisch</option>
                    <option value="Italian">Italienisch</option>
                    <option value="Portuguese">Portugiesisch</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label for="textInput">Text zum Übersetzen</label>
            <textarea id="textInput" placeholder="Gib hier deinen Text ein...">Brian is in the kitchen</textarea>
        </div>

        <button class="button" id="translateBtn" onclick="translate()">
            Übersetzen
        </button>

        <div id="result" class="hidden"></div>
    </div>

    <script>
        async function translate() {
            const btn = document.getElementById('translateBtn');
            const result = document.getElementById('result');
            const text = document.getElementById('textInput').value;
            const fromLang = document.getElementById('fromLang').value;
            const toLang = document.getElementById('toLang').value;

            result.classList.add('hidden');

            if (!text.trim()) {
                showResult('Bitte gib einen Text ein', true);
                return;
            }

            btn.disabled = true;
            btn.innerHTML = 'Wird übersetzt...<span class="spinner"></span>';

            try {
                const response = await fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, from: fromLang, target: toLang })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    showResult(data.translated, false);
                } else {
                    showResult(data.error || 'Übersetzung fehlgeschlagen', true);
                }
            } catch (error) {
                showResult('Fehler: ' + error.message, true);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Übersetzen';
            }
        }

        function showResult(text, isError) {
            const result = document.getElementById('result');
            result.className = 'result-box ' + (isError ? 'error' : 'success');
            result.innerHTML = \`
                <h3>\${isError ? '❌ Fehler' : '✓ Übersetzung'}</h3>
                <p class="\${isError ? 'error-text' : 'result-text'}">\${text}</p>
            \`;
            result.classList.remove('hidden');
        }
    </script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    // Basic Auth Middleware
    if (env.BASIC_AUTH_USERNAME && env.BASIC_AUTH_PASSWORD) {
      const authHeader = request.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return new Response(JSON.stringify({
          error: 'Authentication Required',
          detail: 'Please provide valid credentials'
        }), {
          status: 401,
          headers: {
            ...corsHeaders,
            'WWW-Authenticate': 'Basic realm="Translation API", charset="UTF-8"',
            'Content-Type': 'application/json'
          }
        });
      }

      try {
        const base64Credentials = authHeader.substring(6);
        const credentials = atob(base64Credentials);
        const [username, password] = credentials.split(':');

        if (username !== env.BASIC_AUTH_USERNAME || password !== env.BASIC_AUTH_PASSWORD) {
          return new Response(JSON.stringify({
            error: 'Invalid Credentials',
            detail: 'Username or password is incorrect'
          }), {
            status: 401,
            headers: {
              ...corsHeaders,
              'WWW-Authenticate': 'Basic realm="Translation API", charset="UTF-8"',
              'Content-Type': 'application/json'
            }
          });
        }
        
        console.log('✅ Basic Auth successful for user:', username);
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Invalid Authorization Header',
          detail: 'Could not parse credentials'
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }

    const url = new URL(request.url);

    try {
      // Frontend: Zeige HTML-Seite
      if (url.pathname === '/' && request.method === 'GET') {
        return new Response(HTML_PAGE, {
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
          }
        });
      }

      // API: Health check
      if (url.pathname === '/health' || url.pathname === '/api/health') {
        return Response.json({
          status: 'ok',
          message: 'Translation API is running',
          version: '1.0.0',
          endpoints: {
            translate: '/api/translate',
            health: '/api/health'
          }
        }, {
          headers: corsHeaders
        });
      }

      // API: Translation endpoint
      if (url.pathname === '/api/translate' && request.method === 'POST') {
        const body = await request.json();
        
        console.log('Translation request:', {
          text: body.text?.substring(0, 50),
          from: body.from,
          target: body.target
        });

        // Validate input
        if (!body.text || body.text.trim().length === 0) {
          return Response.json({
            success: false,
            error: 'Text ist erforderlich'
          }, {
            status: 400,
            headers: corsHeaders
          });
        }

        const fromLang = body.from || 'English';
        const targetLang = body.target || 'French';

        // Prepare OVH API request
        const ovhUrl = `https://t5-large.endpoints.kepler.ai.cloud.ovh.net/api/translate?from=${encodeURIComponent(fromLang)}&target=${encodeURIComponent(targetLang)}`;
        
        const ovhHeaders = {
          'Content-Type': 'text/plain',
        };

        // Add Bearer token if available
        const accessToken = env.OVH_AI_ENDPOINTS_ACCESS_TOKEN || env.OVH_API_KEY;
        if (accessToken) {
          ovhHeaders['Authorization'] = `Bearer ${accessToken}`;
        } else {
          console.warn('⚠️ No API token found! Set: wrangler secret put OVH_AI_ENDPOINTS_ACCESS_TOKEN');
        }

        console.log('Calling OVH API:', ovhUrl);

        // Call OVH Translation API
        const ovhResponse = await fetch(ovhUrl, {
          method: 'POST',
          headers: ovhHeaders,
          body: body.text
        });

        if (!ovhResponse.ok) {
          const errorText = await ovhResponse.text();
          console.error('OVH API error:', {
            status: ovhResponse.status,
            statusText: ovhResponse.statusText,
            body: errorText
          });
          
          return Response.json({
            success: false,
            error: `OVH API error: ${ovhResponse.status} ${ovhResponse.statusText}`,
            detail: errorText
          }, {
            status: ovhResponse.status,
            headers: corsHeaders
          });
        }

        const translatedText = await ovhResponse.text();
        
        console.log('Translation successful');

        return Response.json({
          success: true,
          original: body.text,
          translated: translatedText,
          from: fromLang,
          target: targetLang
        }, {
          headers: corsHeaders
        });
      }

      // 404 für unbekannte Routen
      return Response.json({
        error: 'Not Found',
        detail: `Endpoint ${url.pathname} not found`,
        availableEndpoints: [
          '/ (GET) - Frontend',
          '/api/translate (POST) - Translation',
          '/api/health (GET) - Health check'
        ]
      }, { 
        status: 404, 
        headers: corsHeaders 
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      
      return Response.json({
        success: false,
        error: 'Internal Server Error',
        detail: error instanceof Error ? error.message : 'Unexpected error occurred',
        stack: error instanceof Error ? error.stack : undefined
      }, {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};

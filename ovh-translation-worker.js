/**
 * Cloudflare Worker: OVH Translation API Wrapper
 * Version 1.2 - Mobile-Optimized with UI Debugging
 */

const HTML_PAGE = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ðŸŒ Ãœbersetzungs-Tool</title>
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
            padding: 15px;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 700px;
            width: 100%;
            padding: 25px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 8px;
            text-align: center;
        }
        .subtitle {
            color: #666;
            font-size: 14px;
            text-align: center;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 6px;
            color: #333;
            font-weight: 600;
            font-size: 13px;
        }
        input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.3s;
            font-family: inherit;
            -webkit-appearance: none;
        }
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        textarea {
            resize: vertical;
            min-height: 100px;
        }
        .char-counter {
            text-align: right;
            font-size: 12px;
            color: #666;
            margin-top: 4px;
        }
        .char-counter.warning {
            color: #f59e0b;
            font-weight: 600;
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
            -webkit-tap-highlight-color: transparent;
        }
        .button:active:not(:disabled) {
            transform: scale(0.98);
        }
        .button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .language-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        .result-box {
            margin-top: 15px;
            padding: 15px;
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
        .result-box.info {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
        }
        .result-box h3 {
            margin-bottom: 10px;
            font-size: 15px;
            color: #333;
        }
        .result-text {
            color: #555;
            line-height: 1.6;
            font-size: 14px;
            word-wrap: break-word;
        }
        .error-text {
            color: #c53030;
            font-size: 14px;
        }
        .debug-section {
            margin-top: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 6px;
            font-size: 12px;
            font-family: monospace;
            color: #495057;
            max-height: 200px;
            overflow-y: auto;
        }
        .debug-section summary {
            cursor: pointer;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .hidden {
            display: none;
        }
        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 6px;
        }
        .status-indicator.active {
            background: #10b981;
        }
        .status-indicator.inactive {
            background: #ef4444;
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
        .progress-bar {
            width: 100%;
            height: 4px;
            background: #e0e0e0;
            border-radius: 2px;
            overflow: hidden;
            margin-top: 10px;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            width: 0%;
            transition: width 0.3s;
            animation: progress 2s ease-in-out infinite;
        }
        @keyframes progress {
            0%, 100% { width: 0%; }
            50% { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>ðŸŒ Ãœbersetzungs-Tool</h1>
        <p class="subtitle">KI-gestÃ¼tzte Ãœbersetzung mit OVH AI</p>

        <div class="language-row">
            <div class="form-group">
                <label for="fromLang">Von Sprache</label>
                <select id="fromLang">
                    <option value="English">Englisch</option>
                    <option value="German">Deutsch</option>
                    <option value="French">FranzÃ¶sisch</option>
                    <option value="Spanish">Spanisch</option>
                    <option value="Italian">Italienisch</option>
                    <option value="Portuguese">Portugiesisch</option>
                </select>
            </div>
            <div class="form-group">
                <label for="toLang">Zu Sprache</label>
                <select id="toLang">
                    <option value="French">FranzÃ¶sisch</option>
                    <option value="German">Deutsch</option>
                    <option value="English">Englisch</option>
                    <option value="Spanish">Spanisch</option>
                    <option value="Italian">Italienisch</option>
                    <option value="Portuguese">Portugiesisch</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label for="textInput">Text zum Ãœbersetzen</label>
            <textarea id="textInput" placeholder="Gib hier deinen Text ein...">Brian is in the kitchen</textarea>
            <div class="char-counter" id="charCounter">0 Zeichen</div>
        </div>

        <button type="button" class="button" id="translateBtn">
            Ãœbersetzen
        </button>

        <div id="progressBar" class="hidden">
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>

        <div id="result" class="hidden"></div>
        
        <div id="debugLog" class="result-box info hidden">
            <h3>ðŸ” Debug-Log</h3>
            <details class="debug-section">
                <summary>Klicken zum Anzeigen</summary>
                <div id="debugContent"></div>
            </details>
        </div>
    </div>

    <script>
        let debugMessages = [];
        
        function log(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString('de-DE');
            const logEntry = \`[\${timestamp}] \${message}\`;
            debugMessages.push(logEntry);
            console.log(logEntry);
            updateDebugUI();
        }

        function updateDebugUI() {
            const debugContent = document.getElementById('debugContent');
            const debugLog = document.getElementById('debugLog');
            
            if (debugMessages.length > 0) {
                debugContent.innerHTML = debugMessages.join('<br>');
                debugLog.classList.remove('hidden');
            }
        }

        function updateCharCounter() {
            const text = document.getElementById('textInput').value;
            const counter = document.getElementById('charCounter');
            const length = text.length;
            
            counter.textContent = \`\${length} Zeichen\`;
            
            if (length > 1000) {
                counter.classList.add('warning');
                counter.textContent += ' âš ï¸ Sehr lang - kÃ¶nnte langsam sein';
            } else {
                counter.classList.remove('warning');
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            log('âœ… Seite geladen');
            
            const btn = document.getElementById('translateBtn');
            const textInput = document.getElementById('textInput');
            
            if (btn) {
                btn.addEventListener('click', translate);
                log('âœ… Button-Event registriert');
            } else {
                log('âŒ Button nicht gefunden', 'error');
            }
            
            if (textInput) {
                textInput.addEventListener('input', updateCharCounter);
                updateCharCounter();
            }
        });

        async function translate() {
            log('ðŸ”„ Ãœbersetzung gestartet');
            
            const btn = document.getElementById('translateBtn');
            const result = document.getElementById('result');
            const progressBar = document.getElementById('progressBar');
            const text = document.getElementById('textInput').value;
            const fromLang = document.getElementById('fromLang').value;
            const toLang = document.getElementById('toLang').value;

            log(\`Text-LÃ¤nge: \${text.length} Zeichen\`);
            log(\`Von: \${fromLang} â†’ Zu: \${toLang}\`);

            result.classList.add('hidden');
            progressBar.classList.remove('hidden');

            if (!text.trim()) {
                log('âš ï¸ Kein Text eingegeben', 'warning');
                showResult('Bitte gib einen Text ein', 'error');
                progressBar.classList.add('hidden');
                return;
            }

            // Warnung bei sehr langem Text
            if (text.length > 2000) {
                showResult(
                    'Text ist sehr lang (' + text.length + ' Zeichen). Dies kann 30-60 Sekunden dauern...', 
                    'info'
                );
            }

            btn.disabled = true;
            btn.innerHTML = 'Wird Ã¼bersetzt...<span class="spinner"></span>';

            const startTime = Date.now();

            try {
                log('ðŸ“¤ Sende Request an /api/translate');
                
                // LÃ¤ngeres Timeout fÃ¼r lange Texte
                const timeoutMs = text.length > 1000 ? 60000 : 30000;
                log(\`Timeout: \${timeoutMs / 1000}s\`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    controller.abort();
                    log('â±ï¸ Timeout erreicht', 'error');
                }, timeoutMs);

                const response = await fetch('/api/translate', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        text: text, 
                        from: fromLang, 
                        target: toLang 
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                log(\`ðŸ“¥ Response erhalten (HTTP \${response.status}) nach \${duration}s\`);

                let data;
                try {
                    data = await response.json();
                    log('âœ… JSON erfolgreich geparst');
                } catch (parseError) {
                    log('âŒ JSON-Parse-Fehler: ' + parseError.message, 'error');
                    const responseText = await response.text();
                    log('Raw Response: ' + responseText.substring(0, 200));
                    throw new Error('Server hat ungÃ¼ltiges JSON zurÃ¼ckgegeben');
                }

                if (response.ok && data.success) {
                    log('âœ… Ãœbersetzung erfolgreich');
                    log(\`Ãœbersetzt: \${data.translated.substring(0, 50)}...\`);
                    showResult(data.translated, 'success');
                } else {
                    log('âŒ Ãœbersetzung fehlgeschlagen: ' + (data.error || 'Unbekannt'), 'error');
                    const errorMsg = data.error || data.detail || 'Ãœbersetzung fehlgeschlagen';
                    showResult(
                        errorMsg + '\\n\\nStatus: ' + response.status, 
                        'error',
                        data
                    );
                }
            } catch (error) {
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                log('âŒ Exception nach ' + duration + 's: ' + error.message, 'error');
                
                let errorMsg = 'Fehler: ' + error.message;
                
                if (error.name === 'AbortError') {
                    errorMsg = 'ZeitÃ¼berschreitung! Die Ãœbersetzung hat zu lange gedauert (>' + (text.length > 1000 ? '60' : '30') + 's).\\n\\nTipp: Versuche einen kÃ¼rzeren Text.';
                }
                
                showResult(errorMsg, 'error', { error: error.message, type: error.name });
            } finally {
                progressBar.classList.add('hidden');
                btn.disabled = false;
                btn.innerHTML = 'Ãœbersetzen';
                log('ðŸ Fertig');
            }
        }

        function showResult(text, type = 'success', debugData = null) {
            const result = document.getElementById('result');
            
            let icon = 'âœ“';
            let title = 'Ãœbersetzung';
            let textClass = 'result-text';
            
            if (type === 'error') {
                icon = 'âŒ';
                title = 'Fehler';
                textClass = 'error-text';
            } else if (type === 'info') {
                icon = 'â„¹ï¸';
                title = 'Hinweis';
            }
            
            let debugHtml = '';
            if (debugData) {
                debugHtml = '<div style="margin-top:10px;padding:8px;background:#f8f9fa;border-radius:4px;font-size:12px;"><strong>Details:</strong><br>' + 
                    JSON.stringify(debugData, null, 2).replace(/\\n/g, '<br>').replace(/ /g, '&nbsp;') + 
                    '</div>';
            }
            
            result.className = 'result-box ' + type;
            result.innerHTML = \`
                <h3>\${icon} \${title}</h3>
                <p class="\${textClass}">\${text.replace(/\\n/g, '<br>')}</p>
                \${debugHtml}
            \`;
            result.classList.remove('hidden');
            
            // Scroll to result on mobile
            setTimeout(() => {
                result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
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

    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    // Basic Auth
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
        
        console.log('âœ… Basic Auth successful for user:', username);
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
      // Frontend
      if (url.pathname === '/' && request.method === 'GET') {
        return new Response(HTML_PAGE, {
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        });
      }

      // Health check
      if (url.pathname === '/health' || url.pathname === '/api/health') {
        return Response.json({
          status: 'ok',
          message: 'Translation API is running',
          version: '1.2.0-mobile',
          env: {
            hasAuthUsername: !!env.BASIC_AUTH_USERNAME,
            hasAuthPassword: !!env.BASIC_AUTH_PASSWORD,
            hasOvhToken: !!env.OVH_AI_ENDPOINTS_ACCESS_TOKEN,
            authEnabled: !!(env.BASIC_AUTH_USERNAME && env.BASIC_AUTH_PASSWORD)
          }
        }, {
          headers: corsHeaders
        });
      }

      // Translation API
      if (url.pathname === '/api/translate' && request.method === 'POST') {
        const startTime = Date.now();
        
        let body;
        try {
          body = await request.json();
        } catch (parseError) {
          console.error('Failed to parse request body:', parseError);
          return Response.json({
            success: false,
            error: 'Invalid JSON in request body',
            detail: parseError.message
          }, {
            status: 400,
            headers: corsHeaders
          });
        }
        
        console.log('Translation request:', {
          textLength: body.text?.length,
          from: body.from,
          target: body.target
        });

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

        const ovhUrl = \`https://t5-large.endpoints.kepler.ai.cloud.ovh.net/api/translate?from=\${encodeURIComponent(fromLang)}&target=\${encodeURIComponent(targetLang)}\`;
        
        const ovhHeaders = {
          'Content-Type': 'text/plain',
        };

        const accessToken = env.OVH_AI_ENDPOINTS_ACCESS_TOKEN || env.OVH_API_KEY;
        if (accessToken) {
          ovhHeaders['Authorization'] = \`Bearer \${accessToken}\`;
        } else {
          console.warn('âš ï¸ No OVH API token configured!');
          return Response.json({
            success: false,
            error: 'API nicht konfiguriert',
            detail: 'OVH_AI_ENDPOINTS_ACCESS_TOKEN fehlt'
          }, {
            status: 500,
            headers: corsHeaders
          });
        }

        console.log('Calling OVH API...', { textLength: body.text.length });

        try {
          const ovhResponse = await fetch(ovhUrl, {
            method: 'POST',
            headers: ovhHeaders,
            body: body.text
          });

          const duration = Date.now() - startTime;
          console.log('OVH API responded:', { status: ovhResponse.status, duration: \`\${duration}ms\` });

          if (!ovhResponse.ok) {
            const errorText = await ovhResponse.text();
            console.error('OVH API error:', {
              status: ovhResponse.status,
              body: errorText.substring(0, 500)
            });
            
            return Response.json({
              success: false,
              error: \`OVH API Fehler (HTTP \${ovhResponse.status})\`,
              detail: errorText
            }, {
              status: ovhResponse.status,
              headers: corsHeaders
            });
          }

          const translatedText = await ovhResponse.text();
          
          console.log('Translation successful:', {
            duration: \`\${duration}ms\`,
            resultLength: translatedText.length
          });

          return Response.json({
            success: true,
            original: body.text,
            translated: translatedText,
            from: fromLang,
            target: targetLang,
            meta: {
              duration_ms: duration,
              text_length: body.text.length
            }
          }, {
            headers: corsHeaders
          });
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          return Response.json({
            success: false,
            error: 'Verbindungsfehler zur OVH API',
            detail: fetchError.message
          }, {
            status: 500,
            headers: corsHeaders
          });
        }
      }

      // 404
      return Response.json({
        error: 'Not Found',
        detail: \`Endpoint \${url.pathname} not found\`
      }, { 
        status: 404, 
        headers: corsHeaders 
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      
      return Response.json({
        success: false,
        error: 'Internal Server Error',
        detail: error instanceof Error ? error.message : 'Unexpected error'
      }, {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};

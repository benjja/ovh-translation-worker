/**
 * Cloudflare Worker: OVH Translation API Wrapper
 * Version 1.4 - Chunking Support für lange Texte
 * Mit Basic Auth und eingebettetem HTML-Frontend
 */

const HTML_PAGE = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌍 Übersetzungs-Tool</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
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
        h1 { color: #333; font-size: 28px; margin-bottom: 8px; text-align: center; }
        .subtitle { color: #666; font-size: 14px; text-align: center; margin-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 6px; color: #333; font-weight: 600; font-size: 13px; }
        input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.3s;
            font-family: inherit;
        }
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        textarea { resize: vertical; min-height: 100px; }
        .char-counter { text-align: right; font-size: 12px; color: #666; margin-top: 4px; }
        .char-counter.warning { color: #f59e0b; font-weight: 600; }
        .button {
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            transition: all 0.2s;
        }
        .button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
        .button:active:not(:disabled) { transform: scale(0.98); }
        .button:disabled { opacity: 0.6; cursor: not-allowed; }
        .language-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .result-box {
            margin-top: 15px;
            padding: 15px;
            border-radius: 8px;
            animation: slideIn 0.3s ease;
        }
        .result-box.success { background: #f0f7ff; border-left: 4px solid #667eea; }
        .result-box.error { background: #fff5f5; border-left: 4px solid #e53e3e; }
        .result-box.info { background: #fffbeb; border-left: 4px solid #f59e0b; }
        .result-box h3 { margin-bottom: 10px; font-size: 15px; color: #333; }
        .result-text { color: #555; line-height: 1.6; font-size: 14px; word-wrap: break-word; white-space: pre-wrap; }
        .error-text { color: #c53030; font-size: 14px; }
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
        .debug-section summary { cursor: pointer; font-weight: 600; margin-bottom: 5px; user-select: none; }
        .hidden { display: none; }
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
            vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .progress-container {
            margin-top: 10px;
        }
        .progress-bar {
            width: 100%;
            height: 6px;
            background: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 8px;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.3s ease;
            width: 0%;
        }
        .progress-text {
            font-size: 13px;
            color: #666;
            margin-top: 6px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌍 Übersetzungs-Tool</h1>
        <p class="subtitle">KI-gestützte Übersetzung mit OVH AI • Unterstützt lange Texte</p>

        <div class="language-row">
            <div class="form-group">
                <label for="fromLang">Von Sprache</label>
                <select id="fromLang">
                    <option value="English">Englisch</option>
                    <option value="German">Deutsch</option>
                    <option value="French">Französisch</option>
                    <option value="Spanish">Spanisch</option>
                </select>
            </div>
            <div class="form-group">
                <label for="toLang">Zu Sprache</label>
                <select id="toLang">
                    <option value="French">Französisch</option>
                    <option value="German">Deutsch</option>
                    <option value="English">Englisch</option>
                    <option value="Spanish">Spanisch</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label for="textInput">Text zum Übersetzen</label>
            <textarea id="textInput" placeholder="Gib hier deinen Text ein...">Brian is in the kitchen</textarea>
            <div class="char-counter" id="charCounter">0 Zeichen</div>
        </div>

        <button type="button" class="button" id="translateBtn">Übersetzen</button>

        <div id="progressContainer" class="progress-container hidden">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text" id="progressText">Wird übersetzt...</div>
        </div>

        <div id="result" class="hidden"></div>
        
        <div id="debugLog" class="result-box info hidden">
            <h3>🔍 Debug-Log</h3>
            <details class="debug-section">
                <summary>Klicken zum Anzeigen</summary>
                <div id="debugContent"></div>
            </details>
        </div>
    </div>

    <script>
        let debugMessages = [];
        
        function log(message) {
            const timestamp = new Date().toLocaleTimeString('de-DE');
            const logEntry = '[' + timestamp + '] ' + message;
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
            counter.textContent = length + ' Zeichen';
            if (length > 5000) {
                counter.classList.add('warning');
                counter.textContent += ' ⚠️ Sehr lang (wird in Teilen übersetzt)';
            } else {
                counter.classList.remove('warning');
            }
        }

        function updateProgress(percent, text) {
            const fill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            fill.style.width = percent + '%';
            if (text) progressText.textContent = text;
        }

        document.addEventListener('DOMContentLoaded', function() {
            log('✅ Seite geladen');
            const btn = document.getElementById('translateBtn');
            const textInput = document.getElementById('textInput');
            if (btn) {
                btn.addEventListener('click', translate);
                log('Button-Event registriert');
            }
            if (textInput) {
                textInput.addEventListener('input', updateCharCounter);
                updateCharCounter();
            }
        });

        async function translate() {
            log('🔄 Übersetzung gestartet');
            const btn = document.getElementById('translateBtn');
            const result = document.getElementById('result');
            const progressContainer = document.getElementById('progressContainer');
            const text = document.getElementById('textInput').value;
            const fromLang = document.getElementById('fromLang').value;
            const toLang = document.getElementById('toLang').value;

            log('Text-Länge: ' + text.length + ' Zeichen');
            log('Von: ' + fromLang + ' → ' + toLang);

            result.classList.add('hidden');
            progressContainer.classList.remove('hidden');
            updateProgress(0, 'Wird vorbereitet...');

            if (!text.trim()) {
                log('❌ Kein Text eingegeben');
                showResult('Bitte gib einen Text ein', 'error');
                progressContainer.classList.add('hidden');
                return;
            }

            btn.disabled = true;
            btn.innerHTML = 'Wird übersetzt...<span class="spinner"></span>';
            const startTime = Date.now();

            try {
                log('📤 Sende Request an /api/translate');
                
                const response = await fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: text, from: fromLang, target: toLang })
                });

                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                log('📥 Response erhalten (HTTP ' + response.status + ') nach ' + duration + 's');

                let data;
                try {
                    data = await response.json();
                    log('✅ JSON erfolgreich geparst');
                } catch (parseError) {
                    log('❌ JSON-Parse-Fehler: ' + parseError.message);
                    throw new Error('Server hat ungültiges JSON zurückgegeben');
                }

                if (response.ok && data.success) {
                    log('✅ Übersetzung erfolgreich');
                    if (data.chunked) {
                        log('ℹ️ Text wurde in ' + data.chunks + ' Teile aufgeteilt');
                    }
                    showResult(data.translated, 'success');
                } else {
                    log('❌ Übersetzung fehlgeschlagen: ' + (data.error || 'Unbekannt'));
                    const errorMsg = data.error || data.detail || 'Übersetzung fehlgeschlagen';
                    showResult(errorMsg + '<br><br>Status: ' + response.status, 'error');
                }
            } catch (error) {
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                log('❌ Exception nach ' + duration + 's: ' + error.message);
                showResult('Fehler: ' + error.message, 'error');
            } finally {
                progressContainer.classList.add('hidden');
                btn.disabled = false;
                btn.innerHTML = 'Übersetzen';
                log('✔️ Fertig');
            }
        }

        function showResult(text, type) {
            const result = document.getElementById('result');
            let icon = '✓';
            let title = 'Übersetzung';
            let textClass = 'result-text';
            if (type === 'error') {
                icon = '❌';
                title = 'Fehler';
                textClass = 'error-text';
            } else if (type === 'info') {
                icon = 'ℹ️';
                title = 'Hinweis';
            }
            result.className = 'result-box ' + type;
            result.innerHTML = '<h3>' + icon + ' ' + title + '</h3><p class="' + textClass + '">' + text + '</p>';
            result.classList.remove('hidden');
            setTimeout(function() {
                result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    </script>
</body>
</html>`;

// Hilfsfunktion: Text in sinnvolle Chunks aufteilen
function splitIntoChunks(text, maxChunkSize = 2000) {
    const chunks = [];
    
    // Wenn Text klein genug ist, direkt zurückgeben
    if (text.length <= maxChunkSize) {
        return [text];
    }

    // Text nach Absätzen aufteilen
    const paragraphs = text.split(/\n\n+/);
    
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
        // Wenn der Absatz selbst zu groß ist, nach Sätzen aufteilen
        if (paragraph.length > maxChunkSize) {
            // Aktuellen Chunk speichern, falls vorhanden
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            
            // Absatz nach Sätzen aufteilen
            const sentences = paragraph.split(/([.!?]+\s+)/);
            
            for (const sentence of sentences) {
                if (currentChunk.length + sentence.length <= maxChunkSize) {
                    currentChunk += sentence;
                } else {
                    if (currentChunk) {
                        chunks.push(currentChunk.trim());
                    }
                    currentChunk = sentence;
                }
            }
        } else {
            // Prüfen, ob Absatz in aktuellen Chunk passt
            if (currentChunk.length + paragraph.length + 2 <= maxChunkSize) {
                currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = paragraph;
            }
        }
    }
    
    // Letzten Chunk hinzufügen
    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}

// Einzelnen Chunk übersetzen
async function translateChunk(chunk, fromLang, targetLang, ovhToken) {
    const ovhUrl = `https://t5-large.endpoints.kepler.ai.cloud.ovh.net/api/translate?from=${encodeURIComponent(fromLang)}&target=${encodeURIComponent(targetLang)}`;
    
    const ovhHeaders = {
        'Content-Type': 'text/plain; charset=utf-8'
    };

    if (ovhToken) {
        ovhHeaders['Authorization'] = `Bearer ${ovhToken}`;
    }

    const response = await fetch(ovhUrl, {
        method: 'POST',
        headers: ovhHeaders,
        body: chunk
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OVH API Error (HTTP ${response.status}): ${errorText}`);
    }

    return await response.text();
}

export default {
    async fetch(request, env, ctx) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };

        // CORS Preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        // Basic Auth Check (optional)
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
                        error: 'Invalid Credentials'
                    }), {
                        status: 401,
                        headers: {
                            ...corsHeaders,
                            'WWW-Authenticate': 'Basic realm="Translation API", charset="UTF-8"',
                            'Content-Type': 'application/json'
                        }
                    });
                }

                console.log('Auth successful for:', username);
            } catch (error) {
                return new Response(JSON.stringify({
                    error: 'Invalid Authorization Header'
                }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        const url = new URL(request.url);

        try {
            // Frontend HTML
            if (url.pathname === '/' && request.method === 'GET') {
                return new Response(HTML_PAGE, {
                    headers: {
                        'Content-Type': 'text/html;charset=UTF-8',
                        'Cache-Control': 'no-cache, no-store, must-revalidate'
                    }
                });
            }

            // Health Check
            if (url.pathname === '/health' || url.pathname === '/api/health') {
                return Response.json({
                    status: 'ok',
                    message: 'Translation API is running',
                    version: '1.4.0',
                    features: ['chunking', 'long-text-support'],
                    env: {
                        hasOvhToken: !!env.OVH_AI_ENDPOINTS_ACCESS_TOKEN,
                        authEnabled: !!(env.BASIC_AUTH_USERNAME && env.BASIC_AUTH_PASSWORD)
                    }
                }, { headers: corsHeaders });
            }

            // Translation API
            if (url.pathname === '/api/translate' && request.method === 'POST') {
                const startTime = Date.now();
                
                let body;
                try {
                    body = await request.json();
                } catch (parseError) {
                    console.error('Parse error:', parseError);
                    return Response.json({
                        success: false,
                        error: 'Invalid JSON'
                    }, { status: 400, headers: corsHeaders });
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
                    }, { status: 400, headers: corsHeaders });
                }

                const fromLang = body.from || 'English';
                const targetLang = body.target || 'French';

                const accessToken = env.OVH_AI_ENDPOINTS_ACCESS_TOKEN || env.OVH_API_KEY;
                if (!accessToken) {
                    console.warn('No OVH token configured');
                    return Response.json({
                        success: false,
                        error: 'API nicht konfiguriert',
                        detail: 'OVH_AI_ENDPOINTS_ACCESS_TOKEN fehlt'
                    }, { status: 500, headers: corsHeaders });
                }

                try {
                    // Text in Chunks aufteilen wenn nötig
                    const chunks = splitIntoChunks(body.text, 2000);
                    console.log(\`Text split into \${chunks.length} chunk(s)\`);

                    const translatedChunks = [];
                    
                    // Jeden Chunk übersetzen
                    for (let i = 0; i < chunks.length; i++) {
                        console.log(\`Translating chunk \${i + 1}/\${chunks.length} (\${chunks[i].length} chars)\`);
                        
                        const translated = await translateChunk(chunks[i], fromLang, targetLang, accessToken);
                        translatedChunks.push(translated);
                    }

                    // Chunks wieder zusammenfügen
                    const finalTranslation = translatedChunks.join('\\n\\n');

                    const duration = Date.now() - startTime;
                    console.log(\`Success: translated \${chunks.length} chunk(s) in \${duration}ms\`);

                    return Response.json({
                        success: true,
                        original: body.text,
                        translated: finalTranslation,
                        from: fromLang,
                        target: targetLang,
                        chunked: chunks.length > 1,
                        chunks: chunks.length,
                        duration_ms: duration
                    }, { headers: corsHeaders });

                } catch (fetchError) {
                    console.error('Translation error:', fetchError);
                    return Response.json({
                        success: false,
                        error: 'Übersetzungsfehler',
                        detail: fetchError.message
                    }, { status: 500, headers: corsHeaders });
                }
            }

            return Response.json({
                error: 'Not Found'
            }, { status: 404, headers: corsHeaders });

        } catch (error) {
            console.error('Error:', error);
            return Response.json({
                success: false,
                error: 'Internal Server Error',
                detail: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500, headers: corsHeaders });
        }
    }
};

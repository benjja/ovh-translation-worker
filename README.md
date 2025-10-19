# 🌍 OVH Translation Worker - Deployment Anleitung

## 📋 Über diesen Worker

Ein Cloudflare Worker mit **Basic Auth**, der die OVH Translation API nutzt und ein eingebautes HTML-Frontend bereitstellt.

### ✨ Features
- ✅ **Basic Authentication** (wie bei deinem sd-api-wrapper)
- ✅ **Eingebettetes HTML-Frontend** - keine separaten Dateien nötig
- ✅ **CORS-Support** für externe API-Zugriffe
- ✅ **Vollständig in JavaScript** - keine TypeScript-Kompilierung
- ✅ **Bereit für Web-GUI Upload**

---

## 🚀 Deployment über Cloudflare Web-GUI

### Schritt 1: Worker erstellen

1. Gehe zu: **Cloudflare Dashboard** → **Workers & Pages**
2. Klicke auf **"Create Worker"** oder **"Create Application"**
3. Gib deinem Worker einen Namen (z.B. `ovh-translation`)
4. Klicke auf **"Deploy"**

### Schritt 2: Code einfügen

1. Nach dem Erstellen des Workers klickst du auf **"Edit Code"** oder **"Quick Edit"**
2. **Lösche** den gesamten Beispiel-Code im Editor
3. **Kopiere** den kompletten Inhalt aus `ovh-translation-worker.js`
4. **Füge** ihn in den Editor ein
5. Klicke auf **"Save and Deploy"**

### Schritt 3: Secrets konfigurieren

#### 3a) OVH API Token setzen

1. Gehe zurück zur Worker-Übersicht
2. Klicke auf **"Settings"** → **"Variables and Secrets"**
3. Unter **"Environment Variables"** → **"Add variable"**:
   - **Type**: Secret
   - **Variable name**: `OVH_AI_ENDPOINTS_ACCESS_TOKEN`
   - **Value**: `[Dein OVH API Token]`
4. Klicke auf **"Save"**

#### 3b) Basic Auth konfigurieren (Optional)

Falls du Basic Auth aktivieren möchtest:

1. Füge unter **"Environment Variables"** zwei weitere Secrets hinzu:

   **Secret 1:**
   - Variable name: `BASIC_AUTH_USERNAME`
   - Value: `deinbenutzername`

   **Secret 2:**
   - Variable name: `BASIC_AUTH_PASSWORD`
   - Value: `deinpasswort`

2. Klicke auf **"Save and Deploy"**

> **Hinweis:** Wenn du **keine** Basic Auth möchtest, lass diese beiden Variablen einfach weg.

---

## 🎯 Verwendung

### Frontend aufrufen

Öffne einfach die URL deines Workers:
```
https://ovh-translation.dein-account.workers.dev/
```

### API direkt nutzen

```bash
# Mit Basic Auth
curl -X POST https://ovh-translation.dein-account.workers.dev/api/translate \
  -u "benutzername:passwort" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "from": "English", "target": "German"}'

# Ohne Basic Auth (wenn nicht konfiguriert)
curl -X POST https://ovh-translation.dein-account.workers.dev/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "from": "English", "target": "German"}'
```

---

## 🔧 Verfügbare Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/` | GET | HTML-Frontend |
| `/api/translate` | POST | Übersetzungs-API |
| `/api/health` | GET | Health Check |

---

## 🛡️ Sicherheit

### Basic Auth ist aktiviert, wenn:

- `BASIC_AUTH_USERNAME` **UND**
- `BASIC_AUTH_PASSWORD`

beide als Secrets konfiguriert sind.

### Basic Auth ist deaktiviert, wenn:

Eine oder beide Variablen **nicht** gesetzt sind.

---

## 📝 API Request Format

```json
{
  "text": "Text zum Übersetzen",
  "from": "English",
  "target": "German"
}
```

### API Response Format

```json
{
  "success": true,
  "original": "Hello world",
  "translated": "Hallo Welt",
  "from": "English",
  "target": "German"
}
```

---

## 🐛 Troubleshooting

### Problem: "OVH API error: 401"
**Lösung:** Überprüfe, ob `OVH_AI_ENDPOINTS_ACCESS_TOKEN` korrekt gesetzt ist.

### Problem: Basic Auth funktioniert nicht
**Lösung:** Stelle sicher, dass **beide** Variablen (`BASIC_AUTH_USERNAME` und `BASIC_AUTH_PASSWORD`) als **Secrets** (nicht als normale Variablen) gesetzt sind.

### Problem: Frontend lädt nicht
**Lösung:** 
1. Überprüfe die Browser-Konsole auf Fehler
2. Teste den Health-Endpoint: `https://dein-worker.workers.dev/api/health`

---

## 📊 Unterstützte Sprachen

- Englisch (English)
- Deutsch (German)
- Französisch (French)
- Spanisch (Spanish)
- Italienisch (Italian)
- Portugiesisch (Portuguese)

---

## 🎨 Anpassungen

### Frontend-Farben ändern

Suche im Code nach:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Und ersetze die Hex-Codes durch deine Wunschfarben.

### Weitere Sprachen hinzufügen

Füge im HTML im `<select>` neue Optionen hinzu:
```html
<option value="Dutch">Niederländisch</option>
```

---

## 📜 Version

**Version:** 1.0.0  
**Kompatibel mit:** Cloudflare Workers  
**Inspiriert von:** sd-api-wrapper Pattern

---

## ❓ Support

Bei Fragen oder Problemen:
1. Prüfe die Cloudflare Worker Logs: Dashboard → Worker → Logs
2. Teste die Health-API: `/api/health`
3. Überprüfe die Secrets-Konfiguration
   

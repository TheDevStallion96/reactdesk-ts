# Security Testing Examples

This document demonstrates how the security features protect against common attacks.

## Test Cases

### 1. Attempting to Access Node.js APIs from Renderer

**Attack:** Try to use `require()` or `process` in the renderer.

**Test in Browser DevTools:**

```javascript
// This should fail
require('fs');
// Error: require is not defined

process.exit();
// Error: process is not defined
```

**Result:** ❌ Blocked by `nodeIntegration: false`

---

### 2. Attempting to Access ipcRenderer Directly

**Attack:** Try to access Electron's IPC without going through contextBridge.

**Test in Browser DevTools:**

```javascript
// This should fail
window.require('electron').ipcRenderer;
// Error: require is not defined

// This should also fail
ipcRenderer.send('malicious-message');
// Error: ipcRenderer is not defined
```

**Result:** ❌ Blocked by `contextIsolation` and no direct exposure

---

### 3. Attempting Directory Traversal

**Attack:** Try to read files outside allowed paths using `../`.

**Test in App:**

```javascript
// This should fail
await window.electronAPI.readFile('../../../etc/passwd');
// Error: Path traversal detected
```

**Result:** ❌ Blocked by path validation in preload script

---

### 4. Attempting to Execute eval()

**Attack:** Try to execute arbitrary code using eval.

**Test in Main Process (shouldn't be possible from renderer):**

```javascript
// If this somehow reached main process, it would fail
eval('malicious code');
// Error: eval() is disabled for security reasons
```

**Result:** ❌ Blocked by eval() override

---

### 5. Attempting to Open External URL

**Attack:** Try to navigate to a phishing site.

**Test:**

```javascript
// This should fail
window.location.href = 'https://malicious-site.com';
// Navigation blocked
```

**Result:** ❌ Blocked by navigation protection

---

### 6. Attempting to Open Popup Window

**Attack:** Try to open a popup window within the app.

**Test in Renderer:**

```javascript
// This should fail
window.open('https://malicious-site.com');
// Opens in system browser, not in app (if HTTPS)
// Blocked if not HTTPS
```

**Result:** ❌ Blocked/Redirected by `setWindowOpenHandler`

---

### 7. Attempting XSS Attack

**Attack:** Try to inject and execute malicious script.

**Test:**

```javascript
// This should fail due to CSP
document.body.innerHTML = '<script>alert("XSS")</script>';
// Script tag is inserted but won't execute due to CSP
```

**Result:** ❌ Blocked by Content Security Policy

---

### 8. Attempting to Send Invalid IPC Data

**Attack:** Send malformed data to crash or exploit the main process.

**Test:**

```javascript
// This should fail
await window.electronAPI.processData({
  text: 'a'.repeat(10000), // Too long
  count: 1000, // Out of range
});
// Error: Invalid text field OR Invalid count field
```

**Result:** ❌ Blocked by input validation

---

### 9. Valid Security-Conscious Operations

**What SHOULD work:**

```javascript
// Get app version (read-only)
const version = await window.electronAPI.getAppVersion();
console.log(version); // ✅ Works

// Ping/pong IPC
const pong = await window.electronAPI.ping();
console.log(pong); // ✅ Works - returns "pong"

// Process valid data
const result = await window.electronAPI.processData({
  text: 'Hello',
  count: 3,
});
console.log(result); // ✅ Works - returns { processed: 'HelloHelloHello', timestamp: ... }

// Open file with user consent
const dialogResult = await window.electronAPI.showOpenDialog({
  properties: ['openFile'],
  filters: [{ name: 'Text Files', extensions: ['txt'] }],
});
// ✅ Works - shows native file dialog

if (!dialogResult.canceled) {
  const content = await window.electronAPI.readFile(dialogResult.filePaths[0]);
  console.log(content); // ✅ Works - reads user-selected file
}
```

---

## Security Testing Checklist

- [ ] Cannot access Node.js `require()`
- [ ] Cannot access `process` global
- [ ] Cannot access `ipcRenderer` directly
- [ ] Cannot use `eval()` or `Function()`
- [ ] Cannot navigate to external URLs
- [ ] Cannot open arbitrary windows
- [ ] Cannot execute inline scripts (CSP)
- [ ] Cannot traverse directories with `../`
- [ ] Cannot send invalid data types
- [ ] Cannot send oversized data
- [ ] CAN use exposed contextBridge APIs
- [ ] CAN select files with user consent
- [ ] CAN receive validated responses

---

## Penetration Testing

For comprehensive security testing:

1. **Automated Testing:**

   ```bash
   npm install --save-dev electronegativity
   npx electronegativity -i .
   ```

2. **Manual Testing:**
   - Open DevTools in the app
   - Try each attack scenario above
   - Verify proper error messages
   - Check console for security warnings

3. **Code Review:**
   - Review all IPC handlers
   - Verify input validation
   - Check for eval() usage
   - Ensure no remote module

4. **Dependency Audit:**
   ```bash
   npm audit
   npm audit fix
   ```

---

## Incident Response

If a security vulnerability is discovered:

1. **Assess Impact:**
   - What data could be accessed?
   - What operations could be performed?
   - Which versions are affected?

2. **Immediate Actions:**
   - Create a security patch
   - Test the patch thoroughly
   - Prepare security advisory

3. **Deployment:**
   - Release patch as soon as possible
   - Use auto-update mechanism
   - Notify users of critical update

4. **Post-Incident:**
   - Document the vulnerability
   - Update security tests
   - Review similar code patterns

---

## Further Reading

- [OWASP Electron Security](https://owasp.org/www-community/vulnerabilities/Electron_Security)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [Common Electron Vulnerabilities](https://github.com/doyensec/electronegativity/wiki/Vulnerabilities)

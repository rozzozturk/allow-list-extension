## 🚀 Keepnet Extension – Quick Start

### ⚡ Start in 3 Steps

#### 1️⃣ Load the Extension

```bash
1. Open chrome://extensions in Chrome
2. Make sure "Developer mode" is enabled (top-right)
3. Click "Load unpacked"
4. Select the extension folder (e.g. /path/to/extension)
5. ✅ Extension is loaded!
```

#### 2️⃣ Go to Security Center

```bash
1. Open https://security.microsoft.com/homepage
2. Click the extension icon (🛡️)
3. The panel will open in the bottom-left or bottom-right corner
```

#### 3️⃣ Assistant is Running

The panel opens and **Step 1: Security Center Home Page** is displayed ✅

---

### 🐛 Troubleshooting

#### Panel Does Not Open

Open **DevTools Console** (F12 or Right click → Inspect → Console) and look for:

```javascript
[Keepnet v3.1] Content script loaded
[Keepnet] Initializing assistant...
[Keepnet] Assistant ready!
```

If you don’t see any of these messages:

```bash
1. Go to the extensions page (chrome://extensions)
2. Find the Keepnet extension
3. Click the "Reload" (🔄) button
4. Refresh the page (F5)
5. Click the extension icon again
```

If you see an error message:

```bash
Copy the error from the Console and share it with the developer/support team.
```

#### Panel Opens and Closes Repeatedly

Check Console for errors:

```javascript
[Keepnet] executeStep error: ...
// or
[Keepnet] Init error: ...
```

Then:

```bash
1. Find the error in Chrome DevTools Console
2. Copy the full error text
3. Share it with the developer/support team
```

#### Buttons Not Working

If the **Continue** button does not work, check Console for:

```javascript
[Keepnet] Next button clicked
```

If this message does not appear:

```bash
1. Close and reopen the panel
2. Or refresh the page and try again
```

---

### 📋 Test Steps

#### Step 1: Panel Rendering Test

**Expected:**
- ✅ Panel visible (approx. 340x520px)  
-,✅ Header: "Keepnet Allow List" + "Step 1 / 12"  
- ✅ Body: "Security Center Home Page" description  
- ✅ Footer: "← Back" and "Continue →" buttons  

**Test:**

```bash
1. Drag the panel → position should be remembered
2. Refresh the page → panel should appear in the same position
3. Click the X button → panel should close
4. Click the extension icon → panel should open again
```

#### Step 2: Continue Button Test

Keep Console open:

```bash
1. Click the "Continue" button
2. Console should show "Next button clicked"
3. It should move to Step 2: "Email and collaboration"
4. Once the page loads, the target element should be highlighted
```

#### Step 3: Auto-Click Test

On Step 2:

```bash
1. Wait 5 seconds
2. Console should show "Auto-click in 4s..." countdown logs
3. After the countdown, auto-click should trigger
4. "Email and collaboration" menu should open
```

---

### 🔍 Normal Console Flow

```javascript
[Keepnet v3.1] Content script loaded on https://security.microsoft.com/homepage
[Keepnet v3.1] Background service worker started
[Keepnet] Extension clicked on tab: 123456
[Keepnet] Starting assistant on tab: 123456
[Keepnet] Initializing assistant...
[Keepnet] Button handlers attached
[Keepnet] Executing step 1: Security Center Home Page
[Keepnet] Assistant ready!

// When Continue is clicked:
[Keepnet] Next button clicked
[Keepnet] Executing step 2: Email and Collaboration
[Keepnet] Auto-click in 5s...
[Keepnet] Auto-click in 4s...
[Keepnet] Auto-click in 3s...
[Keepnet] Auto-click in 2s...
[Keepnet] Auto-click in 1s...
[Keepnet] Auto-clicking element: <button>
[Keepnet] Element clicked for step 2
[Keepnet] Capturing screenshot for step2_emailcollab...
[Keepnet] Screenshot captured: step2_emailcollab.png (245KB)
```

---

### 🎯 Expected Behaviour

#### For Each Step

1. ✅ Panel content updates  
2. ✅ Progress bar moves (0% → 8% → 17% …)  
3. ✅ Target element is highlighted with a green border  
4. ✅ Tooltip appears (e.g. “📧 Click Email and collaboration”)  
5. ✅ Auto-click starts within 5 seconds (unless user clicks manually)  
6. ✅ Manual click cancels auto-click  
7. ✅ Validation is executed  
8. ✅ Screenshot is captured automatically  
9. ✅ Next step starts  

#### Critical Step 8 (IP Entry)

1. ✅ Panel highlights the IP input area  
2. ✅ Tooltip shows required IPs (e.g. `149.72.161.59` etc.)  
3. ✅ Real-time validation runs while the user types  
4. ✅ If any IP is missing, a warning message is shown  
5. ✅ When all IPs are entered, success message is shown  

---

### 🆘 Common Error Messages

| Message                            | Cause                                      | Action                            |
|------------------------------------|-------------------------------------------|-----------------------------------|
| `❌ Element not found`             | Selector incorrect or page not loaded     | Scroll / wait / retry or continue manually |
| `⚠️ Element not found: ...`        | Element not visible                        | Scroll or change filters and retry |
| `❌ Error: ...`                    | JavaScript exception                       | Check Console details             |
| `❌ Missing IP addresses: ...`     | Some IPs are not entered                   | Add missing IPs                   |
| `Keepnet assistant could not start`| Initialization error                       | Refresh the page and retry        |

---

### 💡 Tips

#### 1. Keep DevTools Open

```bash
Press F12
Select "Console"
Monitor messages and errors
```

#### 2. Panel Disappeared?

```bash
Click the extension icon again
or
Refresh the page (F5)
```

#### 3. Cancel Auto-Click

```bash
Click the target element manually
→ Auto-click timer is cancelled
```

#### 4. Skip a Step

```bash
Click the "Continue" button
→ Moves to next step (even if validation fails)
```

#### 5. View Screenshots

```bash
In Console: chrome.storage.local.get(['keepnet_screenshots_v3'], console.log)
→ All screenshots (base64) will be printed
```

---

### 🎉 Successful Setup Checklist

If all of the following are true, setup is working correctly:

- ✅ Panel opens in the corner of the screen  
- ✅ "Continue" button works  
- ✅ Messages appear in Console  
- ✅ Progress bar moves between steps  
- ✅ Element highlighting is visible  

You can now do a full end-to-end test:

```bash
1. Go to https://security.microsoft.com/homepage
2. Start the extension
3. Follow the steps one by one
4. Check Console messages at each step
5. Confirm screenshots are being captured
```

---

🛡️ **Keepnet Allow List Assistant v3.1**

*Single floating panel, auto-click, and real-time validation for Office 365 allow list configuration.*


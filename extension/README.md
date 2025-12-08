## Keepnet Office 365 Allow List Assistant v3.0

**An interactive Chrome Extension that teaches customers how to configure Keepnet phishing simulation allow lists in Office 365 step-by-step, with real-time validation and evidence collection.**

---

### Features

#### v3.0 Highlights

1. **Single Floating Panel Design**
   - Small, elegant floating panel UI  
   - 3 size options: Small (320px), Medium (400px), Large (480px)  
   - Auto-minimize after 45 seconds of inactivity to a FAB (Floating Action Button)  
   - Drag-and-drop positioning  
   - Position persistence between page loads  

2. **Smart Navigation Engine**
   - Automatic URL navigation for each step  
   - Element discovery and highlighting  
   - **Learning system**: learns CSS selectors when the user clicks elements  
   - Automatically reuses learned selectors on subsequent runs  
   - Scroll and focus management  

3. **Real-time Validation**
   - **IP Validation**: shows missing IPs instantly  
   - **Domain Validation**: wildcard format checks  
   - **Checkbox Validation**: Safe Links and Office 365 Apps options  
   - **Header Validation**: mail flow rule header checks  
   - **SCL Validation**: spam confidence level checks  
   - Uses `MutationObserver` to watch input fields  
   - Periodic validation every 2 seconds  

4. **Screenshot & Evidence System**
   - Automatic screenshot on each step  
   - Screenshots stored together with validation results  
   - Saved in Base64 format in `chrome.storage.local`  
   - Thumbnails visible in the summary view  

5. **Detailed Summary View**
   - Step status for each step: ✅ Completed / ❌ Missing / ⏳ Pending  
   - Detailed feedback per step  
   - Clickable screenshot thumbnails  
   - “Go & Fix” buttons jump directly to problematic steps  
   - Grouped by workflow for clarity  

6. **Progress Tracking**
   - Progress bar in the panel header  
   - “Step X / Y” indicator  
   - Dynamic completion percentage  

---

### Folder Structure

```text
extension/
├── manifest.json          # Extension manifest (MV3)
├── background.js          # Service worker (navigation, screenshots)
├── content.js             # Main script (contains 6 major classes)
├── content.css            # Minimal CSS (animations)
├── config.json            # 43-step configuration (PDF references)
├── steps.json             # Legacy/alternative config
├── icons/                 # Extension icons
│   ├── icon16.jpg
│   ├── icon48.jpg
│   └── icon128.jpg
└── README.md              # This file
```

---

### Architecture

#### Main Classes in `content.js`

1. **FloatingPanel** (Part 2)  
   - Single panel management  
   - Auto-minimize logic  
   - FAB (Floating Action Button)  
   - Drag & drop positioning  

2. **RealTimeValidator** (Part 3)  
   - Listens to inputs with `MutationObserver`  
   - IP, domain, wildcard validation  
   - Checkbox, header, SCL checks  
   - Callback-based real-time feedback  

3. **NavigationEngine** (Part 4)  
   - Smart page transitions  
   - Element matching via selectors  
   - Selector learning system (`learned selectors`)  
   - Highlight & tooltip rendering  

4. **ScreenshotManager** (Part 5)  
   - Uses `chrome.tabs.captureVisibleTab`  
   - Handles storage of screenshots  
   - Links screenshots with validation results  

5. **SummaryView** (Part 6)  
   - Renders the detailed summary  
   - Shows step status (completed / missing / pending)  
   - Renders screenshot thumbnails  
   - Provides “Go & Fix” action buttons  

6. **KeepnetAssistant** (Orchestrator)  
   - Coordinates all classes  
   - Manages step transitions  
   - Handles messages and global state  

---

### Usage

#### Installation (Developer Mode)

1. Open `chrome://extensions` in Chrome.  
2. Enable **Developer mode** (top-right).  
3. Click **Load unpacked**.  
4. Select the `extension/` folder.  

#### Starting the Assistant

1. Go to [Microsoft Security Center](https://security.microsoft.com) or [Exchange Admin](https://admin.exchange.microsoft.com).  
2. Click the Keepnet extension icon 🛡️.  
3. The floating panel opens and **Step 1** starts.  

#### Workflow

1. The **panel** opens in the bottom-right corner.  
2. A **step description** is shown.  
3. **Automatic navigation** moves you to the correct URL when needed.  
4. **Element highlighting** draws a green border around the relevant control.  
5. **Real-time validation** gives feedback while you type IPs/domains.  
6. Click **Continue** → a screenshot is captured and the next step starts.  
7. Click **Summary** to see the status of all steps.  

---

### `config.json` Structure

```json
{
  "meta": {
    "critical": {
      "ips": ["149.72.161.59", "149.72.42.201", "149.72.154.87"],
      "domains": ["*.keepnetlabs.com", "*.simulation.keepnetlabs.com"]
    }
  },
  "flows": [
    {
      "id": "advanced_delivery",
      "site": "security.microsoft.com",
      "name": "Third-party Phishing Simulations",
      "steps": [
        {
          "id": 6,
          "title": "Sending IP Entry",
          "description": "Enter Keepnet IP addresses",
          "navigate": { "url": "https://security.microsoft.com/advanceddelivery" },
          "validate": "sending_ip",
          "required": ["meta.critical.ips"],
          "selectors": ["input[aria-label*='Sending IP']"],
          "realTimeValidation": true,
          "expectedValues": ["149.72.161.59", "149.72.42.201", "149.72.154.87"],
          "pdfReference": "Page 5, Step 6"
        }
      ]
    }
  ],
  "validations": {
    "sending_ip": {
      "type": "ip_list",
      "required": ["149.72.161.59", "149.72.42.201", "149.72.154.87"]
    }
  }
}
```

#### Step Config Fields

- `id`: Step number.  
- `title`: Step title.  
- `description`: Explanation shown in the panel.  
- `navigate.url`: URL for automatic navigation.  
- `selectors[]`: CSS selectors used to find the relevant element.  
- `validate`: Validation type (`sending_ip`, `domains_mail_from`, etc.).  
- `realTimeValidation`: When `true`, starts real-time validation.  
- `expectedValues[]`: Expected IPs/domains.  
- `pdfReference`: Reference to the PDF documentation.  

---

### UI/UX Details

#### Panel Sizes

```javascript
const PANEL_SIZES = {
  small: { width: 320, height: 480 },
  medium: { width: 400, height: 600 },
  large: { width: 480, height: 720 }
}
```

#### Colors

- **Primary Gradient**: `#667eea → #764ba2` (header, buttons)  
- **Success**: `#22c55e` (validation OK, highlight)  
- **Error**: `#dc2626` (validation failed)  
- **Warning**: `#f59e0b`  
- **Background**: `#f9fafb`  

#### Animations

- **Slide In**: Panel entry animation (cubic-bezier bounce).  
- **Pulse**: Element highlighting (2s infinite).  
- **Fade In**: Screenshot modal.  
- **Highlight**: Green glow effect (3 iterations).  

---

### Validation Types

| Type                      | Description              | Checked Value                                 |
|---------------------------|--------------------------|-----------------------------------------------|
| `sending_ip`              | IP list                  | Are all 3 Keepnet IPs present?                |
| `domains_mail_from`       | Domain                   | Is the Keepnet domain present?                |
| `simulation_urls_wildcard`| Wildcard domain          | `*.domain.com/*` format                       |
| `track_clicks_off`        | Checkbox                 | Is “Track user clicks” turned off?            |
| `scl_minus_one`           | SCL value                | Is SCL set to -1?                             |
| `bypass_clutter_header`   | Mail header              | `X-MS-Exchange-Organization-BypassClutter`    |
| `skip_safe_links_header`  | Mail header              | `X-MS-Exchange-Organization-SkipSafeLinksProcessing` |

---

### Storage Layout

```javascript
STORAGE_KEYS = {
  PANEL_STATE: 'keepnet_panel_state_v3',          // Panel position, minimize state
  STEP_RESULTS: 'keepnet_step_results_v3',        // Validation result per step
  LEARNED_SELECTORS: 'keepnet_learned_selectors_v3', // Learned CSS selectors
  SCREENSHOTS: 'keepnet_screenshots_v3',          // Screenshots (base64)
  PROGRESS: 'keepnet_progress_v3',                // Current step index
  SETTINGS: 'keepnet_settings_v3'                 // Panel size, auto-minimize setting
}
```

---

### Example Test Scenario

1. **Start the extension**
   - Click the icon.  
   - Panel opens and Step 1 is visible.  

2. **Go to Step 6 (Sending IP)**
   - Automatically navigates to the Advanced Delivery page.  
   - IP input field is highlighted with a green border.  
   - Tooltip is shown.  

3. **Start entering IPs**
   - Enter first IP: `149.72.161.59`.  
   - Real-time feedback: “⚠️ Missing IPs: 149.72.42.201, 149.72.154.87”.  
   - Add remaining IPs.  
   - Feedback: “✅ All IPs added”.  

4. **Click Continue**
   - Screenshot is captured automatically.  
   - Moves to Step 7.  

5. **Open Summary**
   - All steps are listed.  
   - Step 6: ✅ Completed (with screenshot thumbnail).  
   - Step 7: ⏳ Pending.  
   - “Go & Fix” button navigates back to the selected step.  

---

### PDF References

Each step in `config.json` is mapped to the corresponding page and step in Keepnet’s `white.pdf`:

- **Pages 4–5**: Advanced Delivery  
- **Pages 5–6**: Connection Filter  
- **Pages 6–7**: Safe Links Policy  
- **Pages 7–8**: Mail Flow Rules – Bypass Spam  
- **Pages 8–9**: Skip Safe Links Processing  
- **Pages 10–11**: Skip Safe Attachments Processing  
- **Pages 11–12**: Troubleshooting – Message Trace  

---

### Development Notes

#### Learning System

```javascript
// When the user clicks an element:
const selector = Utils.buildUniqueSelector(element)
navigationEngine.learnSelector(stepId, selector)

// On the next run:
const learnedSelector = this.learnedSelectors[stepId]
const element = document.querySelector(learnedSelector)
if (element) highlightElement(element)
```

#### Screenshot Flow

```javascript
// 1. Content script → Background
chrome.runtime.sendMessage({ action: 'captureScreenshot', step: 6 })

// 2. Background → chrome.tabs.captureVisibleTab
const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' })

// 3. Background → Content (send message back)
chrome.tabs.sendMessage(tabId, { action: 'screenshotCaptured', dataUrl })

// 4. Content → Save to storage
screenshotManager.save(stepId, dataUrl, validationResult)
```

---

### Roadmap

- [ ] Multi-language UI switching (EN / TR at runtime).  
- [ ] Dark mode.  
- [ ] Export summary as PDF/HTML report.  
- [ ] Keyboard shortcuts (N: Next, P: Previous, S: Summary).  
- [ ] Candidate element selection UI when multiple candidates are found.  
- [ ] Undo/Redo navigation.  
- [ ] Session replay (replay steps).  

---

### License

© 2025 Keepnet Labs. All rights reserved.

---

### Developer Info

- **Version**: 3.0.0  
- **Last Update**: 22 October 2025  
- **Requirements**: Chrome 88+, Manifest v3  

**Note**: This extension works on Microsoft 365 Security Center and Exchange Admin Center. Keepnet IPs and domains are defined in `config.json`.

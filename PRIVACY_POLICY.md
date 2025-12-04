Privacy Policy – Keepnet Assistant
==================================

Last updated: December 4, 2025  
Applies to: Keepnet Assistant browser extension

Overview
--------

Keepnet Assistant (the "Extension") is a browser extension designed to help Microsoft 365 administrators configure and verify allow list settings.  
This Privacy Policy explains what data the Extension handles, how it is stored, and what rights you have.

In summary, the Extension processes data only on your device, does not collect personal data for Keepnet Labs, and does not transmit any data to external servers.

Data Collection and Use
-----------------------

The Extension does not collect, aggregate, or transmit personal data to Keepnet Labs or any third party.

The Extension only stores the following information locally in your browser:

- **Workflow Progress**: Which configuration steps you have completed, so that guidance can resume where you left off.
- **Screenshots**: Screenshots you explicitly capture via the Extension, used for your own documentation and compliance records.
- **Configuration State**: Current step and configuration context, to provide accurate in-page guidance.
- **Language and UI Preferences**: Your chosen language or similar interface preferences.

This information is used exclusively to:

- Provide step-by-step guidance during allow list configuration.
- Restore your progress between browser sessions.
- Help you document configuration steps via screenshots, if you choose to use this feature.

No data is sent to Keepnet Labs, to cloud services, or to any external API.

Permissions and Scope
---------------------

The Extension requests the minimum permissions required to provide its functionality:

- **activeTab**  
  - Purpose: Detect when you are on relevant Microsoft 365 admin pages and enable guidance when you use the Extension.  
  - Scope: Only becomes active when you interact with the Extension (for example, by clicking the Extension icon).

- **tabs**  
  - Purpose: Read basic information about the active tab to determine whether guidance can be shown.  
  - Scope: Limited to what is necessary for navigation and state management.

- **storage**  
  - Purpose: Store workflow progress, screenshots, and user preferences locally in your browser.  
  - Scope: Uses the browser’s extension storage area only; there is no remote or cloud storage.

- **scripting**  
  - Purpose: Inject scripts into allowed pages to highlight interface elements and provide in-page instructions.  
  - Scope: Runs only on supported Microsoft 365 admin domains defined in the Extension manifest.

- **Host permissions**  
  - Domains:  
    - `https://security.microsoft.com/*`  
    - `https://admin.exchange.microsoft.com/*`  
    - `https://admin.microsoft.com/*`  
  - Purpose: Restrict the Extension to Microsoft 365 security and admin portals where allow list configuration is performed.  
  - Scope: The Extension does not run on other websites.

Screenshots
-----------

The Extension includes an optional screenshot capture feature for documentation and compliance purposes.

- Screenshots are captured only when you explicitly trigger the capture functionality.
- Screenshots are stored locally in the browser’s storage associated with the Extension.
- Screenshots may contain information from your Microsoft 365 environment (such as email addresses, IP addresses, or configuration details) visible at the time of capture.
- No screenshots are ever automatically uploaded or transmitted to Keepnet Labs or any third party.

You are responsible for handling screenshots in accordance with your organization’s security and compliance policies.

Third-Party Services
--------------------

The Extension does **not** integrate with or send data to any third-party services. Specifically:

- No analytics platforms (such as Google Analytics).
- No advertising or tracking networks.
- No external APIs or web services.
- No third-party cloud storage.

All processing occurs within your browser on the specific Microsoft 365 domains listed above.

Data Storage and Retention
--------------------------

All data used by the Extension is stored locally in your browser’s extension storage area. This includes:

- Workflow progress and configuration state.
- Screenshots you choose to capture.
- Language and interface preferences.

You can remove this data at any time by:

- Removing the Extension from your browser, or
- Clearing extension data via your browser’s settings, and
- Using any data-clearing features provided within the Extension (if available).

Once the Extension is uninstalled, associated local storage is removed by the browser.

Security
--------

We apply security-focused design principles to minimize risk:

- Minimal and purpose-limited permissions as declared in the Extension manifest.
- Local-only storage of data; no backend or remote server component.
- Restricted operation on a small set of Microsoft 365 admin domains.
- Open and reviewable source code available on GitHub.

Despite these measures, you should always follow your organization’s security policies when using the Extension, especially regarding screenshots and configuration data.

Children’s Privacy
------------------

The Extension is intended for enterprise and professional Microsoft 365 administrators. It is not directed at or intended for use by children under 13 years of age, and it does not knowingly collect information regarding children.

Your Rights
-----------

Because the Extension does not transmit data to Keepnet Labs, control over data resides with you and your browser. In particular:

- **Access**: You can inspect data stored by the Extension via your browser’s developer tools or extension settings.
- **Correction**: You can modify workflow state and preferences by using or resetting the Extension.
- **Deletion**: You can delete all data by uninstalling the Extension or clearing browser extension data.
- **Transparency**: You can review the source code on GitHub to understand how the Extension handles data.

Compliance
----------

The Extension is designed to comply with:

- Chrome Web Store Developer Program Policies  
- Google API Services User Data Policy (where applicable)  
- General Data Protection Regulation (GDPR) principles for data minimization and user control  
- California Consumer Privacy Act (CCPA) principles for transparency and deletion  
- Microsoft 365 third-party application and extension guidelines

Since the Extension does not send data to external servers, many obligations regarding data access requests are satisfied directly through your control of the browser and local environment.

Changes to This Policy
----------------------

We may update this Privacy Policy from time to time to reflect changes in legal requirements, platform policies, or the behavior of the Extension.

When we make material changes:

- The "Last updated" date at the top of this document will be revised.
- An updated version of this policy will be published in the GitHub repository and, where applicable, linked from the Extension listing.

We encourage you to review this Privacy Policy periodically.

Contact
-------

If you have questions or concerns about this Privacy Policy or the Extension’s data practices, you can contact:

- Email: rozerin.ozturk@keepnetlabs.com  
- Website: https://keepnetlabs.com  
- GitHub Issues: Use the issue tracker in the project’s GitHub repository.



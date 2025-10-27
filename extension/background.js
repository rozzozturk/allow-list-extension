// Keepnet Whitelist Assistant - Background Service Worker v3.1
console.log("[Keepnet v3.1] Background service worker started")

let globalState = {
  currentStep: 0,
  screenshots: {},
  isActive: false
}

// Güvenli mesaj gönderme fonksiyonu
async function safeSendMessage(tabId, message, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Message timeout'))
    }, timeout)
    
    chrome.tabs.sendMessage(tabId, message, (response) => {
      clearTimeout(timeoutId)
      
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else {
        resolve(response)
      }
    })
  })
}

// Extension icon'a tıklama
chrome.action.onClicked.addListener(async (tab) => {
  console.log("[Keepnet] Extension clicked on tab:", tab.id)
  console.log("[Keepnet] Tab URL:", tab.url)
  
  try {
    // Security veya Exchange sayfasında mıyız?
    const validHosts = ['security.microsoft.com', 'admin.exchange.microsoft.com']
    const url = new URL(tab.url)
    
    console.log("[Keepnet] Hostname:", url.hostname)
    
    if (!validHosts.includes(url.hostname)) {
      console.log("[Keepnet] Not on valid host, redirecting to Security Center...")
      // Otomatik olarak Security Center'a yönlendir
      await chrome.tabs.update(tab.id, {
        url: 'https://security.microsoft.com/homepage'
      })
      
      // Active olarak işaretle - sayfa yüklenince otomatik başlayacak
      globalState.isActive = true
      return
    }
    
    console.log("[Keepnet] Already on valid host, toggling assistant...")
    
    // Panel açık mı kontrol et
    try {
      const response = await safeSendMessage(tab.id, { action: 'isPanelOpen' })
      
      if (response && response.isOpen) {
        // Panel açık, kapat
        console.log("[Keepnet] Panel is open, closing...")
        await safeSendMessage(tab.id, { action: 'togglePanel' })
      } else {
        // Panel kapalı veya yok, başlat
        console.log("[Keepnet] Panel is closed, opening...")
        globalState.isActive = true
        await startAssistant(tab.id)
      }
    } catch (e) {
      // Content script yok veya hata, başlat
      console.log("[Keepnet] Content script not found, starting...")
      globalState.isActive = true
      await startAssistant(tab.id)
    }
  } catch (error) {
    console.error("[Keepnet] Extension click error:", error)
  }
})

// Asistanı başlat
async function startAssistant(tabId) {
  try {
    console.log("[Keepnet] Starting assistant on tab:", tabId)
    
    globalState.isActive = true
    
    // Storage flag'ini temizle ki auto-start çalışabilsin
    console.log("[Keepnet] Clearing auto-start flag...")
    await chrome.storage.local.remove('ASSISTANT_AUTO_STARTED')
    
    // Önce ping ile kontrol et
    try {
      console.log("[Keepnet] Sending ping to check content script...")
      const pingResponse = await safeSendMessage(tabId, { action: 'ping' })
      console.log("[Keepnet] Ping response:", pingResponse)
    } catch (pingError) {
      console.log("[Keepnet] Ping failed, content script not ready")
      throw pingError
    }
    
    // Content script'e mesaj gönder
    console.log("[Keepnet] Sending initAssistant message...")
    const response = await safeSendMessage(tabId, {
      action: 'initAssistant'
    })
    
    console.log("[Keepnet] initAssistant response:", response)
  } catch (error) {
    console.error("[Keepnet] Start assistant error:", error)
    
    // Content script yüklü değilse inject et
    try {
      console.log("[Keepnet] Injecting content script...")
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      })
      
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['content.css']
      })
      
      console.log("[Keepnet] Content script injected, waiting 2s...")
      
      // Flag'i temizle
      await chrome.storage.local.remove('ASSISTANT_AUTO_STARTED')
      
      // Tekrar dene - daha uzun bekleme süresi
      setTimeout(async () => {
        console.log("[Keepnet] Retrying initAssistant after injection...")
        try {
          // Önce ping ile kontrol et
          const pingResponse = await safeSendMessage(tabId, { action: 'ping' }, 3000)
          console.log("[Keepnet] Ping successful after injection:", pingResponse)
          
          // Sonra initialize et
          const response = await safeSendMessage(tabId, {
            action: 'initAssistant'
          }, 5000)
          console.log("[Keepnet] initAssistant response (retry):", response)
        } catch (retryError) {
          console.error("[Keepnet] Retry failed:", retryError)
          // Son bir deneme daha yap
          setTimeout(async () => {
            try {
              console.log("[Keepnet] Final retry attempt...")
              const finalResponse = await safeSendMessage(tabId, {
                action: 'initAssistant'
              }, 10000)
              console.log("[Keepnet] Final retry success:", finalResponse)
            } catch (finalError) {
              console.error("[Keepnet] Final retry failed:", finalError)
            }
          }, 2000)
        }
      }, 2000)
    } catch (injectError) {
      console.error("[Keepnet] Inject error:", injectError)
    }
  }
}

// Content script'ten mesajlar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[Keepnet] Message received:", request.action)
  
  switch (request.action) {
    case 'captureScreenshot':
      handleCaptureScreenshot(sender.tab.id, request.stepName, sendResponse)
      return true // Async response
      
    case 'getState':
      sendResponse(globalState)
      break
      
    case 'updateState':
      globalState = { ...globalState, ...request.state }
      sendResponse({ ok: true })
      break
  }
  
  return false
})

// Screenshot çek ve kaydet
async function handleCaptureScreenshot(tabId, stepName, sendResponse) {
  try {
    console.log(`[Keepnet] Capturing screenshot for ${stepName}...`)
    
    // Sayfa fully visible olana kadar bekle
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 90
    })
    
    globalState.screenshots[stepName] = {
      dataUrl: dataUrl,
      timestamp: new Date().toISOString()
    }
    
    console.log(`[Keepnet] Screenshot captured: ${stepName}.png (${Math.round(dataUrl.length / 1024)}KB)`)
    
    // Content script'e geri bildir
    try {
      await safeSendMessage(tabId, {
        action: 'screenshotCaptured',
        stepName: stepName,
        dataUrl: dataUrl
      })
    } catch (e) {
      console.log("[Keepnet] Could not send screenshot notification:", e.message)
    }
    
    sendResponse({ ok: true, dataUrl: dataUrl })
  } catch (error) {
    console.error("[Keepnet] Screenshot error:", error)
    sendResponse({ ok: false, error: error.message })
  }
}

// Tab güncellemelerini dinle - Workflow geçişlerinde paneli otomatik aç
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && globalState.isActive) {
    const url = new URL(tab.url)
    const validHosts = ['security.microsoft.com', 'admin.exchange.microsoft.com']
    
    if (validHosts.includes(url.hostname)) {
      console.log("[Keepnet] Valid page loaded, ensuring assistant is active...")
      
      // Content script yüklendi mi kontrol et ve paneli aç
      setTimeout(async () => {
        try {
          const pingResponse = await safeSendMessage(tabId, { action: 'ping' })
          console.log("[Keepnet] Ping successful:", pingResponse)
          
          // Panel açık mı kontrol et
          try {
            const panelStatus = await safeSendMessage(tabId, { action: 'isPanelOpen' })
            
            if (!panelStatus || !panelStatus.isOpen) {
              console.log("[Keepnet] Panel is closed, opening...")
              await safeSendMessage(tabId, { action: 'showPanel' })
            } else {
              console.log("[Keepnet] Panel already open")
            }
          } catch (e) {
            console.log("[Keepnet] Panel check failed, initializing assistant...")
            await safeSendMessage(tabId, { action: 'initAssistant' })
          }
        } catch {
          // Content script yok, inject et
          console.log("[Keepnet] Content script not found, injecting...")
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tabId },
              files: ['content.js']
            })
            
            await chrome.scripting.insertCSS({
              target: { tabId: tabId },
              files: ['content.css']
            })
            
            console.log("[Keepnet] Content script injected, initializing...")
            
            // Script yüklendi, 2 saniye bekle ve initialize et
            setTimeout(async () => {
              try {
                // Önce ping ile kontrol et
                const pingResponse = await safeSendMessage(tabId, { action: 'ping' }, 3000)
                console.log("[Keepnet] Ping successful after tab update:", pingResponse)
                
                // Sonra initialize et
                await safeSendMessage(tabId, { action: 'initAssistant' }, 5000)
                console.log("[Keepnet] Assistant initialized after tab update")
              } catch (e) {
                console.error("[Keepnet] Init failed after inject:", e)
                // Son bir deneme daha yap
                setTimeout(async () => {
                  try {
                    console.log("[Keepnet] Final retry after tab update...")
                    await safeSendMessage(tabId, { action: 'initAssistant' }, 10000)
                  } catch (finalError) {
                    console.error("[Keepnet] Final retry failed after tab update:", finalError)
                  }
                }, 2000)
              }
            }, 2000)
          } catch (e) {
            console.error("[Keepnet] Inject failed:", e)
          }
        }
      }, 1000)
    }
  }
})

console.log("[Keepnet] Background service worker ready")

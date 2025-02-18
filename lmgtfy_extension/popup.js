// Theme management
function setTheme(theme) {
  document.body.dataset.theme = theme
  chrome.storage.local.set({ theme })
}

document.getElementById('themeToggle').addEventListener('click', () => {
  const currentTheme = document.body.dataset.theme || 'dark'
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  setTheme(newTheme)
})

// Load saved theme
chrome.storage.local.get('theme', ({ theme }) => {
  setTheme(theme || 'dark')
})

// Search functionality
document.getElementById('submitBtn').addEventListener('click', () => {
  const userInput = document.getElementById('userInput').value.trim()
  if (!userInput) return

  const grokUrl = 'https://x.com/i/grok'

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0]

    const executeSearch = (tabId) => {
      chrome.scripting.executeScript({
        target: { tabId },
        args: [userInput],
        func: (value) => {
          const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
              const textarea = document.querySelector(
                '#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div > div > div.r-6koalj.r-eqz5dr.r-1pi2tsx.r-13qz1uu > div > div > div > div > div.css-175oi2r.r-1awozwy.r-13qz1uu > div > div > div > div:nth-child(1) > div > div.css-175oi2r.r-1wbh5a2.r-16y2uox > div > textarea',
              )
              if (textarea) {
                textarea.value = value
                textarea.dispatchEvent(new Event('input', { bubbles: true }))
                observer.disconnect()
              }
            })
          })
          observer.observe(document.body, { childList: true, subtree: true })
        },
      })
    }

    if (currentTab.url?.startsWith(grokUrl)) {
      executeSearch(currentTab.id)
    } else {
      chrome.tabs.update(currentTab.id, { url: grokUrl }, (updatedTab) => {
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === updatedTab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener)
            executeSearch(tabId)
          }
        })
      })
    }
  })
})

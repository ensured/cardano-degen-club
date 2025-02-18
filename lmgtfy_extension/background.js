chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'insertSearch') {
    const url = 'https://x.com/i/grok'
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let tab = tabs[0]
      if (tab.url !== url) {
        chrome.tabs.update(tab.id, { url: url }, (updatedTab) => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
            if (tabId === updatedTab.id && changeInfo.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener)
              chrome.scripting.executeScript({
                target: { tabId: tabId },
                args: [request.inputValue],
                func: (inputValue) => {
                  const textarea = document.querySelector(
                    '#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div > div > div.r-6koalj.r-eqz5dr.r-1pi2tsx.r-13qz1uu > div > div > div > div > div.css-175oi2r.r-1awozwy.r-13qz1uu > div > div > div > div:nth-child(1) > div > div.css-175oi2r.r-1wbh5a2.r-16y2uox > div > textarea',
                  )
                  if (textarea) {
                    textarea.value = inputValue
                    textarea.dispatchEvent(new Event('input', { bubbles: true }))
                  }
                },
              })
            }
          })
        })
      } else {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          args: [request.inputValue],
          func: (inputValue) => {
            const textarea = document.querySelector(
              '#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div > div > div.r-6koalj.r-eqz5dr.r-1pi2tsx.r-13qz1uu > div > div > div > div > div.css-175oi2r.r-1awozwy.r-13qz1uu > div > div > div > div:nth-child(1) > div > div.css-175oi2r.r-1wbh5a2.r-16y2uox > div > textarea',
            )
            if (textarea) {
              textarea.value = inputValue
              textarea.dispatchEvent(new Event('input', { bubbles: true }))
            }
          },
        })
      }
    })
  }
})

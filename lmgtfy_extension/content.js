// Observe for DOM changes to handle dynamic content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (!mutation.addedNodes) return

    const textarea = document.querySelector(
      '#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div > div > div.r-6koalj.r-eqz5dr.r-1pi2tsx.r-13qz1uu > div > div > div.css-175oi2r.r-1p0dtai.r-gtdqiz.r-13qz1uu > div.css-175oi2r.r-1awozwy.r-1e5uvyk.r-5zmot.r-1777fci.r-kzbkwu.r-3o4zer.r-1h8ys4a > div > div > div > div > div:nth-child(1) > div > div.css-175oi2r.r-1wbh5a2.r-16y2uox > div > textarea',
    )

    if (textarea) {
      // Show the extension icon when textarea is found
      chrome.runtime.sendMessage({ action: 'showIcon' })
    }
  })
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
})

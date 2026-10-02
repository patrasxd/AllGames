;(function () {
  try {
    var t = localStorage.getItem('allgames:theme') || 'dark'
    document.documentElement.setAttribute('data-theme', t)
    document.documentElement.setAttribute('data-all-theme', t)
    if (t.indexOf('e-ink') !== -1) {
      document.documentElement.setAttribute('data-eink', 'true')
    }
  } catch (e) {}
})()

function getBrowser(key) {
  return window.browser ? window.browser[key] : window.chrome[key];
}

let userTabs = [];
const omnibox = getBrowser('omnibox')
const tabs = getBrowser('tabs');

omnibox.onInputStarted.addListener(async function () {
  tabs.query({ currentWindow: true }, (foundTabs) => {
    userTabs = foundTabs;
  });
});

omnibox.onInputChanged.addListener(function (text, suggestCb) {
  const regex = RegExp(text, 'gi');
  const filtered = userTabs
    .filter(t => regex.test(t.title) || regex.test(t.url))
    .map(t => ({ content: `${t.url}@@@${t.index}`, description: t.title }));

  suggestCb(filtered);
});

omnibox.onInputEntered.addListener(function (content, disposition) {
  const tabId = +content.split('@@@')[1];
  tabs.query({ active: true }, (foundTabs) => {
    tabs.highlight({ tabs: [tabId] });
    tabs.remove(foundTabs[0].id);
  });
});

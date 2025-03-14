import type { VNode } from 'vue';

export type CheckUpdatesNotifyActionType = 'update' | 'remind-later' | 'skip-this-version' | 'never-notify' | string;

interface CheckUpdatesOptions {
  url: string
  interval: number
  // compareType: 'html' | 'source' | 'js' | 'css';
  notifierWithAction: (changelog: string | VNode) => Promise<CheckUpdatesNotifyActionType>
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function fetchRootHtml(url: string) {
  const input = url.includes('?') ? `${url}&timestamp=${Date.now()}` : `${url}?timestamp=${Date.now()}`;
  return fetch(input, { headers: { 'cache-control': 'no-cache' } })
    .then(res => res.text());
}

const initialResources = {
  html: '',
  neverFetched: false,
};

function notify(newHtml: string, options: CheckUpdatesOptions) {
  options.notifierWithAction('').then(action => {
    switch (action) {
      case 'update':
        window.location.reload();
        break;
      case 'remind-later':
        wait(options.interval).then(() => notify(newHtml, options));
        break;
      case 'skip-this-version':
        initialResources.html = newHtml;
        wait(options.interval).then(() => checkUpdates(options));
        break;
      case 'never-notify':
        initialResources.neverFetched = true;
        break;
      default:
        break;
    }
  }).catch(() => {
    wait(options.interval).then(() => checkUpdates(options));
  });
}

export function checkUpdates(options: Partial<CheckUpdatesOptions>) {
  if (initialResources.neverFetched) {
    return;
  }

  const defaultOptions: CheckUpdatesOptions = {
    url: '/',
    interval: 1000 * 60 * 5,
    notifierWithAction: () => Promise.resolve(''),
  };
  const { url, interval, notifierWithAction } = { ...defaultOptions, ...options };
  fetchRootHtml(url).then((html: string) => {
    // 如果还没有获取过资源，或者资源没有变化，则等待一段时间后再次检查
    if (!initialResources.html || initialResources.html === html) {
      initialResources.html = html;
      wait(interval).then(() => checkUpdates(options));
      return;
    }

    notify(html, { url, interval, notifierWithAction });
  }).catch(() => {
    wait(interval).then(() => checkUpdates(options));
  });
}

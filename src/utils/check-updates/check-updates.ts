import type { VNode } from 'vue';

export type CheckUpdatesNotifyActionType = 'update' | 'remind-later' | 'skip-this-version' | 'never-notify';

interface CheckUpdatesOptions {
  url: string
  interval: number
  // compareType: 'html' | 'source' | 'js' | 'css';
  notifierWithAction: (changelog: string | VNode) => Promise<CheckUpdatesNotifyActionType>
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getTime(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const hour = `0${date.getHours()}`.slice(-2);
  const minute = `0${date.getMinutes()}`.slice(-2);
  const second = `0${date.getSeconds()}`.slice(-2);
  return `${year}-${month}-${day}~${hour}:${minute}:${second}`;
}

function fetchRootHtml(url: string) {
  const time = getTime();
  const query = `time=${time}`;
  const input = url.includes('?') ? `${url}&${query}` : `${url}?${query}`;
  console.warn(time, '发起更新检测');
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
    notifierWithAction: () => wait(1000 * 30).then(() => 'remind-later'),
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

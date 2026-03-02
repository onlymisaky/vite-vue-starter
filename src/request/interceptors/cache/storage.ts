import GeedStorage from 'geed-storage';

type StorageMode = 'localStorage' | 'sessionStorage' | 'memory';

const lStorage = new GeedStorage({ mode: 'localStorage' });
const sStorage = new GeedStorage({ mode: 'sessionStorage' });
const mStorage = new GeedStorage({ mode: 'memory' });

export function getStorage(mode?: StorageMode) {
  switch (mode) {
    case 'localStorage':
      return lStorage;
    case 'sessionStorage':
      return sStorage;
    case 'memory':
      return mStorage;
    default:
      return mStorage;
  }
}

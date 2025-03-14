import router from '@/routes';
import { checkUpdates } from './check-updates';
import { notification } from './notification';

checkUpdates({
  url: router.options.history.base || '/',
  notifierWithAction: notification,
});

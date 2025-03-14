import { checkUpdates } from './check-updates';
import { notification } from './notification';

checkUpdates({
  notifierWithAction: notification,
});

import { account } from '@/lib/appwrites/client';

export async function getCurrentAccount() {
  return account.get();
}
export async function updateAccountPrefs(prefs: Record<string, any>) {
  return account.updatePrefs(prefs);
}
export async function logoutCurrentSession() {
  return account.deleteSession('current');
}

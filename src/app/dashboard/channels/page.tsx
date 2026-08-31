import { redirect } from 'next/navigation';

export default function DashboardChannelsRedirect() {
  redirect('/dashboard/settings/channels');
}

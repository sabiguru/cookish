import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardTopBar from '@/components/dashboard/DashboardTopBar';

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  const userRole = (session.user as any)?.role || 'USER';

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar userRole="USER" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar user={session.user} userRole={userRole} currentDashboard="user" />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

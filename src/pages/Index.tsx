import { TopBar } from '@/components/TopBar';
import { PersonalDashboard } from '@/components/PersonalDashboard';
import { WeeklyTimesheet } from '@/components/WeeklyTimesheet';
import { ExportButton } from '@/components/ExportButton';
import { useCurrentUser } from '@/contexts/UserContext';

const Index = () => {
  const { currentUser } = useCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <main className="container py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground">
              Track your time and stay on top of your weekly targets
            </p>
          </div>
          <ExportButton />
        </div>

        {/* Dashboard Stats */}
        <PersonalDashboard />

        {/* Weekly Timesheet */}
        <WeeklyTimesheet />
      </main>
    </div>
  );
};

export default Index;

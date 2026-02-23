import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { PersonalDashboard } from '@/components/PersonalDashboard';
import { WeeklyTimesheet } from '@/components/WeeklyTimesheet';
import { Button } from '@/components/ui/button';
import { useAuthenticatedUser } from '@/contexts/UserContext';

const Index = () => {
  const { currentUser } = useAuthenticatedUser();
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
          <Button variant="outline" asChild className="gap-2">
            <Link to="/me/insights">
              History &amp; Insights
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Weekly Timesheet - Primary action area */}
        <WeeklyTimesheet />

        {/* Dashboard Stats - Secondary */}
        <PersonalDashboard />
      </main>
    </div>
  );
};

export default Index;

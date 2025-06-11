import DashboardOverviewNew from '../../components/dashboard/DashboardOverviewNew';

export const metadata = {
  title: 'New Dashboard Overview | GIU EV Charging Infrastructure',
  description: 'Enhanced dashboard view for EV fleet management'
};

export default function NewDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <DashboardOverviewNew />
    </div>
  );
} 
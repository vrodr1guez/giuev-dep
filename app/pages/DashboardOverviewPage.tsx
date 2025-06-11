import * as React from 'react';
import EnhancedDashboardOverview from '../components/dashboard/EnhancedDashboardOverview';
import DashboardLayout from '../components/layout/DashboardLayout';

const DashboardOverviewPage: React.FC = () => {
  return (
    <DashboardLayout>
      <EnhancedDashboardOverview />
    </DashboardLayout>
  );
};

export default DashboardOverviewPage; 
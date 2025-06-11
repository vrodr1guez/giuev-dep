'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/layout/MainLayout';
import GridStatusMonitor from '../../components/grid/GridStatusMonitor';
import V2GVehicleManager from '../../components/grid/V2GVehicleManager';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`grid-tabpanel-${index}`}
      aria-labelledby={`grid-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div className="py-3">
          {children}
        </div>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `grid-tab-${index}`,
    'aria-controls': `grid-tabpanel-${index}`,
  };
}

const GridIntegrationDashboard = () => {
  const router = useRouter();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  };

  return (
    <>
      <MainLayout>
        <div className="container mx-auto py-4">
          <h1 className="text-3xl font-bold mb-4">
            Grid Integration Dashboard
          </h1>
          
          <p className="text-base text-gray-700 mb-4">
            Monitor grid status, manage V2G-capable vehicles, and optimize energy flow between vehicles and the grid
          </p>
          
          <div className="border-b border-gray-200 mb-4">
            {/* Placeholder for the divider */}
          </div>
          
          <div className="bg-white rounded-lg mb-4">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  onClick={(event) => handleChange(event, 0)}
                >
                  Grid Status
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  onClick={(event) => handleChange(event, 1)}
                >
                  V2G Vehicle Management
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  onClick={(event) => handleChange(event, 2)}
                >
                  Fleet Energy Analytics
                </button>
              </div>
            </div>
          </div>
          
          <TabPanel value={value} index={0}>
            <GridStatusMonitor />
          </TabPanel>
          
          <TabPanel value={value} index={1}>
            <V2GVehicleManager />
          </TabPanel>
          
          <TabPanel value={value} index={2}>
            <div className="p-4 text-center">
              <h5 className="text-base text-gray-700">
                Fleet Energy Analytics Coming Soon
              </h5>
              <p className="text-sm text-gray-500 mt-2">
                Advanced analytics to visualize and optimize energy flow between your fleet and the grid
              </p>
            </div>
          </TabPanel>
        </div>
      </MainLayout>
    </>
  );
};

export default GridIntegrationDashboard; 
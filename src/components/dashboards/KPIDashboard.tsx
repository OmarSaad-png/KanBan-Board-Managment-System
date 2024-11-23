import { useState, useEffect } from 'react';
import { User } from '../../utils/auth-types';
import { KPIRecord } from '../../utils/data-tasks';
import { fetchKPIRecords } from '../../utils/api';

interface KPIDashboardProps {
  teamMembers: User[];
}

export default function KPIDashboard({ teamMembers }: KPIDashboardProps) {
  const [kpiRecords, setKpiRecords] = useState<KPIRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadKPIRecords();
  }, []);

  const loadKPIRecords = async () => {
    try {
      const records = await fetchKPIRecords();
      setKpiRecords(records);
    } catch (error) {
      console.error('Failed to load KPI records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMemberKPI = (memberId: string) => {
    return kpiRecords
      .filter(record => record.userId === memberId)
      .reduce((total, record) => total + record.points, 0);
  };

  if (isLoading) return <div>Loading KPI data...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Team KPI Dashboard</h2>
      <div className="space-y-4">
        {teamMembers.map(member => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-sm text-gray-600">Team Member</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {calculateMemberKPI(member.id)}
              </p>
              <p className="text-sm text-gray-600">Total Points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
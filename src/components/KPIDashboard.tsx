import { useState, useEffect } from 'react';
import { User } from '../utils/auth-types';
import { KPIRecord } from '../utils/data-tasks';
import { fetchKPIRecords } from '../utils/api';
import Loading from './common/Loading';

interface KPIDashboardProps {
  teamMembers: User[];
  refreshTrigger?: number;
}

export default function KPIDashboard({ teamMembers, refreshTrigger }: KPIDashboardProps) {
  const [kpiRecords, setKpiRecords] = useState<KPIRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadKPIRecords();
  }, [refreshTrigger]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'KPI_UPDATE') {
        setKpiRecords(prevRecords => [...prevRecords, data.record]);
      }
    };

    return () => ws.close();
  }, []);

  const loadKPIRecords = async () => {
    try {
      const records = await fetchKPIRecords();
      setKpiRecords(records);
    } catch (error) {
      setError('Failed to load KPI data');
      console.error('Failed to load KPI records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMemberKPI = (memberId: string) => {
    const memberRecords = kpiRecords.filter(record => record.userId === memberId);
    return {
      totalPoints: memberRecords.reduce((total, record) => total + record.points, 0),
      completedTasks: memberRecords.length,
      lastApproval: memberRecords.length > 0 
        ? new Date(memberRecords[memberRecords.length - 1].approvedAt).toLocaleDateString()
        : 'No approvals yet'
    };
  };

  if (isLoading) return <Loading size="small" />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Team Performance</h2>
      <div className="space-y-4">
        {teamMembers.map(member => {
          const kpi = calculateMemberKPI(member.id);
          return (
            <div 
              key={member.id} 
              className="p-4 bg-white rounded-lg shadow border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <span className="text-sm text-gray-500">Team Member</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {kpi.totalPoints}
                  </p>
                  <p className="text-sm text-gray-600">Total Points</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {kpi.completedTasks}
                  </p>
                  <p className="text-sm text-gray-600">Tasks Completed</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Last approval: {kpi.lastApproval}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
} 
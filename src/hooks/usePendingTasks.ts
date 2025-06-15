
import { useState, useEffect } from 'react';
import { ScheduledAction } from '@/types';
import { scheduledActionAPI } from '@/services/scheduledActionAPI';

export const usePendingTasks = (opportunityId: string) => {
  const [pendingTasks, setPendingTasks] = useState<ScheduledAction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPendingTasks = async () => {
      if (!opportunityId) return;
      
      setLoading(true);
      try {
        const allTasks = await scheduledActionAPI.getByOpportunityId(opportunityId);
        const pending = allTasks.filter(task => 
          task.status === 'pending' && 
          task.actionType === 'task'
        );
        setPendingTasks(pending);
      } catch (error) {
        console.error('Error loading pending tasks:', error);
        setPendingTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadPendingTasks();
  }, [opportunityId]);

  const completeTask = async (taskId: string) => {
    try {
      await scheduledActionAPI.execute(taskId);
      setPendingTasks(prev => prev.filter(task => task.id !== taskId));
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  };

  return {
    pendingTasks,
    loading,
    completeTask,
    refreshTasks: () => {
      if (opportunityId) {
        const loadPendingTasks = async () => {
          const allTasks = await scheduledActionAPI.getByOpportunityId(opportunityId);
          const pending = allTasks.filter(task => 
            task.status === 'pending' && 
            task.actionType === 'task'
          );
          setPendingTasks(pending);
        };
        loadPendingTasks();
      }
    }
  };
};

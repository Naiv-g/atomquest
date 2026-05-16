'use client';

import { useApp } from '@/contexts/AppContext';
import toast from 'react-hot-toast';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { computeScore, formatDateTime, exportToExcel } from '@/lib/utils';
import { QuarterKey } from '@/lib/types';

const QUARTERS: QuarterKey[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function AdminReportsPage() {
  const { users, goals } = useApp();

  const handleExportAchievement = async () => {
    const rows: Record<string, unknown>[] = [];
    goals.forEach(g => {
      const emp = users.find(u => u.id === g.employeeId);
      QUARTERS.forEach(q => {
        const ach = g.quarterlyAchievements.find(a => a.quarter === q);
        rows.push({
          Employee: g.employeeName,
          Department: g.department,
          Manager: emp?.managerName ?? '—',
          'Thrust Area': g.thrustArea,
          'Goal Title': g.title,
          'UoM': g.uomLabel,
          'Target': g.target,
          Weightage: `${g.weightage}%`,
          'Approval Status': g.approvalStatus,
          Quarter: q,
          'Actual Achievement': ach ? ach.actual : '—',
          'Goal Status': ach?.status ?? '—',
          'Score (%)': ach ? computeScore(g.uomType, g.target, ach.actual) : '—',
          Notes: ach?.notes ?? '—',
        });
      });
    });
    await exportToExcel(rows, 'AtomQuest_Achievement_Report');
    toast.success('Achievement report exported!');
  };

  const handleExportCompletion = async () => {
    const rows = users.filter(u => u.role === 'employee').map(emp => {
      const empGoals = goals.filter(g => g.employeeId === emp.id);
      const approved = empGoals.filter(g => g.approvalStatus === 'locked');
      const q1Done = approved.filter(g => g.quarterlyAchievements.some(a => a.quarter === 'Q1'));
      return {
        Employee: emp.name,
        Email: emp.email,
        Department: emp.department,
        Manager: emp.managerName ?? '—',
        'Total Goals': empGoals.length,
        'Approved Goals': approved.length,
        'Q1 Check-in': q1Done.length > 0 ? 'Completed' : 'Pending',
        'Q2 Check-in': approved.filter(g => g.quarterlyAchievements.some(a => a.quarter === 'Q2')).length > 0 ? 'Completed' : 'Pending',
        'Q3 Check-in': 'Pending',
        'Q4 Check-in': 'Pending',
      };
    });
    await exportToExcel(rows, 'AtomQuest_Completion_Report');
    toast.success('Completion report exported!');
  };

  const handleExportAudit = async () => {
    const rows = goals.flatMap(g => g.auditLog.map(log => ({
      'Goal ID': log.goalId,
      'Goal Title': goals.find(x => x.id === log.goalId)?.title ?? '—',
      'Changed By': log.userName,
      Action: log.action,
      Field: log.field ?? '—',
      'Old Value': log.oldValue ?? '—',
      'New Value': log.newValue ?? '—',
      Timestamp: formatDateTime(log.timestamp),
    })));
    await exportToExcel(rows, 'AtomQuest_Audit_Log');
    toast.success('Audit log exported!');
  };

  // Summary Table Data
  const summaryRows = users.filter(u => u.role === 'employee').map(emp => {
    const empGoals = goals.filter(g => g.employeeId === emp.id);
    const locked = empGoals.filter(g => g.approvalStatus === 'locked');
    const q1 = locked.filter(g => g.quarterlyAchievements.some(a => a.quarter === 'Q1'));
    const avgQ1Score = q1.length > 0
      ? Math.round(q1.reduce((sum, g) => {
          const ach = g.quarterlyAchievements.find(a => a.quarter === 'Q1');
          return sum + (ach ? computeScore(g.uomType, g.target, ach.actual) : 0);
        }, 0) / q1.length)
      : null;
    return { emp, empGoals, locked, q1, avgQ1Score };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Reports & Exports</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Export achievement data, completion status, and audit trails
        </p>
      </div>

      {/* Export Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          {
            title: 'Achievement Report', desc: 'Planned Target vs Actual Achievement for all employees across all quarters',
            icon: FileSpreadsheet, color: '#10b981', action: handleExportAchievement, label: 'Export Achievement',
          },
          {
            title: 'Completion Report', desc: 'Which employees & managers have completed quarterly check-ins',
            icon: FileText, color: '#3b82f6', action: handleExportCompletion, label: 'Export Completion',
          },
          {
            title: 'Audit Log', desc: 'All changes to goals after lock date — who changed what and when',
            icon: Download, color: '#8b5cf6', action: handleExportAudit, label: 'Export Audit Log',
          },
        ].map(({ title, desc, icon: Icon, color, action, label }) => (
          <div key={title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{title}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </div>
            <button onClick={action} className="btn-primary" style={{ justifyContent: 'center' }}>
              <Download size={14} /> {label} (Excel)
            </button>
          </div>
        ))}
      </div>

      {/* Achievement Summary Table */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Achievement Summary — All Employees</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Total Goals</th>
                <th>Approved</th>
                <th>Q1 Check-in</th>
                <th>Q1 Avg Score</th>
                <th>Approval Status</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map(({ emp, empGoals, locked, q1, avgQ1Score }) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 600 }}>{emp.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{emp.department}</td>
                  <td>{empGoals.length}</td>
                  <td style={{ color: locked.length === empGoals.length && empGoals.length > 0 ? '#10b981' : 'var(--text-primary)' }}>
                    {locked.length}/{empGoals.length}
                  </td>
                  <td>
                    {q1.length > 0 ? (
                      <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Done ({q1.length})</span>
                    ) : (
                      <span style={{ color: '#64748b' }}>Pending</span>
                    )}
                  </td>
                  <td>
                    {avgQ1Score !== null ? (
                      <span style={{ fontWeight: 700, color: avgQ1Score >= 80 ? '#10b981' : avgQ1Score >= 60 ? '#f59e0b' : '#ef4444' }}>
                        {avgQ1Score}%
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {empGoals.filter(g => g.approvalStatus === 'submitted').length > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>⏳ {empGoals.filter(g => g.approvalStatus === 'submitted').length} pending</span>
                      )}
                      {locked.length > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ {locked.length} locked</span>
                      )}
                      {empGoals.filter(g => g.approvalStatus === 'draft').length > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>📝 {empGoals.filter(g => g.approvalStatus === 'draft').length} draft</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

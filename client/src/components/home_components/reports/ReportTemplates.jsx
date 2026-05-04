import { useState } from 'react';

const ScheduledReports = () => {
  const [schedules, setSchedules] = useState([]);

  const toggleStatus = (id) => {
    setSchedules(schedules.map(schedule =>
      schedule.id === id
        ? { ...schedule, status: schedule.status === 'active' ? 'paused' : 'active' }
        : schedule
    ));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-white text-sm font-bold">Scheduled Reports</h3>
        <button className="px-3 py-1.5 bg-[#00E5FF] text-black font-bold rounded-lg text-xs">
          + New
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-white/5 p-8 text-center rounded-lg">
          <p className="text-white/40 text-sm">No schedules yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white/5 p-3 rounded-lg">
              {/* Title row */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-sm font-medium">{schedule.name}</span>
                <span className={`text-xs ${schedule.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {schedule.status}
                </span>
              </div>

              {/* Details - simple grid */}
              <div className="text-xs text-white/60 space-y-1 mb-2">
                <div>Template: {schedule.template}</div>
                <div>Frequency: {schedule.frequency}</div>
                <div>Next: {schedule.nextRun}</div>
              </div>

              {/* Recipients */}
              <div className="text-xs text-white/40 mb-2">
                To: {schedule.recipients.join(', ')}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button onClick={() => toggleStatus(schedule.id)} className="text-xs text-white/60 px-2 py-1">
                  {schedule.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button className="text-xs text-white/60 px-2 py-1">Edit</button>
                <button className="text-xs text-red-400/60 px-2 py-1">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduledReports;
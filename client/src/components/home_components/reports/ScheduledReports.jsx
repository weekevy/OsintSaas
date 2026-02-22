import { useState } from 'react';

const ScheduledReports = () => {
  const [schedules, setSchedules] = useState([
    // {
    //   id: 1,
    //   name: 'Weekly Threat Briefing',
    //   template: 'Executive Summary',
    //   frequency: 'Every Monday',
    //   recipients: ['security@company.com', 'management@company.com'],
    //   nextRun: '2024-03-25 09:00',
    //   status: 'active'
    // },
    // {
    //   id: 2,
    //   name: 'Daily IOC Feed',
    //   template: 'Technical Analysis',
    //   frequency: 'Daily',
    //   recipients: ['soc@company.com'],
    //   nextRun: '2024-03-19 08:00',
    //   status: 'active'
    // },
    // {
    //   id: 3,
    //   name: 'Monthly OSINT Report',
    //   template: 'Threat Intelligence',
    //   frequency: '1st of month',
    //   recipients: ['team@company.com'],
    //   nextRun: '2024-04-01 10:00',
    //   status: 'paused'
    // }


  ]);

  const toggleStatus = (id) => {
    setSchedules(schedules.map(schedule =>
      schedule.id === id
        ? { ...schedule, status: schedule.status === 'active' ? 'paused' : 'active' }
        : schedule
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Scheduled Reports</h3>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all">
          New Schedule
        </button>
      </div>

      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/5 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-white font-medium">{schedule.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    schedule.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {schedule.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-white/40">Template:</span>
                    <span className="ml-2 text-white/80">{schedule.template}</span>
                  </div>
                  <div>
                    <span className="text-white/40">Frequency:</span>
                    <span className="ml-2 text-white/80">{schedule.frequency}</span>
                  </div>
                  <div>
                    <span className="text-white/40">Next Run:</span>
                    <span className="ml-2 text-white/80">{schedule.nextRun}</span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-white/40 text-sm">Recipients:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {schedule.recipients.map((email, i) => (
                      <span key={i} className="px-2 py-1 bg-white/5 rounded-lg text-white/60 text-xs">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => toggleStatus(schedule.id)}
                  className={`p-2 rounded-lg transition-all ${
                    schedule.status === 'active'
                      ? 'text-yellow-400 hover:bg-yellow-500/10'
                      : 'text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  {schedule.status === 'active' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
                <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduledReports;

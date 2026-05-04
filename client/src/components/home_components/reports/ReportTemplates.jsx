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
    <div className="space-y-5 font-['Poppins']">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
          <h3 className="text-white font-['Poppins'] text-[11px] font-bold uppercase tracking-[0.15em]">Scheduled Reports</h3>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-xl hover:opacity-90 transition-all duration-200 text-[11px] font-['Poppins'] uppercase tracking-[0.08em] flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Schedule
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
            <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="font-['Poppins'] text-sm font-bold text-white/60 uppercase tracking-widest mb-1">
            No Scheduled Reports
          </h3>
          <p className="text-white/30 text-xs font-['Poppins'] uppercase tracking-[0.1em]">
            Create a schedule to automate report generation
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:border-[#00E5FF]/30 transition-all duration-300 p-4"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-['Poppins'] text-[13px] font-bold uppercase tracking-[0.08em]">{schedule.name}</h4>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-['Poppins'] font-bold uppercase tracking-[0.08em] ${
                      schedule.status === 'active'
                        ? 'border border-[#00E5FF]/40 text-[#00E5FF] bg-[#00E5FF]/5'
                        : 'border border-yellow-500/40 text-yellow-400 bg-yellow-500/5'
                    }`}>
                      {schedule.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] font-['Poppins']">
                    <div>
                      <span className="text-white/40">Template:</span>
                      <span className="ml-2 text-white/70">{schedule.template}</span>
                    </div>
                    <div>
                      <span className="text-white/40">Frequency:</span>
                      <span className="ml-2 text-white/70">{schedule.frequency}</span>
                    </div>
                    <div>
                      <span className="text-white/40">Next Run:</span>
                      <span className="ml-2 text-white/70">{schedule.nextRun}</span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <span className="text-white/40 text-[9px] font-['Poppins']">Recipients:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {schedule.recipients.map((email, i) => (
                        <span key={i} className="px-2 py-1 bg-white/5 rounded-lg text-white/50 text-[8px] font-['Poppins']">
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(schedule.id)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      schedule.status === 'active'
                        ? 'text-yellow-400 hover:bg-yellow-500/10'
                        : 'text-[#00E5FF] hover:bg-[#00E5FF]/10'
                    }`}
                  >
                    {schedule.status === 'active' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                  <button className="p-2 rounded-lg text-white/40 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-lg text-white/40 hover:text-[#f87171] hover:bg-[#f87171]/10 transition-all duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduledReports;
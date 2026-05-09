import { useState, useEffect, useRef } from 'react';

const PERSIST_KEY = 'riskCircle_lastState';

const RiskCircle = ({
  riskData = null,
  projectName,
  projectTarget,
  projectStatus = 'idle',
  projectFindings = 0,
}) => {
  // ── Initialise from localStorage so there's no flicker on refresh ──
  const getPersistedState = () => {
    try {
      const saved = localStorage.getItem(PERSIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  };

  const persisted = getPersistedState();

  const [displayScore, setDisplayScore] = useState(persisted?.score ?? 0);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const scanTimerRef = useRef(null);

  // Track previous status so we only react to genuine changes
  const prevStatusRef = useRef(persisted?.status ?? 'idle');

  const isRunning   = projectStatus === 'running';
  const isPending   = projectStatus === 'pending';
  const isPaused    = projectStatus === 'paused';
  const isCompleted = projectStatus === 'completed';
  const isFailed    = projectStatus === 'failed';
  const isStopped   = projectStatus === 'stopped';
  const isQueued    = projectStatus === 'queued';
  const hasProject  = projectName && projectName !== 'No Project Selected';

  const generateRandomRiskScore = () => Math.floor(Math.random() * 80) + 15;

  const clearScanTimer = () => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
  };

  // Persist score + status whenever they change so refresh is instant
  // But only persist when a project is actually selected
  useEffect(() => {
    if (!hasProject) {
      try { localStorage.removeItem(PERSIST_KEY); } catch { /* ignore */ }
      return;
    }
    try {
      localStorage.setItem(PERSIST_KEY, JSON.stringify({
        score: displayScore,
        status: projectStatus,
      }));
    } catch { /* ignore */ }
  }, [displayScore, projectStatus, hasProject]);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = projectStatus;

    // Only reset/restart the scan animation when status genuinely transitions
    // to 'running' from something else — not on every render/refresh.
    if (isRunning && prevStatus !== 'running') {
      clearScanTimer();
      setDisplayScore(0);
      setScanProgress(0);
      setIsScanning(true);

      const startTime = Date.now();
      const duration = 5000;

      scanTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / duration) * 100);
        setScanProgress(progress);

        if (elapsed >= duration) {
          clearScanTimer();
          setIsScanning(false);
          setDisplayScore(generateRandomRiskScore());
        }
      }, 100);

    } else if (!isRunning) {
      // For any non-running status just make sure we're not stuck in scanning state
      if (prevStatus === 'running' && !isRunning) {
        clearScanTimer();
        setIsScanning(false);
        setScanProgress(0);
      }
    }

    return clearScanTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectStatus]);

  // Sync score from riskData (only when not actively scanning)
  useEffect(() => {
    if (isScanning || !riskData) return;
    let score = 0;
    if (typeof riskData === 'number') score = riskData;
    else if (riskData.risk_score !== undefined) score = riskData.risk_score;
    else if (riskData.score !== undefined) score = riskData.score;
    else if (riskData.risk_level) {
      const levelMap = { low: 15, medium: 45, high: 70, critical: 85 };
      score = levelMap[riskData.risk_level] ?? 15;
    }
    if (score > 0) setDisplayScore(score);
  }, [riskData, isScanning]);

  useEffect(() => {
    if (isCompleted && !isScanning && displayScore === 0 && projectFindings > 0) {
      setDisplayScore(Math.min(projectFindings * 3, 95));
    }
  }, [isCompleted, isScanning, displayScore, projectFindings]);

  const activeScore = isRunning || isScanning ? Math.floor(scanProgress) : displayScore;
  const spinning    = isRunning || isScanning;

  const getRiskConfig = () => {
    if (spinning) return {
      label: 'SCANNING', color: '#00E5FF',
      border: 'rgba(0,229,255,0.7)', bg: 'rgba(0,229,255,0.12)',
      pulse: true, strokeWidth: 13,
    };
    if (isQueued) return {
      label: 'QUEUED', color: '#a78bfa',
      border: 'rgba(167,139,250,0.35)', bg: 'rgba(167,139,250,0.08)',
      pulse: false, strokeWidth: 11,
    };
    if (isPaused) return {
      label: 'PAUSED', color: '#fb923c',
      border: 'rgba(251,146,60,0.5)', bg: 'rgba(251,146,60,0.12)',
      pulse: false, strokeWidth: 11,
    };
    if (isFailed) return {
      label: 'FAILED', color: '#f87171',
      border: 'rgba(248,113,113,0.5)', bg: 'rgba(248,113,113,0.12)',
      pulse: false, strokeWidth: 11,
    };
    if (isStopped) return {
      label: 'STOPPED', color: 'rgba(255,255,255,0.35)',
      border: 'rgba(255,255,255,0.15)', bg: 'rgba(255,255,255,0.04)',
      pulse: false, strokeWidth: 11,
    };
    if (isPending) return {
      label: 'PENDING', color: '#fbbf24',
      border: 'rgba(251,191,36,0.4)', bg: 'rgba(251,191,36,0.1)',
      pulse: false, strokeWidth: 11,
    };
    // No project selected — always show idle/empty state
    if (!hasProject) return {
      label: 'IDLE', color: 'rgba(255,255,255,0.3)',
      border: 'rgba(255,255,255,0.1)', bg: 'rgba(255,255,255,0.04)',
      pulse: false, strokeWidth: 11,
    };
    const s = activeScore;
    if (s >= 75) return { label: 'CRITICAL', color: '#f87171', border: 'rgba(248,113,113,0.4)', bg: 'rgba(248,113,113,0.1)', pulse: false, strokeWidth: 11 };
    if (s >= 50) return { label: 'HIGH',     color: '#fbbf24', border: 'rgba(251,191,36,0.4)',  bg: 'rgba(251,191,36,0.1)',  pulse: false, strokeWidth: 11 };
    if (s >= 25) return { label: 'MEDIUM',   color: '#fb923c', border: 'rgba(251,146,60,0.4)',  bg: 'rgba(251,146,60,0.1)',  pulse: false, strokeWidth: 11 };
    return { label: 'OPTIMAL', color: '#00E5FF', border: 'rgba(0,229,255,0.4)', bg: 'rgba(0,229,255,0.1)', pulse: false, strokeWidth: 11 };
  };

  const cfg = getRiskConfig();

  // SVG constants
  const SIZE = 200;
  const R    = 82;
  const CX   = SIZE / 2;
  const circ = 2 * Math.PI * R;

  let ringOffset;
  let ringColor  = cfg.color;
  let trackColor = 'rgba(255,255,255,0.06)';

  if (spinning) {
    ringOffset = circ * 0.72;
  } else if (isPaused) {
    ringOffset = 0;
  } else if (isQueued || isPending || isStopped || isFailed || activeScore === 0) {
    ringOffset = circ;
    ringColor  = 'rgba(255,255,255,0.06)';
  } else if (!hasProject) {
    // ── FIX: No project selected → always render an empty/grey ring ──
    ringOffset = circ;
    ringColor  = 'rgba(255,255,255,0.06)';
  } else {
    ringOffset = circ - (activeScore / 100) * circ;
  }

  const showScore = isCompleted && !isScanning && activeScore > 0 && hasProject;

  const getStatusColor = () =>
    (!hasProject && !spinning && !isPaused && !isPending && !isFailed && !isStopped && !isQueued)
      ? 'rgba(255,255,255,0.3)' : cfg.color;

  const getStatusMessage = () => {
    if (spinning)    return 'Scanning target for threats...';
    if (isQueued)    return 'In queue — will start shortly.';
    if (isPaused)    return 'Scan paused — tap Resume to continue.';
    if (isPending)   return 'Waiting for scan to start...';
    if (isFailed)    return 'Scan failed — please retry.';
    if (isStopped)   return 'Scan stopped by user.';
    if (isCompleted) return 'Analysis complete. Review findings below.';
    if (!hasProject) return 'Select a project to initialize risk assessment.';
    return 'Continuous monitoring active.';
  };

  const progressPct   = spinning ? 100 : isPaused ? 100 : showScore ? activeScore : 0;
  const progressColor = (spinning || isPaused || showScore) ? cfg.color : 'rgba(255,255,255,0.08)';
  const progressLabel = spinning ? 'SCANNING' : showScore ? `${activeScore}%` : isPaused ? 'PAUSED' : isQueued ? 'QUEUED' : '—';

  return (
    <div className="relative font-['Poppins']">
      <div
        className="relative rounded-2xl overflow-hidden flex flex-col border border-white/[0.08]"
        style={{ background: '#090b0e', minHeight: '562px' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(140deg, rgba(0,229,255,0.04) 0%, transparent 50%)' }}
        />

        <div className="relative z-10 flex flex-col p-5 sm:p-6 gap-5 sm:gap-6 flex-1">

          {/* ── Header ── */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="shrink-0 w-[2px] h-8 rounded-full"
                style={{ background: `linear-gradient(to bottom, ${cfg.color}, transparent)` }}
              />
              <div className="min-w-0">
                <div className="text-[10px] font-black text-white/35 tracking-[0.2em] uppercase leading-none mb-1">
                  Security Index
                </div>
                <div className="text-[15px] font-bold text-white/90 truncate leading-tight">
                  {!hasProject ? 'STATION IDLE' : projectName}
                </div>
              </div>
            </div>

            <div
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black tracking-[0.12em] uppercase"
              style={{ color: getStatusColor(), borderColor: cfg.border, background: cfg.bg }}
            >
              <span
                className="w-[6px] h-[6px] rounded-full shrink-0"
                style={{
                  background: getStatusColor(),
                  animation: spinning ? 'rc-blink 1s infinite' : 'none',
                }}
              />
              {cfg.label}
            </div>
          </div>

          {/* ── Ring ── */}
          <div className="flex justify-center items-center py-2">
            <div
              className="relative"
              style={{ width: 'min(58vw, 210px)', height: 'min(58vw, 210px)' }}
            >
              <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  transform: 'rotate(-90deg)',
                  animation: spinning ? 'rc-ring-spin 1.1s linear infinite' : 'none',
                  willChange: spinning ? 'transform' : 'auto',
                }}
              >
                <circle cx={CX} cy={CX} r={R} fill="none" stroke={trackColor} strokeWidth={cfg.strokeWidth} />
                <circle
                  cx={CX} cy={CX} r={R}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth={cfg.strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={ringOffset}
                  style={{ transition: spinning ? 'none' : 'stroke-dashoffset 0.45s ease, stroke 0.3s ease' }}
                />
              </svg>

              {/* Center label */}
              <div
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                {spinning && (
                  <div
                    className="font-black tracking-[0.08em] uppercase"
                    style={{ fontSize: 'min(3vw, 12px)', color: cfg.color, opacity: 0.55, letterSpacing: '0.18em' }}
                  >
                    SCANNING
                  </div>
                )}

                {!spinning && isPaused && (
                  <div className="flex items-center gap-2">
                    <div className="w-[6px] h-7 rounded-full" style={{ background: cfg.color }} />
                    <div className="w-[6px] h-7 rounded-full" style={{ background: cfg.color }} />
                  </div>
                )}

                {!spinning && isQueued && (
                  <div className="flex flex-col items-center gap-1.5">
                    <svg
                      viewBox="0 0 24 24" fill="none" stroke={cfg.color}
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ width: 'min(7vw, 28px)', height: 'min(7vw, 28px)', opacity: 0.7 }}
                    >
                      <path d="M5 22h14M5 2h14M17 2v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5V2M7 22v-4a5 5 0 0 1 5-5 5 5 0 0 1 5 5v4"/>
                    </svg>
                    <div
                      className="font-black tracking-[0.18em] uppercase"
                      style={{ fontSize: 'min(2.2vw, 10px)', color: cfg.color, opacity: 0.55 }}
                    >
                      IN QUEUE
                    </div>
                  </div>
                )}

                {!spinning && !isPaused && !isQueued && showScore && (
                  <>
                    <div
                      className="font-black tracking-tighter leading-none"
                      style={{ fontSize: 'min(13vw, 52px)', color: cfg.color }}
                    >
                      {activeScore}
                    </div>
                    <div
                      className="font-black tracking-[0.18em] uppercase mt-1.5 text-white/30"
                      style={{ fontSize: 'min(2.2vw, 10px)' }}
                    >
                      THREAT INDEX
                    </div>
                  </>
                )}

                {!spinning && !isPaused && !isQueued && !showScore && (
                  <div
                    className="font-black"
                    style={{ fontSize: 'min(8vw, 32px)', color: cfg.color }}
                  >
                    {isPending ? '○' : isFailed ? '✕' : isStopped ? '■' : '—'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Info chips ── */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Target',   value: !hasProject ? '—' : (projectTarget || 'Unknown') },
              { label: 'Findings', value: !hasProject ? '—' : String(projectFindings || 0) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="p-2.5 rounded-xl border border-white/[0.05]"
                style={{ background: 'rgba(255,255,255,0.025)' }}
              >
                <div className="text-[9px] font-black text-white/30 tracking-wider uppercase mb-1">{label}</div>
                <div className="text-[12px] font-mono text-white/60 truncate">{value}</div>
              </div>
            ))}
          </div>

          {/* ── Status message ── */}
          <div className="flex items-start gap-2.5">
            <span
              className="w-[5px] h-[5px] rounded-full mt-[5px] shrink-0"
              style={{ background: getStatusColor() }}
            />
            <p className="text-[12px] text-white/45 leading-relaxed font-medium">
              {getStatusMessage()}
            </p>
          </div>

        </div>

        {/* ── Progress bar ── */}
        <div
          className="relative z-10 px-5 sm:px-6 pb-5 sm:pb-6 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-black text-white/28 tracking-[0.16em] uppercase">
              Operational Status
            </span>
            <span
              className="text-[9px] font-black tracking-[0.1em] uppercase"
              style={{ color: progressColor === 'rgba(255,255,255,0.08)' ? 'rgba(255,255,255,0.28)' : cfg.color }}
            >
              {progressLabel}
            </span>
          </div>
          <div
            className="h-[4px] w-full rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressPct}%`,
                background: progressColor,
                transition: spinning ? 'none' : 'width 0.4s ease, background 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rc-blink     { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes rc-ring-spin { from{transform:rotate(-90deg)} to{transform:rotate(270deg)} }
      `}</style>
    </div>
  );
};

export default RiskCircle;
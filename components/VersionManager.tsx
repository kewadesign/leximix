import React, { useEffect, useState } from 'react';
import { Modal } from './UI';
import { AlertTriangle, ArrowLeft, Sparkles, Download } from 'lucide-react';
import { ChangelogModal, ChangelogEntry } from './ChangelogModal';
import { MaintenanceScreen } from './MaintenanceScreen';
import { APP_VERSION } from '../constants';

interface Props {
  isOnline: boolean;
  t: any;
}

export const VersionManager: React.FC<Props> = ({ isOnline, t }) => {
  const [serverVersion, setServerVersion] = useState('');
  const [minVersion, setMinVersion] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const [showForceUpdate, setShowForceUpdate] = useState(false);
  const [showOptionalUpdate, setShowOptionalUpdate] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [viewingChangelogFromForce, setViewingChangelogFromForce] = useState(false);

  // Maintenance State
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const [changelogData, setChangelogData] = useState<ChangelogEntry[]>([]);

  const isCapacitor = (window as any).Capacitor !== undefined;

  // Fetch Version Info from IONOS API & Changelog
  useEffect(() => {
    if (!isOnline) return;

    // Poll system config from IONOS API
    const fetchVersionInfo = async () => {
      try {
        const response = await fetch('https://leximix.de/api/config/system.php');
        const data = await response.json();
        
        if (data.success && data.config) {
          const config = data.config;
          const latest = isCapacitor ? (config.latest_apk_version || config.latest_version || APP_VERSION) : (config.latest_version || APP_VERSION);
          const minimum = config.min_version || '0.0.0';
          const url = config.download_url || (isCapacitor ? 'http://leximix.de/app-release.apk' : '/app-release.apk');

          // Check Maintenance Mode
          if (config.maintenance_mode === 'true' || config.maintenance_active === 'true') {
            setIsMaintenance(true);
            setMaintenanceMessage(config.maintenance_message || '');
          } else {
            setIsMaintenance(false);
          }

          setServerVersion(latest);
          setMinVersion(minimum);
          setDownloadUrl(url);

          checkVersion(latest, minimum);
        }
      } catch (error) {
        console.error('Failed to fetch version info:', error);
        // Fallback to current version
        setServerVersion(APP_VERSION);
        setMinVersion('0.0.0');
      }
    };

    fetchVersionInfo();
    
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchVersionInfo, 30000);

    // Fetch Changelog
    fetch('/changelog.json')
      .then(res => res.json())
      .then(data => setChangelogData(data))
      .catch(err => console.error('Failed to load changelog', err));

    return () => clearInterval(interval);
  }, [isOnline, isCapacitor]);

  const checkVersion = (latest: string, minimum: string) => {
    // Helper to compare versions
    const compare = (v1: string, v2: string) => {
      const p1 = v1.split('.').map(Number);
      const p2 = v2.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
      }
      return 0;
    };

    const current = APP_VERSION;

    // 1. Check Force Update
    if (compare(current, minimum) < 0) {
      setShowForceUpdate(true);
      setShowOptionalUpdate(false); // Force takes precedence
      return;
    } else {
      setShowForceUpdate(false);
    }

    // 2. Check Optional Update
    if (compare(current, latest) < 0) {
      setShowOptionalUpdate(true);
    }

    // 3. Check Changelog (if we are on the latest version or compatible)
    // We show changelog if the last seen version < current version
    const lastSeen = localStorage.getItem('last_seen_version');
    if (!lastSeen || compare(current, lastSeen) > 0) {
      if (compare(current, latest) >= 0) {
        setShowChangelog(true);
        localStorage.setItem('last_seen_version', current);
      }
    }
  };

  const handleDownload = () => {
    if (isCapacitor) {
      // Direct download link for APK (external browser)
      window.open(downloadUrl, '_system');
    } else {
      if (downloadUrl.endsWith('.apk')) {
        window.location.href = downloadUrl;
      } else if (downloadUrl.startsWith('http')) {
        window.location.href = downloadUrl;
      } else {
        // For web updates (reload)
        window.location.reload();
      }
    }
  };

  // Maintenance Mode (Blocking)
  if (isMaintenance) {
    return <MaintenanceScreen message={maintenanceMessage} />;
  }

  // Force Update Modal (Blocking)
  if (showForceUpdate) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
        {/* Rainbow Top Bar */}
        <div className="absolute top-0 left-0 right-0 flex h-3 w-full z-50">
          <div className="flex-1" style={{ background: '#FF006E' }}></div>
          <div className="flex-1" style={{ background: '#FF7F00' }}></div>
          <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
          <div className="flex-1" style={{ background: '#06FFA5' }}></div>
          <div className="flex-1" style={{ background: '#0096FF' }}></div>
          <div className="flex-1" style={{ background: '#8338EC' }}></div>
        </div>

        <div
          className="w-full max-w-md relative animate-in fade-in duration-300"
          style={{
            background: 'var(--color-surface)',
            border: '4px solid var(--color-border)',
            boxShadow: '8px 8px 0px var(--color-border)',
            transform: 'skewY(-1deg)'
          }}
        >
          <div className="p-8 space-y-6 text-center" style={{ transform: 'skewY(1deg)' }}>
            {/* Icon */}
            <div
              className="w-24 h-24 mx-auto flex items-center justify-center animate-pulse"
              style={{
                background: '#FF006E',
                border: '4px solid var(--color-border)',
                boxShadow: '6px 6px 0px var(--color-border)',
                transform: 'rotate(-3deg)'
              }}
            >
              <AlertTriangle size={48} style={{ color: '#FFF' }} />
            </div>

            {/* Title & Description */}
            <div>
              <h2
                className="text-3xl font-black uppercase tracking-wider mb-3"
                style={{ color: 'var(--color-text)' }}
              >
                {t.UPDATES.REQUIRED_TITLE}
              </h2>
              <p
                className="text-sm font-bold leading-relaxed"
                style={{ color: 'var(--color-text)', opacity: 0.8 }}
              >
                {t.UPDATES.REQUIRED_DESC}
              </p>
            </div>

            {/* Version Comparison */}
            <div
              className="flex items-center justify-center gap-4 p-4"
              style={{
                background: 'var(--color-bg)',
                border: '3px solid var(--color-border)',
                boxShadow: '4px 4px 0px var(--color-border)'
              }}
            >
              <div className="flex flex-col items-center">
                <span
                  className="uppercase text-[10px] tracking-widest font-black mb-1"
                  style={{ color: 'var(--color-text)', opacity: 0.6 }}
                >
                  {t.UPDATES.INSTALLED}
                </span>
                <span
                  className="font-mono text-lg font-black"
                  style={{ color: '#FF006E' }}
                >
                  v{APP_VERSION}
                </span>
              </div>
              <ArrowLeft size={20} className="rotate-180" style={{ color: '#FFBE0B' }} />
              <div className="flex flex-col items-center">
                <span
                  className="uppercase text-[10px] tracking-widest font-black mb-1"
                  style={{ color: 'var(--color-text)', opacity: 0.6 }}
                >
                  {t.UPDATES.REQUIRED}
                </span>
                <span
                  className="font-mono text-lg font-black"
                  style={{ color: '#06FFA5' }}
                >
                  v{minVersion}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {isCapacitor ? (
                <button
                  onClick={handleDownload}
                  className="w-full py-4 font-black uppercase text-sm transition-all active:translate-y-1 flex items-center justify-center gap-2"
                  style={{
                    background: '#06FFA5',
                    color: '#000',
                    border: '3px solid var(--color-border)',
                    boxShadow: '6px 6px 0px var(--color-border)'
                  }}
                >
                  <Download size={20} />
                  {t.UPDATES.UPDATE_NOW}
                </button>
              ) : (
                <div
                  className="p-4 space-y-3"
                  style={{
                    background: '#FFBE0B',
                    border: '3px solid var(--color-border)',
                    boxShadow: '4px 4px 0px var(--color-border)'
                  }}
                >
                  <p className="text-sm font-bold leading-relaxed" style={{ color: '#000' }}>
                    Die Website wird gerade aktualisiert. Bitte habe einen Moment Geduld.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3 font-black uppercase text-xs transition-all active:translate-y-1 flex items-center justify-center gap-2"
                    style={{
                      background: '#FFF',
                      color: '#000',
                      border: '3px solid #000',
                      boxShadow: '4px 4px 0px #000'
                    }}
                  >
                    <Download size={16} />
                    Seite neu laden
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setViewingChangelogFromForce(true);
                  setShowChangelog(true);
                }}
                className="w-full text-sm font-bold underline underline-offset-4 transition-opacity hover:opacity-70 pt-2"
                style={{ color: 'var(--color-text)', opacity: 0.8 }}
              >
                {t.UPDATES.WHATS_NEW}
              </button>
            </div>

            {/* Security Badge */}
            <p
              className="text-[10px] uppercase tracking-widest font-black px-4 py-2 inline-block"
              style={{
                background: '#8338EC',
                color: '#FFF',
                border: '2px solid var(--color-border)',
                transform: 'rotate(-1deg)'
              }}
            >
              {t.UPDATES.SECURITY}
            </p>
          </div>
        </div>

        {/* Show Changelog on top if requested */}
        {showChangelog && viewingChangelogFromForce && (
          <div className="absolute inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <ChangelogModal
              isOpen={true}
              onClose={() => {
                setShowChangelog(false);
                setViewingChangelogFromForce(false);
              }}
              entries={changelogData}
              t={t}
              downloadUrl={downloadUrl}
              currentVersion={APP_VERSION}
              latestVersion={serverVersion}
              onDownload={handleDownload}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Optional Update Modal */}
      <Modal
        isOpen={showOptionalUpdate}
        onClose={() => setShowOptionalUpdate(false)}
        title={t.UPDATES.AVAILABLE_TITLE}
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-pulse">
            <Sparkles size={40} className="text-white" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">{t.UPDATES.NEW_VERSION}{serverVersion}</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {isCapacitor
                ? t.UPDATES.AVAILABLE_DESC_APP
                : t.UPDATES.AVAILABLE_DESC_WEB}
            </p>
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black uppercase rounded-xl hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Download size={20} />
            {isCapacitor ? t.UPDATES.DOWNLOAD : t.UPDATES.RELOAD}
          </button>

          <button
            onClick={() => setShowChangelog(true)}
            className="w-full text-sm text-gray-400 hover:text-white underline underline-offset-4 transition-colors pt-2"
          >
            {t.UPDATES.WHATS_NEW}
          </button>
        </div>
      </Modal>

      {/* Changelog Modal */}
      <ChangelogModal
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
        entries={changelogData}
        t={t}
        downloadUrl={downloadUrl}
        currentVersion={APP_VERSION}
        latestVersion={serverVersion}
        onDownload={handleDownload}
      />
    </>
  );
};

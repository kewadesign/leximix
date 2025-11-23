import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get, onValue } from 'firebase/database';
import { Modal } from './UI';
import { AlertTriangle, ArrowLeft, Sparkles, Download } from 'lucide-react';
import { ChangelogModal, ChangelogEntry } from './ChangelogModal';

// Current App Version
export const APP_VERSION = '2.3.0';

interface Props {
  isOnline: boolean;
}

export const VersionManager: React.FC<Props> = ({ isOnline }) => {
  const [serverVersion, setServerVersion] = useState('');
  const [minVersion, setMinVersion] = useState('');
  
  const [showForceUpdate, setShowForceUpdate] = useState(false);
  const [showOptionalUpdate, setShowOptionalUpdate] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  
  const [changelogData, setChangelogData] = useState<ChangelogEntry[]>([]);

  const isCapacitor = (window as any).Capacitor !== undefined;

  // Fetch Version Info from Firebase & Changelog
  useEffect(() => {
    if (!isOnline) return;

    const db = getDatabase();
    const systemRef = ref(db, 'system');

    // Listen for version changes
    const unsubscribe = onValue(systemRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // data should look like: { min_version: "2.1.0", latest_version: "2.3.0", latest_apk_version: "2.3.0" }
        
        const latest = isCapacitor ? (data.latest_apk_version || data.latest_version) : data.latest_version;
        const minimum = data.min_version || '0.0.0';

        setServerVersion(latest);
        setMinVersion(minimum);

        checkVersion(latest, minimum);
      }
    });

    // Fetch Changelog
    fetch('/changelog.json')
      .then(res => res.json())
      .then(data => setChangelogData(data))
      .catch(err => console.error('Failed to load changelog', err));

    return () => unsubscribe();
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
       // Only show changelog if we are not showing update modals
       // But strictly, changelog is for when you HAVE updated.
       // So if current == latest (or just freshly opened new version), show it.
       // We don't want to show it if we need to update.
       if (compare(current, latest) >= 0) {
           setShowChangelog(true);
           localStorage.setItem('last_seen_version', current);
       }
    }
  };

  const handleDownload = () => {
    if (isCapacitor) {
        // Direct download link for APK
        window.open('https://leximix.web.app/app-release.apk', '_system');
    } else {
        window.location.reload();
    }
  };

  // Force Update Modal (Blocking)
  if (showForceUpdate) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
        <div className="glass-panel p-8 rounded-3xl max-w-md mx-4 text-center space-y-6 border-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.2)]">
          <div className="w-24 h-24 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500 animate-pulse-slow">
            <AlertTriangle size={48} className="text-orange-500" />
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wider">Update Erforderlich</h2>
            <p className="text-gray-300 leading-relaxed">
              Deine Version von LexiMix ist veraltet. Du musst aktualisieren, um weiterzuspielen.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="flex flex-col items-center">
              <span className="text-gray-500 uppercase text-[10px] tracking-widest">Installiert</span>
              <span className="font-mono text-red-400 text-lg">v{APP_VERSION}</span>
            </div>
            <ArrowLeft size={20} className="rotate-180 text-orange-500" />
            <div className="flex flex-col items-center">
              <span className="text-gray-500 uppercase text-[10px] tracking-widest">Benötigt</span>
              <span className="font-mono text-green-400 font-bold text-lg">v{minVersion}</span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black uppercase rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Jetzt Aktualisieren
          </button>
          
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">Sicherheits-Update</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Optional Update Modal */}
      <Modal 
        isOpen={showOptionalUpdate} 
        onClose={() => setShowOptionalUpdate(false)} 
        title="Update Verfügbar"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-pulse">
            <Sparkles size={40} className="text-white" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">Neue Version v{serverVersion}</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {isCapacitor
                ? 'Eine neue APK-Version ist verfügbar. Lade sie herunter für die neuesten Features!'
                : 'LexiMix wurde aktualisiert. Lade die App neu.'}
            </p>
          </div>

          <button
             onClick={handleDownload}
             className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black uppercase rounded-xl hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2"
          >
             <Download size={20} />
             {isCapacitor ? 'Herunterladen' : 'Neu laden'}
          </button>
        </div>
      </Modal>

      {/* Changelog Modal */}
      <ChangelogModal 
        isOpen={showChangelog} 
        onClose={() => setShowChangelog(false)} 
        entries={changelogData} 
      />
    </>
  );
};

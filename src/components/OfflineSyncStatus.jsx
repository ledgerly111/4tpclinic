import { useEffect, useState } from 'react';
import { AlertTriangle, CloudOff, RefreshCw, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../context/StoreContext';
import {
    OFFLINE_EVENT,
    describeQueued,
    discardQueued,
    getQueueSnapshot,
    retryFailed,
    syncNow,
} from '../lib/offlineSync';

// Floating badge: shows offline state and invoices/appointments waiting to sync.
export function OfflineSyncStatus() {
    const store = useStore();
    const isDark = (store?.theme || 'dark') !== 'light';
    const refreshDashboard = store?.refreshDashboard;
    const [snapshot, setSnapshot] = useState(() => getQueueSnapshot());
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const update = () => setSnapshot(getQueueSnapshot());
        const onSynced = () => {
            update();
            refreshDashboard?.();
        };
        window.addEventListener(OFFLINE_EVENT, update);
        window.addEventListener(`${OFFLINE_EVENT}:synced`, onSynced);
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        window.addEventListener('storage', update);
        return () => {
            window.removeEventListener(OFFLINE_EVENT, update);
            window.removeEventListener(`${OFFLINE_EVENT}:synced`, onSynced);
            window.removeEventListener('online', update);
            window.removeEventListener('offline', update);
            window.removeEventListener('storage', update);
        };
    }, [refreshDashboard]);

    const pendingCount = snapshot.pending.length;
    const failedCount = snapshot.failed.length;
    if (snapshot.online && pendingCount === 0 && failedCount === 0) return null;

    let label;
    if (failedCount > 0) label = `${failedCount} not saved – tap to review`;
    else if (snapshot.syncing) label = `Syncing ${pendingCount}…`;
    else if (pendingCount > 0) label = `${pendingCount} saved on this device – waiting to sync`;
    else label = 'Offline – changes will be saved on this device';

    const tone = failedCount > 0
        ? 'bg-red-600 text-white'
        : isDark ? 'bg-amber-500 text-black' : 'bg-amber-400 text-[#2b1a00]';

    return (
        <div className="fixed z-[60] right-3 bottom-24 lg:bottom-5 lg:right-5 max-w-[calc(100vw-24px)]">
            {open && (
                <div className={cn(
                    'mb-2 w-[340px] max-w-full rounded-2xl border p-4 shadow-2xl text-sm',
                    isDark ? 'bg-[#141414] border-white/10 text-gray-200' : 'bg-white border-gray-200 text-gray-800'
                )}>
                    <div className="flex items-center justify-between mb-2">
                        <strong>Saved on this device</strong>
                        <button onClick={() => setOpen(false)} aria-label="Close" className="opacity-70 hover:opacity-100">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs opacity-70 mb-3">
                        These are sent to the server automatically when the connection is back.
                        Don&apos;t clear browser data until they are synced.
                    </p>
                    {snapshot.lastSyncError && pendingCount > 0 && (
                        <p className="text-xs opacity-70 mb-3">Last attempt: {snapshot.lastSyncError}</p>
                    )}
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {snapshot.failed.map((item) => (
                            <li key={item.qid} className="rounded-xl border border-red-500/40 p-2">
                                <div className="font-medium">{describeQueued(item)}</div>
                                <div className="text-xs text-red-400 mt-0.5">{item.error}</div>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Discard this change? It will not be saved to the server.')) {
                                            discardQueued(item.qid);
                                        }
                                    }}
                                    className="mt-1 text-xs underline opacity-80"
                                >
                                    Discard
                                </button>
                            </li>
                        ))}
                        {snapshot.pending.map((item) => (
                            <li key={item.qid} className={cn('rounded-xl border p-2', isDark ? 'border-white/10' : 'border-gray-200')}>
                                <div className="font-medium">{describeQueued(item)}</div>
                                <div className="text-xs opacity-60">Waiting to sync</div>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => (failedCount > 0 ? retryFailed() : syncNow())}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold bg-[#e8919a] text-white"
                    >
                        <RefreshCw className={cn('w-3.5 h-3.5', snapshot.syncing && 'animate-spin')} />
                        Sync now
                    </button>
                </div>
            )}
            <button
                onClick={() => setOpen((value) => !value)}
                className={cn('ml-auto flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-lg', tone)}
            >
                {failedCount > 0 ? <AlertTriangle className="w-4 h-4" /> : snapshot.syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CloudOff className="w-4 h-4" />}
                {label}
            </button>
        </div>
    );
}

import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

interface PerformanceStats {
    fps: number;
    frameTime: number;
    isOptimal: boolean;
}

const usePerformanceMonitor = () => {
    const [stats, setStats] = useState<PerformanceStats>({
        fps: 60,
        frameTime: 16.67,
        isOptimal: true
    });

    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    const fpsHistory = useRef<number[]>([]);

    useFrame(() => {
        frameCount.current++;
        const now = performance.now();
        const frameTime = now - lastTime.current;

        if (frameCount.current % 60 === 0) { // Check every 60 frames
            const fps = 1000 / frameTime;

            // Keep FPS history for averaging
            fpsHistory.current.push(fps);
            if (fpsHistory.current.length > 10) {
                fpsHistory.current.shift();
            }

            const avgFPS = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;
            const isOptimal = avgFPS >= 30; // Consider 30+ FPS as optimal

            setStats({
                fps: Math.round(avgFPS),
                frameTime: Math.round(frameTime * 100) / 100,
                isOptimal
            });
        }

        lastTime.current = now;
    });

    return stats;
};

// Performance Warning Component
export const PerformanceWarning: React.FC<{ onFallback: () => void }> = ({ onFallback }) => {
    const stats = usePerformanceMonitor();
    const [showWarning, setShowWarning] = useState(false);
    const [warningCount, setWarningCount] = useState(0);

    useEffect(() => {
        if (!stats.isOptimal) {
            setWarningCount(prev => prev + 1);

            // Show warning after 3 consecutive low FPS readings
            if (warningCount >= 3) {
                setShowWarning(true);
            }
        } else {
            setWarningCount(0);
            setShowWarning(false);
        }
    }, [stats.isOptimal, warningCount]);

    if (!showWarning) return null;

    return (
        <div className="fixed top-4 right-4 z-50 bg-yellow-900/90 backdrop-blur-sm border border-yellow-500/50 rounded-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    ⚠️
                </div>
                <div className="flex-1">
                    <h4 className="text-yellow-200 font-semibold mb-1">Performance Notice</h4>
                    <p className="text-yellow-100 text-sm mb-3">
                        Your device is experiencing low frame rates ({stats.fps} FPS).
                        Would you like to switch to a lighter animation mode?
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={onFallback}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                        >
                            Use Light Mode
                        </button>
                        <button
                            onClick={() => setShowWarning(false)}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                        >
                            Keep Current
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Debug Performance Stats (for development)
export const PerformanceStats: React.FC = () => {
    const stats = usePerformanceMonitor();

    // Only show in development
    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm font-mono">
            <div>FPS: {stats.fps}</div>
            <div>Frame Time: {stats.frameTime}ms</div>
            <div className={stats.isOptimal ? 'text-green-400' : 'text-red-400'}>
                Status: {stats.isOptimal ? 'Optimal' : 'Poor'}
            </div>
        </div>
    );
};

export default usePerformanceMonitor; 
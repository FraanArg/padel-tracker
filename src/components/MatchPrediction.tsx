'use client';

import { TrendingUp, Zap, Trophy, Activity } from 'lucide-react';

interface PredictionResult {
    team1WinProbability: number;
    team2WinProbability: number;
    confidence: 'low' | 'medium' | 'high';
    factors: {
        h2h: { team1: number; team2: number; weight: number };
        ranking: { team1: number; team2: number; weight: number };
        form: { team1: number; team2: number; weight: number };
        clutch: { team1: number; team2: number; weight: number };
    };
    insight: string;
}

interface MatchPredictionProps {
    prediction: PredictionResult;
    team1Name: string;
    team2Name: string;
}

export default function MatchPrediction({ prediction, team1Name, team2Name }: MatchPredictionProps) {
    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
            case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400';
            default: return 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400';
        }
    };

    const team1Prob = prediction.team1WinProbability;
    const team2Prob = prediction.team2WinProbability;
    const favorite = team1Prob > team2Prob ? 'team1' : team1Prob < team2Prob ? 'team2' : 'even';

    return (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#1a1a1a] dark:to-[#202020] rounded-2xl p-6 border border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-white dark:bg-white/10 rounded-xl shadow-sm">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Match Prediction</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getConfidenceColor(prediction.confidence)}`}>
                            {prediction.confidence} confidence
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Probability Display */}
            <div className="relative mb-6">
                <div className="flex justify-between mb-2">
                    <div className={`text-2xl font-black ${favorite === 'team1' ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {team1Prob}%
                    </div>
                    <div className={`text-2xl font-black ${favorite === 'team2' ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                        {team2Prob}%
                    </div>
                </div>

                {/* Probability Bar */}
                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden flex">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                        style={{ width: `${team1Prob}%` }}
                    />
                    <div
                        className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                        style={{ width: `${team2Prob}%` }}
                    />
                </div>

                <div className="flex justify-between mt-2 text-sm font-medium">
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{team1Name}</span>
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{team2Name}</span>
                </div>
            </div>

            {/* Insight */}
            <div className="bg-white dark:bg-white/5 rounded-xl p-3 mb-4 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{prediction.insight}</span>
                </div>
            </div>

            {/* Factor Breakdown */}
            <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Factor Breakdown</div>

                {/* H2H */}
                <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500 w-16">H2H</span>
                    <div className="flex-grow h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-500" style={{ width: `${prediction.factors.h2h.team1 * 100}%` }} />
                        <div className="h-full bg-red-500" style={{ width: `${prediction.factors.h2h.team2 * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-8">{Math.round(prediction.factors.h2h.weight * 100)}%</span>
                </div>

                {/* Ranking */}
                <div className="flex items-center gap-3">
                    <Trophy className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500 w-16">Ranking</span>
                    <div className="flex-grow h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-500" style={{ width: `${prediction.factors.ranking.team1 * 100}%` }} />
                        <div className="h-full bg-red-500" style={{ width: `${prediction.factors.ranking.team2 * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-8">{Math.round(prediction.factors.ranking.weight * 100)}%</span>
                </div>

                {/* Form */}
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500 w-16">Form</span>
                    <div className="flex-grow h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-500" style={{ width: `${prediction.factors.form.team1 * 100}%` }} />
                        <div className="h-full bg-red-500" style={{ width: `${prediction.factors.form.team2 * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-8">{Math.round(prediction.factors.form.weight * 100)}%</span>
                </div>

                {/* Clutch */}
                <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500 w-16">Clutch</span>
                    <div className="flex-grow h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-500" style={{ width: `${prediction.factors.clutch.team1 * 100}%` }} />
                        <div className="h-full bg-red-500" style={{ width: `${prediction.factors.clutch.team2 * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-8">{Math.round(prediction.factors.clutch.weight * 100)}%</span>
                </div>
            </div>
        </div>
    );
}

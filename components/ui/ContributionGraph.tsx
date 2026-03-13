'use client';

import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { subDays, format } from 'date-fns';

interface ContributionData {
    date: string;
    count: number;
}

export default function ContributionGraph({ data }: { data: ContributionData[] }) {
    const today = new Date();
    const startDate = subDays(today, 365); // Show last year

    // Map data to heatmap format
    const heatmapValues = data.map(item => ({
        date: item.date,
        count: item.count
    }));

    return (
        <div className="w-full overflow-x-auto select-none contribution-graph-container">
            <div className="min-w-[700px]">
                <CalendarHeatmap
                    startDate={startDate}
                    endDate={today}
                    values={heatmapValues}
                    classForValue={(value: any) => {
                        if (!value) {
                            return 'color-empty';
                        }
                        return `color-github-${Math.min(value.count, 4)}`;
                    }}
                    tooltipDataAttrs={((value: any) => {
                        if (!value || !value.date) {
                            return {
                                'data-tooltip-id': 'heatmap-tooltip',
                                'data-tooltip-content': 'No contributions'
                            };
                        }
                        const formattedDate = format(new Date(value.date), 'MMM do, yyyy');
                        return {
                            'data-tooltip-id': 'heatmap-tooltip',
                            'data-tooltip-content': `${value.count} submission${value.count === 1 ? '' : 's'} on ${formattedDate}`
                        };
                    }) as any}
                    showWeekdayLabels={true}
                />
                <Tooltip id="heatmap-tooltip" className="!bg-slate-800 border !border-white/10 !text-xs !rounded-lg !px-3 !py-1.5" />
            </div>
        </div>
    );
}

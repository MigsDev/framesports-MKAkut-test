import { CirclePlay, Eye, Film, Trophy } from 'lucide-react';
import type { Dashboard } from '../types';

interface StatsCardsProps {
  dashboard: Dashboard | null;
}

function formatCount(value?: number): string {
  return value === undefined ? '—' : value.toLocaleString('en-US');
}

export default function StatsCards({ dashboard }: StatsCardsProps) {
  const topSport = dashboard
    ? Object.entries(dashboard.by_sport)
        .sort((first, second) => second[1] - first[1])[0]?.[0] ?? '—'
    : '—';

  const cards = [
    {
      label: 'Total clips',
      value: formatCount(dashboard?.total_clips),
      description: 'Across all sports',
      icon: Film,
      color: 'blue',
    },
    {
      label: 'Published clips',
      value: formatCount(dashboard?.published_clips),
      description: 'Live on platform',
      icon: CirclePlay,
      color: 'purple',
    },
    {
      label: 'Total views',
      value: formatCount(dashboard?.total_views),
      description: 'All-time engagement',
      icon: Eye,
      color: 'orange',
    },
    {
      label: 'Top sport',
      value: topSport,
      description: 'By number of clips',
      icon: Trophy,
      color: 'green',
    },
  ];

  return (
    <div className="stats">
      {cards.map(card => (
        <article className="stat-card" key={card.label}>
          <div className={`stat-icon ${card.color}`}>
            <card.icon size={20}/>
          </div>

          <p>{card.label}</p>
          <strong className={card.label === 'Top sport' ? 'sport-stat' : undefined}>
            {card.value}
          </strong>
          <small>{card.description}</small>
        </article>
      ))}
    </div>
  );
}

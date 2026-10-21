import { BarChart3, ChevronDown, Clapperboard, LayoutDashboard, CalendarDays } from 'lucide-react';

export type View = 'overview' | 'library' | 'analytics' | 'fixtures';

const navigation = [
  { view: 'overview', label: 'Overview', icon: LayoutDashboard, CalendarDays },
  { view: 'library', label: 'Clip library', icon: Clapperboard },
  { view: 'analytics', label: 'Analytics', icon: BarChart3 },
  { view: 'fixtures', label: 'Sports feeds', icon: CalendarDays },
] as const;

export default function Sidebar({ active, onNavigate }: { active: View; onNavigate: (view: View) => void }) {
  return <aside className="sidebar">
    <div className="logo"><span className="logo-mark"><span /><span /></span><div>FRAME<span>SPORTS</span><small>STUDIO</small></div></div>
    <nav className="sidebar-group" aria-label="Workspace navigation">
      <p className="nav-label">WORKSPACE</p>
      {navigation.map(item => <a
        key={item.view}
        href={`#${item.view}`}
        className={`nav-item ${active === item.view ? 'active' : ''}`}
        aria-current={active === item.view ? 'page' : undefined}
        onClick={(event) => { event.preventDefault(); onNavigate(item.view); }}
      ><item.icon size={18}/>{item.label}</a>)}
    </nav>
    <div className="sidebar-bottom"><div className="avatar">MK</div><div><strong>MKAkut</strong><small>Sports workspace</small></div><ChevronDown size={16}/></div>
  </aside>;
}

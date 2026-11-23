import { BarChart3, CalendarDays, Clapperboard, Sparkles, Trophy, Flame, HelpCircle, Palette } from 'lucide-react';
const groups=[
 {label:'Your viewing journal',items:[['stats','Statistics',BarChart3],['calendar','Watch diary',CalendarDays],['wrapped','Year in film',Clapperboard],['constellation','Stars map',Sparkles]]},
 {label:'Make cinema a habit',items:[['achievements','Achievements',Trophy],['challenges','Challenges',Flame],['trivia','Film trivia',HelpCircle],['shop','Profile extras',Palette]]}
];
export default function ToolWorkspaceNavigation({screen,onNavigate}) {
 const group=groups.find(g=>g.items.some(([id])=>id===screen));
 if(!group || ['stats','calendar','wrapped','constellation'].includes(screen))return null;
 return <><nav className="screening-tool-navigation" aria-label={group.label}><span>{group.label}</span><div>{group.items.map(([id,label,Icon])=><button key={id} aria-current={id===screen?'page':undefined} onClick={()=>onNavigate(id)}><Icon size={16}/>{label}</button>)}</div></nav>{['achievements','challenges','trivia','shop'].includes(screen)&&<details className="workspace-rewards-help"><summary>How points and unlocks work</summary><p>CinePoints unlock profile cosmetics. Watched titles earn 10, written reviews earn 10 and favorites earn 5; streaks and trivia can add bonuses. Challenge XP tracks your level separately. Earned badges and borders remain in your profile. Challenge claim history is currently stored per account on this device.</p></details>}</>;
}

import { Status, Situation, Priority, STATUS_BG, SITUATION_BG } from '../types';

type Props =
  | { type: 'status';    value: Status    }
  | { type: 'situation'; value: Situation }
  | { type: 'priority';  value: Priority  }
  | { type: 'custom';    value: string; className: string };

const PRIORITY_BG: Record<Priority, string> = {
  '高': 'bg-rose-100 text-rose-700',
  '中': 'bg-blue-100 text-blue-700',
  '低': 'bg-slate-100 text-slate-600',
};

export default function StatusPill(props: Props) {
  let cls = '';
  if (props.type === 'status')    cls = STATUS_BG[props.value];
  if (props.type === 'situation') cls = SITUATION_BG[props.value];
  if (props.type === 'priority')  cls = PRIORITY_BG[props.value];
  if (props.type === 'custom')    cls = props.className;

  return (
    <span className={`status-pill ${cls}`}>{props.value}</span>
  );
}

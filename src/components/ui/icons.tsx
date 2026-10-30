import type { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 18, children, style, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
    style={{ width: size, height: size, ...style }} {...props}>{children}</svg>
}

export function Grid(props: IconProps) { return <Icon {...props}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Icon> }
export function Calendar(props: IconProps) { return <Icon {...props}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 11h18m-13 4h1m6 0h1m-8 3h1" /></Icon> }
export function Users(props: IconProps) { return <Icon {...props}><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m2 10v-3a6 6 0 0 0-2-4" /></Icon> }
export function Bat(props: IconProps) { return <Icon {...props}><path d="m15 3 3 3-5 5 1 1-7 9-4-4 9-7 1 1 5-5m-9 6 3 3" /></Icon> }
export function Ball(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M7 4c7 3 7 13 10 16M5 6l2 1m0 3 2 1m0 3 2 1m1 3 2 1" /></Icon> }
export function Trophy(props: IconProps) { return <Icon {...props}><path d="M7 3h10v6a5 5 0 0 1-10 0V3Zm0 2H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 2v5m-5 2h10m-8-2h6" /></Icon> }
export function Upload(props: IconProps) { return <Icon {...props}><path d="M12 16V3m-5 5 5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" /></Icon> }
export function Edit(props: IconProps) { return <Icon {...props}><path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14l-1 7m10 0H4" /></Icon> }
export function List(props: IconProps) { return <Icon {...props}><path d="M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01" /></Icon> }
export function UserCog(props: IconProps) { return <Icon {...props}><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 9-5m5 2v-2m0 10v-2m-4-4-2-1m10 5-2-1m0-3 2-1m-10 5 2-1" /><circle cx="17" cy="18" r="3" /></Icon> }
export function Logout(props: IconProps) { return <Icon {...props}><path d="M9 4H4v16h5m4-13 5 5-5 5m-5-5h12" /></Icon> }
export function Menu(props: IconProps) { return <Icon {...props}><path d="M3 6h18M3 12h18M3 18h18" /></Icon> }
export function Close(props: IconProps) { return <Icon {...props}><path d="m6 6 12 12M6 18 18 6" /></Icon> }
export function ChevronDown(props: IconProps) { return <Icon {...props}><path d="m6 9 6 6 6-6" /></Icon> }
export function ChevronRight(props: IconProps) { return <Icon {...props}><path d="m9 6 6 6-6 6" /></Icon> }
export function ArrowLeft(props: IconProps) { return <Icon {...props}><path d="m10 5-7 7 7 7M3 12h18" /></Icon> }
export function Check(props: IconProps) { return <Icon {...props}><path d="m4 12 5 5L20 6" /></Icon> }
export function Lock(props: IconProps) { return <Icon {...props}><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></Icon> }
export function Shield(props: IconProps) { return <Icon {...props}><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></Icon> }
export function Info(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10h.01" /></Icon> }
export function Alert(props: IconProps) { return <Icon {...props}><path d="M10.3 4a2 2 0 0 1 3.4 0l8 14a2 2 0 0 1-1.7 3H4a2 2 0 0 1-1.7-3l8-14ZM12 9v4m0 4h.01" /></Icon> }
export function Search(props: IconProps) { return <Icon {...props}><circle cx="10.5" cy="10.5" r="7.5" /><path d="m16 16 5 5" /></Icon> }
export function Sort(props: IconProps) { return <Icon {...props}><path d="M8 3v18m-4-4 4 4 4-4m4-14v18m-4-14 4-4 4 4" /></Icon> }
export function Filter(props: IconProps) { return <Icon {...props}><path d="M3 4h18l-7 8v7l-4 2v-9L3 4Z" /></Icon> }
export function Star(props: IconProps) { return <Icon {...props}><path d="m12 3 3 6 6.5 1-4.8 4.7 1.1 6.5L12 18l-5.8 3.2 1.1-6.5L2.5 10 9 9l3-6Z" /></Icon> }
export function Flag(props: IconProps) { return <Icon {...props}><path d="M5 21V3m0 1c5-4 9 4 14 0v10c-5 4-9-4-14 0" /></Icon> }
export function Home(props: IconProps) { return <Icon {...props}><path d="m3 10 9-7 9 7v11h-6v-7H9v7H3V10Z" /></Icon> }
export function Chart(props: IconProps) { return <Icon {...props}><path d="M3 3v18h18M7 17v-5m5 5V7m5 10V4" /></Icon> }
export function Trash(props: IconProps) { return <Icon {...props}><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" /></Icon> }
export function Eye(props: IconProps) { return <Icon {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Icon> }
export const X = Close
export const icons = { Grid, Calendar, Users, Bat, Ball, Trophy, Upload, Edit, List, UserCog, Logout, Menu, Close,
  ChevronDown, ChevronRight, ArrowLeft, Check, Lock, Shield, Info, Alert, Search, Sort, Filter, Star, Flag, Home, Chart, Trash, Eye, X }

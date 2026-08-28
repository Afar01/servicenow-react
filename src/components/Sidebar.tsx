
import { NavLink } from "react-router-dom";
import { Home, Bell, List, Settings } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: Home,     label: "Home"     },
  { to: "/incidents", icon: Bell,     label: "Incident" },
  { to: "/requests",  icon: List,     label: "Request"  },
  { to: "/admin",     icon: Settings, label: "Admin"    },
];

export default function Sidebar() {
  return (
    <aside style={{width:"80px", minWidth:"80px", backgroundColor:"#1A283D", display:"flex", flexDirection:"column", alignItems:"center", paddingTop:"16px", gap:"4px"}}>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            display:"flex", flexDirection:"column", alignItems:"center",
            gap:"4px", padding:"10px 8px", width:"100%", textAlign:"center",
            borderRadius:"8px", cursor:"pointer", textDecoration:"none",
            color: isActive ? "#ffffff" : "#9CA3AF",
            backgroundColor: isActive ? "#0078D4" : "transparent",
          })}
        >
          <Icon size={22} />
          <span style={{fontSize:"11px", fontWeight:"500"}}>{label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
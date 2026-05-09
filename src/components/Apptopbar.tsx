import { Search, Bell } from "lucide-react"

interface AppTopbarProps {
  userName: string;
  userEmail?: string;
}

export function AppTopbar({ userName, userEmail }: AppTopbarProps) {
  return (
    <div className="w-full h-16 border-b flex items-center justify-between px-4 md:px-8 shrink-0 bg-white" style={{borderColor: "var(--dashboard-border)", borderBottomWidth: "1px"}}>
      {/* Left */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold" style={{color: "var(--dashboard-primary)"}}>SupplAI</h1>
      </div>

      {/* Middle - Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4" style={{color: "var(--dashboard-border)"}} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
            style={{backgroundColor: "#ffffff", borderColor: "var(--dashboard-border)", borderWidth: "1px"}}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-6">
        <button className="relative hover:opacity-80">
          <Bell className="h-5 w-5" style={{color: "var(--dashboard-text-muted)"}} />
          <span className="absolute top-0 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-sm leading-none" style={{color: "var(--dashboard-primary)"}}>{userName}</p>
            {userEmail && <p className="text-xs mt-1" style={{color: "var(--dashboard-text-muted)"}}>{userEmail}</p>}
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white overflow-hidden shrink-0" style={{backgroundColor: "var(--dashboard-border)"}}>
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </button>
        </div>
      </div>
    </div>
  )
}

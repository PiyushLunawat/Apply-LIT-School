import { FC, ReactNode } from 'react'
import Header from '~/components/organisms/Header/Header'
import Sidebar from '~/components/organisms/Sidebar/Sidebar'
import { Toaster } from '~/components/ui/toaster'

interface DashboardLayoutProps {
  children: ReactNode
}

export const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
  <>
    <Header subtitle="" classn="drop-shadow-lg" />
    <div className="flex">
        <Sidebar />
        <main className="overflow-y-auto" style={{ height: `calc(100vh - 52px)`}}>
            {children}
            <Toaster />
        </main>
    </div>
  </>
  )
}

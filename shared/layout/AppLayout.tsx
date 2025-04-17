import React, { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isMobileOverride?: boolean;
}

export default function AppLayout({
  children,
  sidebar,
  header,
  footer,
  isMobileOverride,
}: AppLayoutProps) {
  const [mobileView, setMobileView] = useState(false);

  useEffect(() => {
    // 如果提供了明确的移动端覆盖，则使用它
    if (typeof isMobileOverride !== 'undefined') {
      setMobileView(isMobileOverride);
      return;
    }
    
    // 否则根据屏幕宽度和设备类型自动判断
    const handleResize = () => {
      setMobileView(window.innerWidth < 1024 || isMobile);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileOverride]);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* 移动端顶部导航 */}
      {mobileView && header && (
        <header className="fixed top-0 left-0 right-0 z-10 h-16 bg-white shadow-sm">
          {header}
        </header>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* 桌面端侧边栏 */}
        {!mobileView && sidebar && (
          <aside className="hidden lg:block w-64 h-screen overflow-y-auto border-r border-slate-200 bg-white">
            {sidebar}
          </aside>
        )}
        
        {/* 主内容区域 */}
        <main className={`flex-1 overflow-y-auto ${mobileView ? 'pt-16 pb-16' : ''}`}>
          <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* 移动端底部导航 */}
      {mobileView && footer && (
        <footer className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-slate-200">
          {footer}
        </footer>
      )}
    </div>
  );
} 
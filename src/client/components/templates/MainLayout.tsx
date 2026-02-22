import React from "react";

interface MainLayoutProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function MainLayout({ header, sidebar, children, footer }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {header}
      <main className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-88px)]">
        {sidebar}
        <div className="lg:col-span-9 p-8 overflow-y-auto">{children}</div>
      </main>
      {footer}
    </div>
  );
}

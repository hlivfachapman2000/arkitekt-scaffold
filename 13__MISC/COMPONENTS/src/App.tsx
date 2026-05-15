import { useState, Suspense } from 'react';
import { ThemeProvider } from 'next-themes';
import { GlobeDemo } from './components/GlobeDemo';
import TextFlippingBoardDemo from './components/TextFlippingBoardDemo';
import { FileDropzone } from './components/FileDropzone';
import { FlippingDisplay } from './components/FlippingDisplay';
import { Globe, Box, FileText, LayoutDashboard } from 'lucide-react';

const TABS = [
  { id: 'welcome', label: 'Welcome', icon: LayoutDashboard },
  { id: 'globe', label: 'Globe', icon: Globe },
  { id: 'board', label: 'Flip Board', icon: Box },
  { id: 'dropzone', label: 'Dropzone', icon: FileText },
] as const;

function WelcomeTab() {
  return (
    <div className='h-full flex flex-col items-center justify-center gap-8 p-12 text-center'>
      <div className='space-y-4'>
        <h1 className='text-5xl md:text-7xl font-black text-white tracking-tighter'>
          VampDev<span className='text-lime-400'>.</span>
        </h1>
        <p className='text-zinc-400 text-lg max-w-md'>
          Reactive UI components built with React, Tailwind, and Framer Motion.
        </p>
      </div>
      <div className='flex gap-3 flex-wrap justify-center'>
        {TABS.map(tab => (
          <span key={tab.id} className='px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm font-mono'>
            {tab.label}
          </span>
        ))}
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-4'>
        <div className='p-6 rounded-2xl bg-[#0c0c0c] border border-white/5'>
          <Globe className='w-8 h-8 text-lime-400 mb-3' />
          <h3 className='text-white font-bold mb-1'>3D Globe</h3>
          <p className='text-zinc-500 text-sm'>Interactive world map with arc connections</p>
        </div>
        <div className='p-6 rounded-2xl bg-[#0c0c0c] border border-white/5'>
          <Box className='w-8 h-8 text-blue-400 mb-3' />
          <h3 className='text-white font-bold mb-1'>Flip Board</h3>
          <p className='text-zinc-500 text-sm'>Split-flap display with 3D animations</p>
        </div>
        <div className='p-6 rounded-2xl bg-[#0c0c0c] border border-white/5'>
          <FileText className='w-8 h-8 text-purple-400 mb-3' />
          <h3 className='text-white font-bold mb-1'>Dropzone</h3>
          <p className='text-zinc-500 text-sm'>Drag-and-drop file ingestion engine</p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className='h-full flex items-center justify-center'>
      <div className='w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin' />
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('welcome');

  return (
    <ThemeProvider attribute='class' defaultTheme='dark'>
      <div className='min-h-screen bg-black text-white'>
        {/* Header */}
        <header className='fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-xl border-b border-white/5'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-lg bg-lime-500 flex items-center justify-center'>
              <span className='text-black font-black text-sm'>V</span>
            </div>
            <span className='font-black text-lg tracking-tight'>VampDev</span>
          </div>
          <nav className='flex items-center gap-1'>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </header>

        {/* Main Content */}
        <main className='pt-20 h-screen'>
          <Suspense fallback={<LoadingFallback />}>
            {activeTab === 'welcome' && <WelcomeTab />}
            {activeTab === 'globe' && (
              <div className='h-[calc(100vh-5rem)]'>
                <GlobeDemo />
              </div>
            )}
            {activeTab === 'board' && (
              <div className='h-[calc(100vh-5rem)] flex flex-col items-center justify-center gap-8 p-8'>
                <TextFlippingBoardDemo />
                <FlippingDisplay text='COMPONENT_SHOWCASE_READY' />
              </div>
            )}
            {activeTab === 'dropzone' && (
              <div className='h-[calc(100vh-5rem)]'>
                <FileDropzone />
              </div>
            )}
          </Suspense>
        </main>
      </div>
    </ThemeProvider>
  );
}
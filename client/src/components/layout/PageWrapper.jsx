import TopNavBar from './TopNavBar';
import BottomNavBar from './BottomNavBar';

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-background spotlight-bg flex flex-col">
      <TopNavBar />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}

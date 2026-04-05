import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <span className="material-icon text-6xl text-on-surface-variant mb-4">search_off</span>
      <h1 className="font-headline font-extrabold text-4xl text-on-surface mb-2">404</h1>
      <p className="text-on-surface-variant mb-8">This page doesn't exist.</p>
      <Link to="/" className="px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:shadow-glow-primary transition-all duration-200">
        Go Home
      </Link>
    </div>
  );
}

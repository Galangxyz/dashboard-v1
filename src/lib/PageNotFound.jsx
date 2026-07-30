import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neo-gray p-6">
      <div className="neo-card max-w-md p-8 text-center">
        <h1 className="text-7xl font-black mb-2">404</h1>
        <div className="h-1 w-16 bg-black dark:bg-white mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-sm text-muted-foreground mb-8">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="neo-btn neo-btn-yellow">
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
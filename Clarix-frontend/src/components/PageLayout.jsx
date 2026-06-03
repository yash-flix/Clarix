import Navbar from "./Navbar";

export default function PageLayout({ children, className = "", footer = null }) {
  return (
    <div className="min-h-dvh flex flex-col bg-base-200">
      <Navbar />
      <main className={`flex-1 w-full max-w-[1200px] mx-auto px-5 sm:px-8 ${className}`}>
        {children}
      </main>
      {footer}
    </div>
  );
}

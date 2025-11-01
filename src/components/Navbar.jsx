// Navbar.tsx
import React from 'react';
import '../index.css';
import SliderAnimation from './ui/LoginAnimation';
const Navbar = () => {
  return (
<>
<nav className="bg-[var(--background)] text-[var(--foreground)] flex  shadow-xl shadow-var[(--secondary)] items-center justify-center px-4 h-auto">
      {/* Logo / Title */}
      <h2 className="text-xl font-light tracking-tight text-[var(--primary)] bg-clip-text mb-4 mt-4">PassWorld</h2>

      {/* Navigation links */}
     
    </nav>
              <div className="flex w-full justify-center bg-[var(--border)] h-[0.4px]"></div>
                </>
  );
};

export default Navbar;
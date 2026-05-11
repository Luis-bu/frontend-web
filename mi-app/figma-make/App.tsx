export default function App() {
  return (
    <div className="size-full flex bg-[#0a0a0a]">
      {/* Left Side - Login Form */}
      <div className="w-1/2 flex items-center justify-center bg-[#0a0a0a] px-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-24 left-16 opacity-30">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="4" cy="4" r="2" fill="#FFD700" />
            <circle cx="16" cy="4" r="2" fill="#FFD700" />
            <circle cx="28" cy="4" r="2" fill="#FFD700" />
            <circle cx="40" cy="4" r="2" fill="#FFD700" />
            <circle cx="4" cy="16" r="2" fill="#FFD700" />
            <circle cx="16" cy="16" r="2" fill="#FFD700" />
            <circle cx="28" cy="16" r="2" fill="#FFD700" />
            <circle cx="40" cy="16" r="2" fill="#FFD700" />
            <circle cx="4" cy="28" r="2" fill="#FFD700" />
            <circle cx="16" cy="28" r="2" fill="#FFD700" />
            <circle cx="28" cy="28" r="2" fill="#FFD700" />
            <circle cx="40" cy="28" r="2" fill="#FFD700" />
          </svg>
        </div>

        {/* Diagonal lines */}
        <svg className="absolute top-0 right-0 w-64 h-64 opacity-20" viewBox="0 0 200 200">
          <line x1="20" y1="0" x2="80" y2="200" stroke="#FFD700" strokeWidth="2" />
          <line x1="60" y1="0" x2="120" y2="200" stroke="#FFD700" strokeWidth="1" />
          <line x1="100" y1="0" x2="160" y2="200" stroke="#FFD700" strokeWidth="2" />
        </svg>

        <div className="w-full max-w-[420px] relative z-10">
          {/* Headline */}
          <div className="mb-12">
            <h1 className="text-[42px] font-medium leading-[1.1] tracking-tight text-white mb-4">
              <span className="text-[#FFD700]">Gestiona procesos</span><br />con claridad
            </h1>
            <p className="text-[15px] leading-relaxed text-[#a0a0a0] font-light">
              Organiza estudiantes, procesos y seguimiento académico desde un solo lugar
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-white mb-3 tracking-wide uppercase">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="w-full h-[52px] px-5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-[8px] text-[15px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#FFD700] transition-colors"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-white mb-3 tracking-wide uppercase">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••••"
                className="w-full h-[52px] px-5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-[8px] text-[15px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#FFD700] transition-colors"
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="w-[18px] h-[18px] border border-[rgba(255,255,255,0.2)] rounded-[3px] group-hover:border-[#FFD700] transition-colors" />
                <span className="text-[13px] font-medium text-[#a0a0a0]">Recordarme</span>
              </label>
              <button className="text-[13px] font-medium text-[#a0a0a0] hover:text-[#FFD700] transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Sign In Button */}
            <button className="w-full h-[52px] bg-[#FFD700] hover:bg-[#FFC700] text-black text-[15px] font-semibold rounded-[8px] transition-all duration-200 mt-8 shadow-[0_4px_20px_rgba(255,215,0,0.3)]">
              Iniciar sesión
            </button>

            {/* Divider */}
            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgba(255,255,255,0.08)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#0a0a0a] px-4 text-[13px] text-[#666] uppercase tracking-wide">O continúa con</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button className="w-full h-[52px] bg-transparent border border-[rgba(255,255,255,0.15)] hover:border-[#FFD700] text-white text-[15px] font-medium rounded-[8px] transition-all duration-200 flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Abstract Geometric Design */}
      <div className="w-1/2 bg-[#0a0a0a] relative overflow-hidden border-l border-[rgba(255,215,0,0.1)]">
        {/* Geometric shapes */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Large circle outline */}
          <div className="absolute w-[500px] h-[500px] border-2 border-[rgba(255,215,0,0.2)] rounded-full" />

          {/* Medium circle */}
          <div className="absolute w-[300px] h-[300px] border border-[rgba(255,215,0,0.15)] rounded-full top-1/3 left-1/4" />

          {/* 3D Cube wireframe */}
          <svg className="absolute" width="200" height="200" viewBox="0 0 200 200">
            <g stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.3">
              {/* Front face */}
              <polygon points="50,80 150,80 150,180 50,180" />
              {/* Back face */}
              <polygon points="80,50 180,50 180,150 80,150" />
              {/* Connecting lines */}
              <line x1="50" y1="80" x2="80" y2="50" />
              <line x1="150" y1="80" x2="180" y2="50" />
              <line x1="150" y1="180" x2="180" y2="150" />
              <line x1="50" y1="180" x2="80" y2="150" />
            </g>
          </svg>

          {/* Small accent circles */}
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-[#FFD700] rounded-full" />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-[#FFD700] rounded-full" />
          <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-[#FFD700] rounded-full opacity-50" />
        </div>

        {/* Dot pattern - top right */}
        <div className="absolute top-16 right-16 opacity-40">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="5" cy="5" r="2" fill="#FFD700" />
            <circle cx="20" cy="5" r="2" fill="#FFD700" />
            <circle cx="35" cy="5" r="2" fill="#FFD700" />
            <circle cx="50" cy="5" r="2" fill="#FFD700" />
            <circle cx="5" cy="20" r="2" fill="#FFD700" />
            <circle cx="20" cy="20" r="2" fill="#FFD700" />
            <circle cx="35" cy="20" r="2" fill="#FFD700" />
            <circle cx="50" cy="20" r="2" fill="#FFD700" />
            <circle cx="5" cy="35" r="2" fill="#FFD700" />
            <circle cx="20" cy="35" r="2" fill="#FFD700" />
            <circle cx="35" cy="35" r="2" fill="#FFD700" />
            <circle cx="50" cy="35" r="2" fill="#FFD700" />
          </svg>
        </div>

        {/* Diagonal accent lines */}
        <svg className="absolute bottom-0 left-0 w-full h-full opacity-20" viewBox="0 0 500 500">
          <line x1="0" y1="400" x2="200" y2="500" stroke="#FFD700" strokeWidth="2" />
          <line x1="50" y1="400" x2="250" y2="500" stroke="#FFD700" strokeWidth="1" />
          <line x1="100" y1="400" x2="300" y2="500" stroke="#FFD700" strokeWidth="2" />
        </svg>

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[rgba(255,215,0,0.03)]" />
      </div>
    </div>
  );
}

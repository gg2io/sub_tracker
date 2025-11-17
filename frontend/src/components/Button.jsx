export function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button'
}) {
  const baseStyles = 'px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg';

  const variants = {
    primary: 'gradient-primary text-white hover:shadow-xl hover:shadow-blue-500/50 focus:ring-blue-300',
    secondary: 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 hover:shadow-xl focus:ring-slate-200 dark:focus:ring-slate-600',
    danger: 'gradient-danger text-white hover:shadow-xl hover:shadow-rose-500/50 focus:ring-rose-300',
    success: 'gradient-success text-white hover:shadow-xl hover:shadow-emerald-500/50 focus:ring-emerald-300',
    outline: 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-xl focus:ring-blue-200 dark:focus:ring-blue-800',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

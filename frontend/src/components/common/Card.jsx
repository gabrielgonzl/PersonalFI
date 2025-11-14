export const Card = ({
  children,
  title,
  subtitle,
  action,
  padding = true,
  hover = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-card
        ${hover ? 'hover:shadow-card-hover transition-shadow duration-200' : ''}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={`${padding ? 'px-6 py-4' : 'p-0'} border-b border-gray-200`}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <div className={padding ? 'p-6' : 'p-0'}>
        {children}
      </div>
    </div>
  );
};

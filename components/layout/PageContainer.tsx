interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`max-w-1200 mx-auto px-6 py-8 ${className}`}>
      {children}
    </div>
  )
}
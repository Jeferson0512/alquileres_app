export default function Card({ children, className = '' }) {
    return (
        <div className={`rounded-[13px] border border-border bg-surface shadow-sm ${className}`}>
            {children}
        </div>
    );
}

Card.Header = function CardHeader({ title, hint, actions }) {
    return (
        <div className="flex items-center justify-between border-b border-border px-[18px] py-[15px]">
            <h3 className="text-sm font-bold text-ink">{title}</h3>
            {hint && <span className="text-xs text-muted-2">{hint}</span>}
            {actions}
        </div>
    );
};

Card.Body = function CardBody({ children, className = '' }) {
    return <div className={`p-[18px] ${className}`}>{children}</div>;
};

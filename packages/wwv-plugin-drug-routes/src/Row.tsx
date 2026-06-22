/**
 * @file Row.tsx
 * @description Shared label/value row used across the detail and profile panels.
 */

export function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="wwv-drug-row">
            <span className="wwv-drug-row-label">{label}</span>
            <span className="wwv-drug-row-value">{value}</span>
        </div>
    );
}

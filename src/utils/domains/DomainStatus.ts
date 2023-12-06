export const DomainStatus = {
    AVAILABLE: 'Available',
    REGISTERED: 'Registered',
    LIMIT: 'Limit exceeded',
    TIMEOUT: 'Timeout',
    TDL_NOT_SUPPORTED: 'Tdl not supported',
    UNKNOWN: 'Unknown',
} as const;

/**
 * TODO: [📙] Every dictionary should look like LikedStatus
 *     - Split between const and type
 *     - keyof typeof DomainStatus should become just type DomainStatus
 */

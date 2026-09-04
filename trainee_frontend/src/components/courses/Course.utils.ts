
export function getTimeAgo( createdAt: string) {
    const minutes = Math.max(
        0,
        Math.floor(
            (Date.now() - new Date( createdAt ).getTime()) /
            60_000
        )
    );

    if ( minutes < 60 ) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor( minutes / 60 );

    if( hours < 24 ) {
        return `${hours}h ago`;
    }

    const days = Math.floor( hours / 24 );
    
    if( days < 30 ) {
        return `${days}d ago`;
    }

    return `${Math.floor( days / 30 )}mo ago`;  
}

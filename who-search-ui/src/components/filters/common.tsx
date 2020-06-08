export function arrayMatches(a: any[], b: any[]) {
    if (a.length !== b.length) {
        return false
    }
    for (let i = 0; i < a.length; i++) {
        if (!b.some(v => v === a[i])) {
            return false
        }
    }
    return true
}
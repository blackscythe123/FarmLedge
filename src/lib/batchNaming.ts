
export interface Batch {
    id: number;
    parentId?: number;
    isSplit?: boolean;
    [key: string]: any;
}

/**
 * Generates a visual ID for a batch based on its lineage.
 * Root batches: "1", "2", etc.
 * Split batches: "1a", "1b" (children of 1), "1a$a" (child of 1a)
 * 
 * @param batch The batch to generate an ID for
 * @param allBatches List of all batches to determine siblings
 * @returns string Visual ID
 */
export function generateVisualId(batch: Batch, allBatches: Batch[]): string {
    if (!batch.parentId || batch.parentId === 0) {
        return batch.id.toString();
    }

    // Find parent
    const parent = allBatches.find(b => b.id === batch.parentId);
    if (!parent) return batch.id.toString(); // Fallback if parent not found

    const parentVisualId = generateVisualId(parent, allBatches);

    // Find all siblings (same parent), sorted by ID
    const siblings = allBatches
        .filter(b => b.parentId === batch.parentId)
        .sort((a, b) => a.id - b.id);

    const index = siblings.findIndex(b => b.id === batch.id);

    // Generate suffix: a, b, c... then aa, ab... (simplified to just a-z for now)
    // If index > 25, we might need more complex logic, but for MVP a-z is fine.
    const suffix = String.fromCharCode(97 + (index % 26));
    // If we have more than 26 siblings, we could append numbers or loop, 
    // but let's assume reasonable splitting for now.

    // If parent is already a split (contains letters), we might want a separator like '$' or just append
    // "1" -> "1a"
    // "1a" -> "1aa" (ambiguous? 1a -> 1aa vs 1 -> 1aa?)
    // Let's use a separator if the parent ID ends in a letter to avoid ambiguity, 
    // or just append. 
    // User request example: "1a$a" implies a separator for nested splits.

    // Check if parent visual ID ends with a letter
    const parentEndsWithLetter = /[a-z]$/i.test(parentVisualId);
    const separator = parentEndsWithLetter ? "$" : "";

    return `${parentVisualId}${separator}${suffix}`;
}

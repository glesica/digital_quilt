/**
 * Configuration for a quilt. The JSON produced by the build script complies
 * with this interface.
 */
export interface Metadata {
    row_count: number,
    col_count: number,
    paths: Array<String>,
    weights: Array<number>,
    focusable: Array<boolean>,
}

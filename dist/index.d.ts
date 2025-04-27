/**
 * vite-plugin-uglifier
 * A Vite plugin for replacing CSS classes and IDs in Vue components with shorter names.
 * This plugin is useful for optimizing the size of Vue components by reducing the length of class and ID names.
 * It also mask the original class and ID names to make reverse engineering more difficult and protect the privacy of the code.
 *
 * Optional options for the plugin.
 * @param enableLogging - Enable logging for the plugin. Default is false.
 * @param include - Array of file paths to include in the optimization. Default is all files.
 * @param exclude - Array of file paths to exclude from the optimization. Default is none.
 * @param renameId - Whether to rename IDs in the CSS. Default is false.
 */
export interface UglifyOptions {
    enableLogging?: boolean;
    include?: string[];
    exclude?: string[];
    renameId?: boolean;
}

export type Options = UglifyOptions;

declare const vitePluginUglifier: (opts?: Options) => Plugin;
export default vitePluginUglifier;

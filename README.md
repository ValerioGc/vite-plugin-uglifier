# vite-plugin-uglifier beta
> A Vite plugin to shrink and obfuscate CSS classes & IDs in Vue components

<br/>

<p align="center">
  <img src="https://img.shields.io/npm/l/vite-plugin-uglifier?color=green&label=npm%20license&style=flat-square" alt="npm license" />
  <img src="https://img.shields.io/npm/v/vite-plugin-uglifier?color=red&label=npm%20version&style=flat-square" alt="npm version" />
</p>

A Vite plugin for **minifying** and **obfuscating** CSS class and ID names in Vue components, reducing bundle size and making reverse-engineering harder. Ideal for projects with lengthy or numerous class and ID names, it shortens them and masks the originals to optimize component size and protect code privacy.

<br/>

## Installation

```bash
npm install vite-plugin-uglifier --save-dev
```


## Usage
The plugin can be used in the `vite.config.js` file as follows:

```javascript
plugins: [
    vitePluginUglifier({
        enableLogging: true, 
        renameId: true, 
        include: ['*'],
        exclude: [] 
    });
]
```

## Options
- `enableLogging`: (boolean) Set to `true` to enable console logging. Default is `false`.
- `renameId`: (boolean) Set to `true` to enable renaming of IDs. Default is `false`.
- `include`: (array) Specify the files to include for renaming. Default is `['*']` (all files).
- `exclude`: (array) Specify the files to exclude from renaming. Default is `[]` (none).


## Classes and ID Coverage

The plugin covers the following classes and IDs in Vue components:
- `class` attributes in HTML elements
- `class` attributes in Vue components
- `id` attributes in HTML elements
- `id` attributes in Vue components
- `class` and `id` attributes in `<style>` blocks
- `class` and `id` attributes in `<style scoped>` blocks
- `class` and `id` attributes in `<style module>` blocks
- `class` and `id` attributes in `<style lang="scss">` blocks
- `class` and `id` attributes in `<style lang="sass">` blocks
- `class` and `id` attributes in `<style lang="less">` blocks
- `class` and `id` attributes in `<style lang="stylus">` blocks
- `class` and `id` attributes in `<style lang="postcss">` blocks
- `class` and `id` attributes in `<style lang="css">` blocks
  - Note: The plugin does not cover `class` and `id` attributes in `<style>` blocks that are not scoped or module-based.

## License

This project is licensed under the 0BSD License. See the [LICENSE](LICENSE) file for details.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.


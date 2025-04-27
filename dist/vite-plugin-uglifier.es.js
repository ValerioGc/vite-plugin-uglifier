import fs from "fs/promises";
import path from "path";
function isValidCSSName(str) {
  return /^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(str);
}
function isRemappableToken(token) {
  const blacklistPatterns = [
    /^tspan\d+$/i,
    /^path\d+$/i,
    /^rect\d+$/i,
    /^circle\d+$/i
  ];
  return !blacklistPatterns.some((pattern) => pattern.test(token));
}
function getNewClassName(index) {
  let name = "";
  do {
    name = String.fromCharCode(97 + index % 26) + name;
    index = Math.floor(index / 26) - 1;
  } while (index >= 0);
  return name;
}
async function walkDir(dir) {
  let files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await walkDir(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}
function collectSelectorsFromCss(css) {
  const classes = /* @__PURE__ */ new Set();
  const ids = /* @__PURE__ */ new Set();
  const selectorBlocks = css.match(/([^{}]+){/g);
  if (selectorBlocks) {
    for (const block of selectorBlocks) {
      const selectorsStr = block.slice(0, -1).trim();
      const selectors = selectorsStr.split(",");
      for (const sel of selectors) {
        const trimmed = sel.trim();
        const tokenMatch = trimmed.match(
          /^([.#])([a-zA-Z_-][a-zA-Z0-9_-]*)/
        );
        if (tokenMatch && isValidCSSName(tokenMatch[2]) && isRemappableToken(tokenMatch[2])) {
          if (tokenMatch[1] === ".") classes.add(tokenMatch[2]);
          else if (tokenMatch[1] === "#") ids.add(tokenMatch[2]);
        }
      }
    }
  }
  return { classes, ids };
}
function replaceClassesInCss(css, mapping) {
  return css.replace(
    /\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g,
    (match, cls) => mapping[cls] ? "." + mapping[cls] : match
  );
}
function replaceIdsInCss(css, mapping) {
  return css.replace(
    /#([a-zA-Z_-][a-zA-Z0-9_-]*)/g,
    (match, id) => mapping[id] ? "#" + mapping[id] : match
  );
}
function replaceClassesInHtml(html, mapping) {
  return html.replace(/class\s*=\s*"([^"]+)"/g, (match, classContent) => {
    const newClasses = classContent.split(/\s+/).map((cls) => mapping[cls] || cls).join(" ");
    return `class="${newClasses}"`;
  });
}
function replaceIdsInHtml(html, mapping) {
  return html.replace(/id\s*=\s*"([^"]+)"/g, (match, idContent) => {
    return `id="${mapping[idContent] || idContent}"`;
  });
}
function replaceClassesInJs(js, mapping) {
  return js.replace(
    /(["'])([a-zA-Z_-][a-zA-Z0-9_-]*)\1/g,
    (match, quote, str) => mapping[str] ? `${quote}${mapping[str]}${quote}` : match
  );
}
function replaceIdsInJs(js, mapping) {
  return js.replace(
    /(["'])(#[a-zA-Z_-][a-zA-Z0-9_-]*)\1/g,
    (match, quote, token) => {
      const key = token.slice(1);
      return mapping[key] ? `${quote}#${mapping[key]}${quote}` : match;
    }
  );
}
function replaceCSSSelectorsInJs(js, classMapping, idMapping) {
  return js.replace(
    /(["'])([.#])([a-zA-Z_-][a-zA-Z0-9_-]*)\1/g,
    (match, quote, prefix, token) => {
      if (prefix === "." && classMapping[token]) {
        return `${quote}.${classMapping[token]}${quote}`;
      }
      if (prefix === "#" && idMapping[token]) {
        return `${quote}#${idMapping[token]}${quote}`;
      }
      return match;
    }
  );
}
function replaceClassListManipulationInJs(js, mapping) {
  return js.replace(
    /\.classList\.(add|remove|toggle)\(\s*["']([^"']+)["']\s*\)/g,
    (match, method, cls) => mapping[cls] ? `.classList.${method}("${mapping[cls]}")` : match
  );
}
function replaceClassNameAssignmentInJs(js, mapping) {
  return js.replace(
    /\.className\s*=\s*["']([^"]+)["']+/g,
    (match, classContent) => {
      const newClasses = classContent.split(/\s+/).map((cls) => mapping[cls] || cls).join(" ");
      return `.className = "${newClasses}"`;
    }
  );
}
function removeTextArgumentInJs(js) {
  return js.replace(
    /(i\([^,]+,[^,]+),\s*"[^"]+"\s*,\s*(-?\d+\))/g,
    "$1, $2"
  );
}
function vitePluginUglifier(options) {
  const opts = {
    enableLogging: true,
    include: [],
    exclude: [],
    renameId: true,
    ...options
  };
  function log(msg) {
    if (opts.enableLogging) console.log(msg);
  }
  function matchesFilter(file) {
    if (opts.include.length) {
      if (!opts.include.some((pat) => file.includes(pat))) return false;
    }
    if (opts.exclude.length) {
      if (opts.exclude.some((pat) => file.includes(pat))) return false;
    }
    return true;
  }
  let globalClassMapping = {};
  let globalIdMapping = {};
  return {
    name: "vite-plugin-uglifier",
    apply: "build",
    // 1) Collect all classes/IDs from src/**/*.css/.vue/.html
    async buildStart() {
      const files = await walkDir(path.resolve(process.cwd(), "src"));
      const classSet = /* @__PURE__ */ new Set();
      const idSet = /* @__PURE__ */ new Set();
      for (const f of files) {
        if (!matchesFilter(f)) continue;
        const content = await fs.readFile(f, "utf8");
        if (f.endsWith(".css")) {
          const { classes, ids } = collectSelectorsFromCss(content);
          classes.forEach((c) => classSet.add(c));
          if (opts.renameId) ids.forEach((i) => idSet.add(i));
        } else if (/\.(vue|html)$/.test(f)) {
          let m;
          const rx = /class\s*=\s*"([^"]+)"/g;
          while (m = rx.exec(content)) {
            m[1].split(/\s+/).forEach((c) => {
              if (isValidCSSName(c)) classSet.add(c);
            });
          }
        }
      }
      Array.from(classSet).sort().forEach((cls, i) => {
        globalClassMapping[cls] = getNewClassName(i);
      });
      if (opts.renameId) {
        Array.from(idSet).sort().forEach((id, i) => {
          globalIdMapping[id] = getNewClassName(i);
        });
      }
      log("Computed class mapping:");
      log(globalClassMapping);
      log("Computed ID mapping:");
      log(globalIdMapping);
    },
    // 2) Rename inside .css modules as they are loaded
    transform(code, id) {
      if (id.endsWith(".css") && matchesFilter(id)) {
        let c = replaceClassesInCss(code, globalClassMapping);
        c = replaceIdsInCss(c, globalIdMapping);
        return { code: c, map: null };
      }
    },
    // 3) Process JS chunks before minification
    renderChunk(code) {
      let c = replaceCSSSelectorsInJs(
        code,
        globalClassMapping,
        globalIdMapping
      );
      c = replaceClassListManipulationInJs(c, globalClassMapping);
      c = replaceClassNameAssignmentInJs(c, globalClassMapping);
      c = removeTextArgumentInJs(c);
      return { code: c, map: null };
    },
    // 4) Finally patch any leftover .css/.html in dist folder
    async closeBundle() {
      const out = path.resolve(process.cwd(), "dist");
      for (const f of await walkDir(out)) {
        if (!matchesFilter(f)) continue;
        let content = await fs.readFile(f, "utf8");
        if (f.endsWith(".css")) {
          content = replaceClassesInCss(
            content,
            globalClassMapping
          );
          content = replaceIdsInCss(content, globalIdMapping);
        } else if (f.endsWith(".html")) {
          content = replaceClassesInHtml(
            content,
            globalClassMapping
          );
          content = replaceIdsInHtml(content, globalIdMapping);
        }
        await fs.writeFile(f, content, "utf8");
        log(`Updated ${f}`);
      }
    }
  };
}
export {
  collectSelectorsFromCss,
  vitePluginUglifier as default,
  getNewClassName,
  isRemappableToken,
  isValidCSSName,
  removeTextArgumentInJs,
  replaceCSSSelectorsInJs,
  replaceClassListManipulationInJs,
  replaceClassNameAssignmentInJs,
  replaceClassesInCss,
  replaceClassesInHtml,
  replaceClassesInJs,
  replaceIdsInCss,
  replaceIdsInHtml,
  replaceIdsInJs
};

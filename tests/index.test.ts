import { describe, it, expect } from 'vitest';
import {
  replaceClassesInHtml,
  replaceIdsInHtml,
  replaceClassesInCss,
  replaceIdsInCss,
  replaceCSSSelectorsInJs,
  removeTextArgumentInJs,
  replaceClassListManipulationInJs,
  replaceClassNameAssignmentInJs,
  replaceClassesInJs,
  replaceIdsInJs,
} from '../src/index.mts';

// Mapping per i test di classi
const classMapping = {
  'btn_primary': 'q',
  'btn_secondary': 'r',
  'active': 'w',
  'modal_image': 'ff',
};

// Mapping per i test di ID
const idMapping = {
  'header': 'a',
};

// ----------------------------
// HTML/VUE Replacement Tests
// ----------------------------
describe('HTML/VUE Replacement Tests', () => {

  // static class attribute
  it('should replace static class attribute', () => {
    const input = `<div class="btn_primary"></div>`;
    const expected = `<div class="q"></div>`;
    expect(replaceClassesInHtml(input, classMapping)).toBe(expected);
  });

  // static id attribute
  it('should replace static id attribute', () => {
    const input = `<div id="header"></div>`;
    const expected = `<div id="a"></div>`;
    expect(replaceIdsInHtml(input, idMapping)).toBe(expected);
  });

  // dynamic :class binding (if present) should be ignored
  it("should not modify dynamic binding ':class' attribute", () => {
    const input = `<div :class="Condition ? 'btn_primary' : 'btn_secondary'"></div>`;
    expect(replaceClassesInHtml(input, classMapping)).toBe(input);
  });

  // dynamic :id binding (if present) should be ignored
  it("should not modify dynamic binding ':id' attribute", () => {
    const input = `<div :id="Condition ? 'header' : 'footer'"></div>`;
    expect(replaceIdsInHtml(input, idMapping)).toBe(input);
  });
});

// ----------------------------
// CSS Replacement Tests
// ----------------------------
describe('CSS Replacement Tests', () => {

  // .class selectors in CSS
  it('should replace class selector in CSS', () => {
    const input = `
        .btn_primary { color: red; }
        .other { display: block; }
    `;
    const expected = `
        .q { color: red; }
        .other { display: block; }
    `;
    expect(replaceClassesInCss(input, classMapping).trim()).toBe(expected.trim());
  });

  // #id selectors in CSS
  it('should replace id selector in CSS', () => {
    const input = `
        #header { margin: 0; }
        #footer { padding: 1rem; }
    `;
    const expected = `
        #a { margin: 0; }
        #footer { padding: 1rem; }
    `;
    expect(replaceIdsInCss(input, idMapping).trim()).toBe(expected.trim());
  });
});

// -------------------------------------
// JS Replacement Tests — Literal Selectors
// -------------------------------------
describe('JS Replacement Tests - Literal Selectors', () => {

  // document.querySelector(".class")
  it('should replace class in querySelector via replaceCSSSelectorsInJs', () => {
    const input = `document.querySelector(".btn_primary")`;
    const expected = `document.querySelector(".q")`;
    expect(replaceCSSSelectorsInJs(input, classMapping, idMapping)).toBe(expected);
  });

  // document.querySelector("#id")
  it('should replace id in querySelector via replaceCSSSelectorsInJs', () => {
    const input = `document.querySelector("#header")`;
    const expected = `document.querySelector("#a")`;
    expect(replaceCSSSelectorsInJs(input, classMapping, idMapping)).toBe(expected);
  });
});

// -------------------------------------
// JS Replacement Tests — classList & className
// -------------------------------------
describe('JS Replacement Tests - Other Methods', () => {
  
  // element.classList.add("class")
  it('should replace classList.add usage', () => {
    const input = `element.classList.add("btn_primary");`;
    const expected = `element.classList.add("q");`;
    expect(replaceClassListManipulationInJs(input, classMapping)).toBe(expected);
  });

  // element.className = "class other"
  it('should replace className assignment', () => {
    const input = `element.className = "btn_primary active"`;
    const expected = `element.className = "q w"`;
    expect(replaceClassNameAssignmentInJs(input, classMapping)).toBe(expected);
  });

  // i("p", {class:"class"}, "text", -1)
  it('should remove text argument in render function call', () => {
    const input = `i("p", {class:"btn_primary"}, " some text", -1)`;
    const expected = `i("p", {class:"btn_primary"}, -1)`;
    expect(removeTextArgumentInJs(input)).toBe(expected);
  });
});

// -------------------------------------
// JS Replacement Tests — General Literal Replacement
// -------------------------------------
describe('JS Replacement Tests - General Literal Replacement', () => {

  // console.log("class")
  it('should replace class literal in JS using replaceClassesInJs', () => {
    const input = `console.log("btn_primary")`;
    const expected = `console.log("q")`;
    expect(replaceClassesInJs(input, classMapping)).toBe(expected);
  });

  // console.log('#id')
  it('should replace id literal in JS using replaceIdsInJs', () => {
    const input = `console.log('#header')`;
    const expected = `console.log('#a')`;
    expect(replaceIdsInJs(input, idMapping)).toBe(expected);
  });
});

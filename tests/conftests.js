/* eslint-env node */
import crypto from "crypto";

Object.defineProperty(global.self, "crypto", {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length),
  },
});
browser.experiments.normandy = {
  checkRecipeFilter: () => null,
  runRecipe: () => null,
};
global.document.body.createTextRange = () => {
  return {
    setEnd: () => {},
    setStart: () => {},
    getBoundingClientRect: () => {},
    getClientRects: () => [],
  };
};
//Element.prototype.getClientRect = ()=>{return [0,0,0,0]};

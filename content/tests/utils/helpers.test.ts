import { splitCamelCase } from "devtools/utils/helpers";

describe("splitCamelCase", () => {
  describe("case: no-change", () => {
    it("should leave single words alone", () => {
      expect(splitCamelCase("single")).toEqual("single");
    });

    it("should split simple words", () => {
      expect(splitCamelCase("threeWordsTogether")).toEqual(
        "three words together",
      );
    });

    it("should handle capitals", () => {
      expect(splitCamelCase("parseURLToString")).toEqual("parse URL to string");
    });

    it("should handle a final letter", () => {
      expect(splitCamelCase("getX")).toEqual("get x");
    });
  });

  describe("case: title-case", () => {
    it("should handle a single word", () => {
      expect(splitCamelCase("single", { case: "title-case" })).toEqual(
        "Single",
      );
    });

    it("should split simple words", () => {
      expect(
        splitCamelCase("threeWordsTogether", { case: "title-case" }),
      ).toEqual("Three Words Together");
    });

    it("should handle capitals", () => {
      expect(
        splitCamelCase("parseURLToString", { case: "title-case" }),
      ).toEqual("Parse URL To String");
    });

    it("should handle a final letter", () => {
      expect(splitCamelCase("getX", { case: "title-case" })).toEqual("Get X");
    });
  });
});

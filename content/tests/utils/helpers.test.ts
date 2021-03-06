import {
  compare,
  makeCompare,
  splitCamelCase,
  normalizeServerValidationErrors,
} from "devtools/utils/helpers";

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

    it("should have special cases for some acronyms", () => {
      expect(splitCamelCase("experimentDocumentUrl")).toEqual(
        "experiment document URL",
      );
      expect(splitCamelCase("extensionApiId")).toEqual("extension API ID");

      // it shouldn't be too eager and replace those acronyms inside words
      expect(splitCamelCase("curlLidMegapixels")).toEqual(
        "curl lid megapixels",
      );
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

    it("should have special cases for some acronyms", () => {
      expect(
        splitCamelCase("experimentDocumentUrl", { case: "title-case" }),
      ).toEqual("Experiment Document URL");
      expect(splitCamelCase("extensionApiId", { case: "title-case" })).toEqual(
        "Extension API ID",
      );

      // it shouldn't be too eager though
      expect(
        splitCamelCase("curlLidMegapixels", { case: "title-case" }),
      ).toEqual("Curl Lid Megapixels");
    });
  });
});

describe("compare", () => {
  it("should be able to compare numbers", () => {
    // Believe it or not, the default sort comparator would fail this test,
    // since it sorts by the string representation
    const data = [10, 2, 3, 20];
    data.sort(compare);
    expect(data).toEqual([2, 3, 10, 20]);
  });

  it("should be able to compare strings", () => {
    const data = ["cherry", "apple", "banana"];
    data.sort(compare);
    expect(data).toEqual(["apple", "banana", "cherry"]);
  });
});

describe("makeCompare", () => {
  it("can be used to make a key-comparator", () => {
    const data = [
      { id: 1, x: 1, y: 3 },
      { id: 2, x: 3, y: 1 },
      { id: 3, x: 2, y: 2 },
    ];

    data.sort(makeCompare((obj) => obj.x));
    expect(data.map((obj) => obj.id)).toEqual([1, 3, 2]);

    data.sort(makeCompare((obj) => obj.y));
    expect(data.map((obj) => obj.id)).toEqual([2, 3, 1]);

    data.sort(makeCompare((obj) => obj.id));
    expect(data.map((obj) => obj.id)).toEqual([1, 2, 3]);
  });
});

describe("normalizeServerValidationErrors", () => {
  it("preserve basic errors", () => {
    expect(normalizeServerValidationErrors({})).toEqual({});

    const error = {
      recipe_id: ["wrong slug"],
    };
    expect(normalizeServerValidationErrors(error)).toEqual(error);
  });

  it("puts single errors as lists", () => {
    const error = {
      argument: "bad",
    };
    expect(normalizeServerValidationErrors(error)).toEqual({
      argument: ["bad"],
    });
  });

  it("flattens errors", () => {
    const error = {
      arguments: {
        branches: {
          0: {
            slug: "bad",
          },
        },
      },
    };
    expect(normalizeServerValidationErrors(error)).toEqual({
      "arguments.branches.0.slug": ["bad"],
    });
  });
});

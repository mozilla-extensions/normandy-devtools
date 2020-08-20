import { render, cleanup } from "@testing-library/react";
import React from "react";

import GenericArguments from "devtools/components/recipes/details/arguments/GenericArguments";

afterEach(async () => {
  jest.clearAllMocks();
  await cleanup();
});

describe("GenericArguments", () => {
  it("should sorts items by keys, and branches are alway at the end", () => {
    const doc = render(
      <GenericArguments
        data={{
          banana: "yellow",
          apple: "green",
          branches: "brown",
          cherry: "red",
        }}
      />,
    );
    const textContents = doc.getAllByText(/.+/).map((el) => el.textContent);
    expect(textContents).toEqual([
      "Apple",
      "green",
      "Banana",
      "yellow",
      "Cherry",
      "red",
      "Branches",
      "brown",
    ]);
  });

  it("should show keys with an empty value specially", () => {
    const doc = render(<GenericArguments data={{ empty: "" }} />);
    const textContents = doc.getAllByText(/.+/).map((el) => el.textContent);
    expect(textContents).toEqual(["Empty", "(no value set)"]);
    const emptyValue = doc.getByText("(no value set)");
    expect(emptyValue.tagName.toLowerCase()).toEqual("code");
  });

  it("should show booleans specially", () => {
    const doc = render(<GenericArguments data={{ yes: true, no: false }} />);

    const trueEl = doc.getByText("True");
    expect(trueEl).toHaveClass("rs-tag-text");
    expect(trueEl.parentElement).toHaveClass("rs-tag-green");

    const falseEl = doc.getByText("False");
    expect(falseEl).toHaveClass("rs-tag-text");
    expect(falseEl.parentElement).toHaveClass("rs-tag-red");
  });

  it("should show booleans with an 'is' prefix specially", () => {
    const doc = render(
      <GenericArguments data={{ isYes: true, isNo: false }} />,
    );

    const yesEl = doc.getByText("Yes");
    expect(yesEl).toHaveClass("rs-tag-text");
    expect(yesEl.parentElement).toHaveClass("rs-tag-green");

    const noEl = doc.getByText("No");
    expect(noEl).toHaveClass("rs-tag-text");
    expect(noEl.parentElement).toHaveClass("rs-tag-red");
  });

  it("should recurse and show lists for arrays", () => {
    const doc = render(
      <GenericArguments
        data={{
          items: [
            { a: 1, b: 2 },
            { c: 3, d: 4 },
          ],
        }}
      />,
    );
    const textContents = doc.getAllByText(/.+/).map((el) => el.textContent);
    expect(textContents).toEqual([
      "Items",
      "A",
      "1",
      "B",
      "2",
      "C",
      "3",
      "D",
      "4",
    ]);
  });
});

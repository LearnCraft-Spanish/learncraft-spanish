import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import QuizButtons from "./QuizButtons";

const decrementExample = vi.fn();
const incrementExample = vi.fn();

function renderQuizButtons() {
  render(
    <QuizButtons
      decrementExample={decrementExample}
      incrementExample={incrementExample}
      firstExample={false}
      lastExample={false}
    />,
  );
}
describe("component QuizButtons", () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders correctly", () => {
    renderQuizButtons();
    expect(screen.getByText("Previous")).toBeTruthy();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("calls decrementExample when the Previous button is clicked", () => {
    renderQuizButtons();
    screen.getByText("Previous").click();
    expect(decrementExample).toHaveBeenCalledOnce();
  });

  it("calls incrementExample when the Next button is clicked", () => {
    renderQuizButtons();
    screen.getByText("Next").click();
    expect(incrementExample).toHaveBeenCalledOnce();
  });
  it("disables the Previous button when firstExample is true", () => {
    render(
      <QuizButtons
        decrementExample={decrementExample}
        incrementExample={incrementExample}
        firstExample
        lastExample={false}
      />,
    );
    expect(screen.getByText("Previous").attributes).toHaveProperty("disabled");
  });
  it("disables the Next button when lastExample is true", () => {
    render(
      <QuizButtons
        decrementExample={decrementExample}
        incrementExample={incrementExample}
        firstExample={false}
        lastExample
      />,
    );
    expect(screen.getByText("Next").attributes).toHaveProperty("disabled");
  });
});

import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";
import { expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";

expect.extend(axeMatchers);

// The character builder is lazy-loaded; give it room when the suite runs in parallel.
configure({ asyncUtilTimeout: 5000 });

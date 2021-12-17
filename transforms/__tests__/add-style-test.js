// jest.mock("../add-style", () => {
//   return Object.assign(require.requireActual("../add-style"), {
//     parser: "babylon",
//   });
// });

const tests = ["basic"];

const defineTest = require("jscodeshift/dist/testUtils").defineTest;
const defineInlineTest = require("jscodeshift/dist/testUtils").defineInlineTest;
const transform = require("../add-style");

describe("add-style", () => {
  defineInlineTest(
    transform,
    {},
    `import { Button } from 'antd';`,
    `import { Button } from 'antd';\r\nimport "antd/lib/button/style/css";
    `,
    "basic"
  );
});
//defineTest(__dirname, "add-style", null, "basic",{});

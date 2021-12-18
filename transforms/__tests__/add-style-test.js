const defineInlineTest = require("jscodeshift/dist/testUtils").defineInlineTest;
const transform = require("../add-style");

describe("add-style", () => {
  defineInlineTest(
    transform,
    {},
    `import { Button } from 'antd';`,
    `import { Button } from 'antd';\r\nimport "antd/lib/button/style/css";
    `,
    "基础"
  );

  defineInlineTest(
    transform,
    {},
    `import { Button } from 'antd';\r\nimport "antd/lib/button/style/css";`,
    `import { Button } from 'antd';\r\nimport "antd/lib/button/style/css";`,
    "不重复添加"
  );

  defineInlineTest(
    transform,
    {
      "libraryName": "pkg",
      "libraryDirectory": "pkg-lib",   // default: lib
      "style": "less"
    },
    `import { Button } from 'antd';`,
    `import { Button } from 'antd';\r\nimport "pkg/pkg-lib/button/style/less";`,
    "配置文件读取"
  );

  defineInlineTest(
    transform,
    {
      "libraryName": "antd",
      "libraryDirectory": "lib",   // default: lib
      "style": true
    },
    `import { Button } from 'antd';`,
    `import { Button } from 'antd';\r\nimport "antd/lib/button/style/index";`,
    "配置文件读取 style:true"
  );
});

const fs = require("fs");
/**
 *
 * @type {import('jscodeshift').Transform}
 */
module.exports = function (file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  /**
   *
   * @param {import('jscodeshift').JSCodeshift} j
   * @param {import('jscodeshift').Collection<any>} root
   */
  function addAntdStyleImport(j, root) {
    //获得所有antd的导入  " import { XX } from 'antd' "
    const importDeclarations = root.find(j.ImportDeclaration, {
      source: { value: "antd" },
    });
    const styleImportDeclarations = root
      .find(j.ImportDeclaration, (value) => {
        const noSpecifiers = !value.specifiers || value.specifiers.length === 0;
        const raw = value.source.raw || "";
        return noSpecifiers && raw.startsWith("antd/lib/xx/style/css");
      })
      .map((it) => it.node.source.raw);

    // todo 不能重复导入
    importDeclarations.forEach((path) => {
      if (path.value.specifiers) {
        //每个组件名称
        path.value.specifiers.forEach((spec) => {
          const name = spec.imported.name.toLowerCase();
          //构建导入
          const importStatement = j.importDeclaration(
            [],
            j.literal(`antd/lib/${name}/style/css`)
          );
          //插入
          path.insertAfter(importStatement);
        });
      }
    });
  }

  addAntdStyleImport(j, root);
  console.log(options)
  return root.toSource(options.printOptions, {
    quote: "single",
  });
};

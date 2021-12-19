/**
 * @typedef {Object} Option
 * @property {string} libraryName - 包名称 例如 antd.
 * @property {string} libraryDirectory - 组件文件夹名 例如 lib 或 es.
 * @property {boolean|string} style - 导入的样式类型.
 */

const importDeclarationRegExp = new RegExp(/antd\/(lib|es)\/([a-z]+)\/style\/(index|css)/)


/**
 *
 * @param {import('jscodeshift').JSCodeshift} j
 * @param {import('jscodeshift').Collection<any>} root
*/
function findAntdStyleImport(j, root, options) {
  const names = []
  root
    .find(j.ImportDeclaration, (value) => {
      const noSpecifiers = !value.specifiers || value.specifiers.length === 0;
      const raw = value.source.raw || "";
      return importDeclarationRegExp.test(raw) && noSpecifiers
    })
    .forEach((it) => {
      names.push(it.value.source.value)
    });
  return names
}

/**
 *
 * @param {string} name
 * @param {Option} options
 * @returns {string} import like 'import "antd/lib/button/style/css"'
*/
function buildImport(name, options) {
  let styleType = 'css'
  if (typeof options.style === 'string') {
    styleType = options.style
  } else if (typeof options.style === 'boolean' && options.style) {
    styleType = 'index'
  }

  return `${options.libraryName || 'antd'}/${options.libraryDirectory || 'lib'}/${name}/style/${styleType}`
}

/**
 *
 * @type {import('jscodeshift').Transform}
 */
/**
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 * @param {Option} options
*/
module.exports = function (file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const styleImportDeclarations = findAntdStyleImport(j, root)
  /**
   * 
   * @param {import('jscodeshift').ImportDeclaration} path 
   */
  function insertStyleImport(path) {
    if (path.value.specifiers) {
      //每个组件名称
      path.value.specifiers.forEach((spec) => {
        const name = spec.imported.name.toLowerCase();
        const newStyleImport = buildImport(name, options)
        const oldStyleImport = styleImportDeclarations.find(it => it.match(importDeclarationRegExp))
        //构建导入
        if (!oldStyleImport) {
          const importStatement = j.importDeclaration(
            [],
            j.literal(newStyleImport)
          );
          //插入
          path.insertAfter(importStatement);
        } else {
          const array = importDeclarationRegExp.exec(oldStyleImport)
          if (array[1] !== options.libraryDirectory || array[3] !== options.style) {
            console.log(`
              > ${file.path || ""} 现有的样式导入[${oldStyleImport}]与配置[${newStyleImport}]不符合 
            `)
          }
        }

      });
    }

  }

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

    importDeclarations.forEach(insertStyleImport);
  }

  addAntdStyleImport(j, root);

  return root.toSource();
};

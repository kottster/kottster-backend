import fs from "fs";
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import generate from '@babel/generator';
import { FileProcedure } from "../models/procedure.model";
import { PROJECT_DIR } from "../constants/projectDir";
import { Stage } from "../models/stage.model";

/**
 * Service to extract the code from the file
 */
export class CodeExtractor {

  /**
   * Get the procedures for a component
   * @param pageId The id of the page
   * @param componentType The type of the component
   * @param componentId The id of the component
   */
  public async getComponentProceduresFromFile(pageId: string, componentType: string, componentId: string): Promise<FileProcedure[]> {
    const filePath = `${PROJECT_DIR}/src/__generated__/dev/procedures/page_${pageId}_${componentType}_${componentId}.js`;
  
    // If the file doesn't exist, return an empty array
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const ast = parse(fileContent, {
      sourceType: 'module',
      plugins: [],
    });

    const procedures: FileProcedure[] = [];

    // TODO: store AST in file to avoid parsing JavaScript files
    // Parse the file content
    traverse(ast, {
      CallExpression(path) {
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.object, { name: 'app' }) &&
          t.isIdentifier(path.node.callee.property) &&
          path.node.callee.property.name === 'registerProceduresForComponent'
        ) {
          const proceduresObject = path.node.arguments[4];

          if (t.isObjectExpression(proceduresObject)) {
            proceduresObject.properties.forEach((property) => {
              if (t.isObjectProperty(property) && (t.isStringLiteral(property.key) || t.isIdentifier(property.key))) {
                const procedureName = t.isStringLiteral(property.key) ? property.key.value : property.key.name;

                if (t.isFunctionExpression(property.value) || t.isArrowFunctionExpression(property.value)) {
                  const functionBody = generate(property.value, { retainFunctionParens: true, retainLines: true, compact: false }).code;

                  procedures.push({
                    stage: Stage.development,
                    pageId,
                    componentType,                
                    componentId,
                    procedureName,
                    functionBody: functionBody.trim(),
                    filePath,
                  });
                }          
              }
            });
          }
        }
      },
    });

    return procedures;
  }
}
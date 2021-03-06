﻿import * as ts from "typescript";
import {removeCommaSeparatedChild} from "./../../manipulation";
import {VariableDeclarationStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {InitializerExpressionableNode, BindingNamedNode, TypedNode} from "./../base";
import {VariableStatement} from "./VariableStatement";

export const VariableDeclarationBase = TypedNode(InitializerExpressionableNode(BindingNamedNode(Node)));
export class VariableDeclaration extends VariableDeclarationBase<ts.VariableDeclaration> {
    /**
     * Fills this node with the specified structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<VariableDeclarationStructure>) {
        callBaseFill(VariableDeclarationBase.prototype, this, structure);
        return this;
    }

    /**
     * Removes this variable declaration.
     */
    remove() {
        const variableStatement = this.getParentIfKindOrThrow(ts.SyntaxKind.VariableDeclarationList)
            .getParentIfKindOrThrow(ts.SyntaxKind.VariableStatement) as VariableStatement;
        const declarations = variableStatement.getDeclarations();
        if (declarations.length === 1)
            variableStatement.remove();
        else
            removeCommaSeparatedChild(this, { removePrecedingSpaces: declarations[0] === this ? false : undefined });
    }
}

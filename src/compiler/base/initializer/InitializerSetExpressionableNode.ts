﻿import * as ts from "typescript";
import {Constructor} from "./../../../Constructor";
import * as errors from "./../../../errors";
import {InitializerSetExpressionableNodeStructure} from "./../../../structures";
import {callBaseFill} from "./../../callBaseFill";
import {insertIntoParent, removeChildren} from "./../../../manipulation";
import {Node, Expression} from "./../../common";
import {InitializerGetExpressionableNode} from "./InitializerGetExpressionableNode";

export type InitializerSetExpressionableExtensionType = Node<ts.Node & { initializer?: ts.Expression; }> & InitializerGetExpressionableNode;

export interface InitializerSetExpressionableNode {
    /**
     * Removes the initailizer.
     */
    removeInitializer(): this;
    /**
     * Sets the initializer.
     * @param text - New text to set for the initializer.
     */
    setInitializer(text: string): this;
}

export function InitializerSetExpressionableNode<T extends Constructor<InitializerSetExpressionableExtensionType>>(Base: T): Constructor<InitializerSetExpressionableNode> & T {
    return class extends Base implements InitializerSetExpressionableNode {
        removeInitializer() {
            const initializer = this.getInitializer();
            if (initializer == null)
                return this;
            const previousSibling = initializer.getPreviousSiblingIfKindOrThrow(ts.SyntaxKind.FirstAssignment);

            removeChildren({
                children: [previousSibling, initializer],
                removePrecedingSpaces: true
            });
            return this;
        }

        setInitializer(text: string) {
            errors.throwIfNotStringOrWhitespace(text, nameof(text));

            if (this.hasInitializer())
                this.removeInitializer();

            const semiColonToken = this.getLastChildIfKind(ts.SyntaxKind.SemicolonToken);

            insertIntoParent({
                insertPos: semiColonToken != null ? semiColonToken.getPos() : this.getEnd(),
                childIndex: semiColonToken != null ? semiColonToken.getChildIndex() : this.getChildCount(),
                insertItemsCount: 2,
                parent: this,
                newText: ` = ${text}`
            });
            return this;
        }

        fill(structure: Partial<InitializerSetExpressionableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.initializer != null)
                this.setInitializer(structure.initializer);

            return this;
        }
    };
}

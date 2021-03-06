﻿import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {insertIntoCreatableSyntaxList, removeChildrenWithFormattingFromCollapsibleSyntaxList, FormattingKind} from "./../../manipulation";
import {ArrayUtils} from "./../../utils";
import {Node} from "./../common";

export type ModiferableNodeExtensionType = Node;
export type ModifierTexts = "export" | "default" | "declare" | "abstract" | "public" | "protected" | "private" | "readonly" | "static" | "async" | "const";

export interface ModifierableNode {
    /**
     * Gets the node's modifiers.
     */
    getModifiers(): Node[];
    /**
     * Gets the first modifier of the specified syntax kind or throws if none found.
     * @param kind - Syntax kind.
     */
    getFirstModifierByKindOrThrow(kind: ts.SyntaxKind): Node<ts.Modifier>;
    /**
     * Gets the first modifier of the specified syntax kind or undefined if none found.
     * @param kind - Syntax kind.
     */
    getFirstModifierByKind(kind: ts.SyntaxKind): Node<ts.Modifier> | undefined;
    /**
     * Gets if it has the specified modifier.
     * @param kind - Syntax kind to check for.
     */
    hasModifier(kind: ts.SyntaxKind): boolean;
    /**
     * Gets if it has the specified modifier.
     * @param text - Text to check for.
     */
    hasModifier(text: ModifierTexts): boolean;
    /**
     * Toggles a modifier.
     * @param text - Text to toggle the modifier for.
     * @param value - Optional toggling value.
     */
    toggleModifier(text: ModifierTexts, value?: boolean): this;
    /**
     * Add a modifier with the specified text.
     * @param text - Modifier text to add.
     * @returns The added modifier.
     * @internal
     */
    addModifier(text: ModifierTexts): Node<ts.Modifier>;
    /**
     * Removes a modifier based on the specified text.
     * @param text - Modifier text to remove.
     * @returns If the modifier was removed
     * @internal
     */
    removeModifier(text: ModifierTexts): boolean;
}

export function ModifierableNode<T extends Constructor<ModiferableNodeExtensionType>>(Base: T): Constructor<ModifierableNode> & T {
    return class extends Base implements ModifierableNode {
        getModifiers() {
            return this.compilerNode.modifiers == null ? [] : this.compilerNode.modifiers.map(m => this.global.compilerFactory.getNodeFromCompilerNode(m, this.sourceFile));
        }

        getFirstModifierByKindOrThrow(kind: ts.SyntaxKind) {
            return errors.throwIfNullOrUndefined(this.getFirstModifierByKind(kind), `Expected a modifier of syntax kind: ${ts.SyntaxKind[kind]}`);
        }

        getFirstModifierByKind(kind: ts.SyntaxKind) {
            for (const modifier of this.getModifiers()) {
                if (modifier.getKind() === kind)
                    return modifier as Node<ts.Modifier>;
            }

            return undefined;
        }

        hasModifier(kind: ts.SyntaxKind): boolean;
        hasModifier(text: ModifierTexts): boolean;
        hasModifier(textOrKind: ModifierTexts | ts.SyntaxKind) {
            if (typeof textOrKind === "string")
                return this.getModifiers().some(m => m.getText() === textOrKind);
            else
                return this.getModifiers().some(m => m.getKind() === textOrKind);
        }

        toggleModifier(text: ModifierTexts, value?: boolean) {
            if (value == null)
                value = !this.hasModifier(text);

            if (value)
                this.addModifier(text);
            else
                this.removeModifier(text);

            return this;
        }

        addModifier(text: ModifierTexts): Node<ts.Modifier> {
            const modifiers = this.getModifiers();
            const hasModifier = modifiers.some(m => m.getText() === text);
            if (hasModifier)
                return ArrayUtils.find(this.getModifiers(), m => m.getText() === text) as Node<ts.Modifier>;

            // get insert position & index
            const {insertPos, insertIndex} = getInsertInfo(this);

            // insert setup
            let startPos: number;
            let newText: string;
            const isFirstModifier = modifiers.length === 0 || insertPos === modifiers[0].getStart();
            if (isFirstModifier) {
                newText = text + " ";
                startPos = insertPos;
            }
            else {
                newText = " " + text;
                startPos = insertPos + 1;
            }

            // insert
            insertIntoCreatableSyntaxList({
                parent: this,
                insertPos,
                newText,
                syntaxList: modifiers.length === 0 ? undefined : modifiers[0].getParentSyntaxListOrThrow(),
                childIndex: insertIndex,
                insertItemsCount: 1
            });

            return ArrayUtils.find(this.getModifiers(), m => m.getStart() === startPos) as Node<ts.Modifier>;

            function getInsertInfo(node: ModifierableNode & Node) {
                let pos = getInitialInsertPos();
                let index = 0;
                for (const addAfterText of getAddAfterModifierTexts(text)) {
                    for (let i = 0; i < modifiers.length; i++) {
                        const modifier = modifiers[i];
                        if (modifier.getText() === addAfterText) {
                            if (pos < modifier.getEnd()) {
                                pos = modifier.getEnd();
                                index = i + 1;
                            }
                            break;
                        }
                    }
                }
                return { insertPos: pos, insertIndex: index };

                function getInitialInsertPos() {
                    if (modifiers.length > 0)
                        return modifiers[0].getStart();
                    for (const child of node.getChildrenIterator()) {
                        // skip over any initial syntax lists (ex. decorators) or js docs
                        if (child.getKind() === ts.SyntaxKind.SyntaxList || ts.isJSDocCommentContainingNode(child.compilerNode))
                            continue;
                        return child.getStart();
                    }
                    return node.getStart();
                }
            }
        }

        removeModifier(text: ModifierTexts) {
            const modifier = ArrayUtils.find(this.getModifiers(), m => m.getText() === text);
            if (modifier == null)
                return false;

            removeChildrenWithFormattingFromCollapsibleSyntaxList({
                children: [modifier],
                getSiblingFormatting: () => FormattingKind.Space
            });
            return true;
        }
    };
}

/**
 * @returns The texts the specified text should appear after.
 */
function getAddAfterModifierTexts(text: ModifierTexts): ModifierTexts[] {
    switch (text) {
        case "export":
            return [];
        case "default":
            return ["export"];
        case "declare":
            return ["export", "default"];
        case "abstract":
            return ["export", "default", "declare", "public", "private", "protected"];
        case "readonly":
            return ["export", "default", "declare", "public", "private", "protected", "abstract", "static"];
        case "public":
        case "protected":
        case "private":
            return [];
        case "static":
            return ["public", "protected", "private"];
        case "async":
            return ["export", "public", "protected", "private", "static", "abstract"];
        case "const":
            return [];
        /* istanbul ignore next */
        default:
            throw new errors.NotImplementedError(`Not implemented modifier: ${text}`);
    }
}

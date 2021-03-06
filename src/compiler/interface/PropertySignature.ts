﻿import * as ts from "typescript";
import {removeInterfaceMember} from "./../../manipulation";
import {PropertySignatureStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {PropertyNamedNode, TypedNode, InitializerExpressionableNode, QuestionTokenableNode, ReadonlyableNode, DocumentationableNode, ModifierableNode,
    ChildOrderableNode} from "./../base";

export const PropertySignatureBase = ChildOrderableNode(DocumentationableNode(ReadonlyableNode(QuestionTokenableNode(InitializerExpressionableNode(TypedNode(
    PropertyNamedNode(ModifierableNode(Node))
))))));
export class PropertySignature extends PropertySignatureBase<ts.PropertySignature> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<PropertySignatureStructure>) {
        callBaseFill(PropertySignatureBase.prototype, this, structure);

        return this;
    }

    /**
     * Removes this property signature.
     */
    remove() {
        removeInterfaceMember(this);
    }
}

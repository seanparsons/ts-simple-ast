﻿import * as ts from "typescript";
import {GlobalContainer} from "./../../../GlobalContainer";
import {Memoize} from "./../../../utils";
import {ReferenceEntry} from "./ReferenceEntry";
import {ReferencedSymbolDefinitionInfo} from "./ReferencedSymbolDefinitionInfo";

/**
 * Referenced symbol.
 */
export class ReferencedSymbol {
    /** @internal */
    protected readonly global: GlobalContainer;
    /** @internal */
    private readonly _compilerObject: ts.ReferencedSymbol;
    /** @internal */
    private readonly references: ReferenceEntry[];

    /**
     * @internal
     */
    constructor(global: GlobalContainer, compilerObject: ts.ReferencedSymbol) {
        this.global = global;
        this._compilerObject = compilerObject;

        // it's important to store the references so that the nodes referenced inside will point
        // to the right node in case the user does manipulation between getting this object and getting the references
        this.references = this.compilerObject.references.map(r => new ReferenceEntry(global, r));
    }

    /**
     * Gets the compiler referenced symbol.
     */
    get compilerObject() {
        return this._compilerObject;
    }

    /**
     * Gets the definition.
     */
    @Memoize
    getDefinition() {
        return new ReferencedSymbolDefinitionInfo(this.global, this.compilerObject.definition);
    }

    /**
     * Gets the references.
     */
    getReferences() {
        return this.references;
    }
}

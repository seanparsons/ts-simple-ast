﻿import * as ts from "typescript";
import {Identifier, ComputedPropertyName, PropertyAssignment, ShorthandPropertyAssignment, SpreadAssignment} from "./common";
import {GetAccessorDeclaration, SetAccessorDeclaration, MethodDeclaration} from "./class";
import {StringLiteral, NumericLiteral} from "./literal";

export type PropertyName = Identifier | StringLiteral | NumericLiteral | ComputedPropertyName;

/* istanbul ignore next */
function propertyNameAliasValidation() {
    const value: ts.PropertyName = null as any;
    switch (value.kind) {
        case ts.SyntaxKind.Identifier:
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NumericLiteral:
        case ts.SyntaxKind.ComputedPropertyName:
            return;
        default:
            const ensureNever: never = value;
    }
}

export type AccessorDeclaration = GetAccessorDeclaration | SetAccessorDeclaration;

/* istanbul ignore next */
function accessorDeclarationAliasValidation() {
    const value: ts.AccessorDeclaration = null as any;
    switch (value.kind) {
        case ts.SyntaxKind.SetAccessor:
        case ts.SyntaxKind.GetAccessor:
            return;
        default:
            const ensureNever: never = value;
    }
}

export type ObjectLiteralElementLike = PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | MethodDeclaration | AccessorDeclaration;

/* istanbul ignore next */
function objectLiteralElementLikeAliasValidation() {
    const value: ts.ObjectLiteralElementLike = null as any;
    switch (value.kind) {
        case ts.SyntaxKind.PropertyAssignment:
        case ts.SyntaxKind.ShorthandPropertyAssignment:
        case ts.SyntaxKind.SpreadAssignment:
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.SetAccessor:
        case ts.SyntaxKind.GetAccessor:
            return;
        default:
            const ensureNever: never = value;
    }
}

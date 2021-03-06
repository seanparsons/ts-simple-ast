﻿import * as path from "path";
import TsSimpleAst, {NewLineKind} from "./../../src/main";
import {rootFolder} from "./../config";

export function getAst() {
    const ast = new TsSimpleAst({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.json"),
        manipulationSettings: {
            newLineKind: NewLineKind.CarriageReturnLineFeed
        }
    });
    ast.addSourceFiles(path.join(rootFolder, "src/**/*{.d.ts,.ts}"));
    return ast;
}

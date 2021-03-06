﻿import {expect} from "chai";
import {JSDoc} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(JSDoc), () => {
    describe(nameof<JSDoc>(d => d.remove), () => {
        function doTest(text: string, index: number, jsDocIndex: number, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getFunctions()[index].getDocumentationCommentNodes()[jsDocIndex].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the js doc", () => {
            doTest("enum I {}\n\n/** Test */\nfunction func() {}", 0, 0, "enum I {}\n\nfunction func() {}");
        });

        it("should remove the js doc when first", () => {
            doTest("enum I {}\n\n/** first */\n/** second */\nfunction func() {}", 0, 0, "enum I {}\n\n/** second */\nfunction func() {}");
        });

        it("should remove the js doc when in the middle", () => {
            doTest("enum I {}\n\n/** first */\n/** second */\n/** third */\nfunction func() {}", 0, 1, "enum I {}\n\n/** first */\n/** third */\nfunction func() {}");
        });

        it("should remove the js doc when last", () => {
            doTest("enum I {}\n\n/** first */\n/** second */\nfunction func() {}", 0, 1, "enum I {}\n\n/** first */\nfunction func() {}");
        });
    });

    describe(nameof<JSDoc>(d => d.getComment), () => {
        function doTest(text: string, expectedComment: string | undefined) {
            const {sourceFile} = getInfoFromText(text);
            const comment = sourceFile.getFunctions()[0].getDocumentationCommentNodes()[0].getComment();
            expect(comment).to.equal(expectedComment);
        }

        it("should get the comment when it exists", () => {
            doTest("/**\n * Description\n */function identifier() {}", "Description");
        });

        it("should be undefined when it doesn't exist", () => {
            doTest("/**\n *\n */function identifier() {}", undefined);
        });
    });

    describe(nameof<JSDoc>(d => d.setComment), () => {
        function doTest(text: string, comment: string, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getFunctions()[0].getDocumentationCommentNodes()[0].setComment(comment);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should set a new comment with one line", () => {
            doTest("/**\n * Description\n */function identifier() {}", "New Text", "/**\n * New Text\n */function identifier() {}");
        });

        it("should set a new comment with multiple lines", () => {
            doTest("/**\n * Description\n */function identifier() {}", "One\nTwo\r\nThree", "/**\n * One\n * Two\n * Three\n */function identifier() {}");
        });

        it("should set a new comment when originally all on the same line", () => {
            doTest("/** Description */function identifier() {}", "New", "/**\n * New\n */function identifier() {}");
        });

        it("should set a new comment without affecting the tags", () => {
            doTest("/**\n * Description\n * @param - Something */function identifier() {}", "New", "/**\n * New\n * @param - Something */function identifier() {}");
        });

        it("should set a new comment without affecting the tags when the first tag has some space before it", () => {
            doTest("/**\n * Description\n *   @param - Something */function identifier() {}", "New", "/**\n * New\n *   @param - Something */function identifier() {}");
        });
    });

    describe(nameof<JSDoc>(d => d.getTags), () => {
        function doTest(text: string, expectedTags: string[]) {
            const {sourceFile} = getInfoFromText(text);
            const tags = sourceFile.getFunctions()[0].getDocumentationCommentNodes()[0].getTags();
            expect(tags.map(t => t.getText())).to.deep.equal(expectedTags);
        }

        it("should return an empty array when no tags exist", () => {
            doTest("/**\n * Description\n */function identifier() {}", []);
        });

        it("should return the tags when they exist", () => {
            doTest("/**\n * Description\n * @param test - Test\n * @returns A value\n */function identifier() {}", ["@param test ", "@returns "]);
        });
    });
});

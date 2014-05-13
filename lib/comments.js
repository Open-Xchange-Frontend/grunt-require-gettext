'use strict';
module.exports =  (function () {
    function isBetweenTokens(comment, prevToken, token) {
        return comment.range[0] >= prevToken.range[1] && comment.range[1] <= token.range[0];
    }

    function getComment(ast, node) {
        var tokenIndex;
        var currentIndex, min = 0, max = ast.tokens.length;
        while (tokenIndex === undefined) {
            currentIndex = Math.floor((min + max) / 2);
            if (ast.tokens[currentIndex].loc.start.line < node.loc.start.line) {
                min = currentIndex;
                continue;
            } else if (ast.tokens[currentIndex].loc.start.line > node.loc.start.line) {
                max = currentIndex;
                continue;
            } else if (ast.tokens[currentIndex].loc.start.column < node.loc.start.column) {
                min = currentIndex;
                continue;
            } else if (ast.tokens[currentIndex].loc.start.column > node.loc.start.column) {
                max = currentIndex;
                continue;
            }
            tokenIndex = currentIndex;
        }
        while (ast.tokens[currentIndex].loc.start.line === node.loc.start.line) {
            //use currentIndex variable to get the first index in a line
            currentIndex--;
        }

        var commentObj = ast.comments.filter(function (comment) {
            var commentBeforeToken = isBetweenTokens(comment, ast.tokens[tokenIndex - 1], ast.tokens[tokenIndex]);
            var commentInLinesAbove = isBetweenTokens(comment, ast.tokens[currentIndex], ast.tokens[currentIndex + 1]);

            return (commentBeforeToken || commentInLinesAbove);
        }).map(function (commentInRange) {
            return commentInRange.value;
        }).join('\n');

        return commentObj;
    }

    return {
        getComment: getComment
    };
}());
